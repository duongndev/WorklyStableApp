import { Alert } from 'react-native';

/**
 * Utility class để xử lý các async thunk responses một cách consistent
 * Enhanced với error handling, logging, và callbacks
 */
export class AsyncThunkHandler {
  /**
   * Xử lý kết quả của async thunk với error handling nâng cao
   * @param {Object} resultAction - Kết quả từ dispatch async thunk
   * @param {Object} thunkAction - Async thunk action (để check fulfilled/rejected)
   * @param {Object} options - Tùy chọn xử lý
   * @param {string} options.successMessage - Thông báo khi thành công
   * @param {string} options.errorMessage - Thông báo lỗi mặc định
   * @param {Function} options.onSuccess - Callback khi thành công
   * @param {Function} options.onError - Callback khi có lỗi
   * @param {boolean} options.showSuccessAlert - Có hiển thị alert thành công không (default: false)
   * @param {boolean} options.showErrorAlert - Có hiển thị alert lỗi không (default: true)
   * @param {boolean} options.logResult - Có log kết quả không (default: true)
   * @param {boolean} options.throwOnError - Có throw error khi thất bại không (default: false)
   * @param {Function} options.transformSuccess - Transform success data trước khi callback
   * @param {Function} options.transformError - Transform error data trước khi callback
   * @returns {boolean} - true nếu thành công, false nếu thất bại
   */
  static async handle(resultAction, thunkAction, options = {}) {
    const {
      successMessage = 'Thao tác thành công',
      errorMessage = 'Có lỗi xảy ra',
      onSuccess,
      onError,
      showSuccessAlert = false,
      showErrorAlert = true,
      logResult = true,
      throwOnError = false,
      transformSuccess,
      transformError,
    } = options;

    if (thunkAction.fulfilled.match(resultAction)) {
      try {
        const payload = transformSuccess 
          ? transformSuccess(resultAction.payload)
          : resultAction.payload;

        if (logResult) {
          console.log(
            '✅ AsyncThunk success:',
            payload?.message || successMessage,
            payload
          );
        }

        if (showSuccessAlert) {
          Alert.alert(
            'Thành công',
            payload?.message || successMessage
          );
        }

        if (onSuccess) {
          await onSuccess(payload);
        }

        return { success: true, data: payload };
      } catch (err) {
        console.error('❌ Error in success callback:', err);
        if (throwOnError) {
          throw err;
        }
        return { success: false, error: err };
      }
    } else if (thunkAction.rejected.match(resultAction)) {
      try {
        const errorData = resultAction.payload || {};
        const error = errorData.message || errorMessage;
        
        const transformedError = transformError 
          ? transformError(errorData)
          : errorData;

        if (logResult) {
          console.error('❌ AsyncThunk error:', error, transformedError);
        }

        if (showErrorAlert) {
          Alert.alert('Lỗi', error);
        }

        if (onError) {
          await onError(transformedError);
        }

        if (throwOnError) {
          throw new Error(error);
        }

        return { success: false, error: transformedError };
      } catch (err) {
        console.error('❌ Error in error callback:', err);
        if (throwOnError) {
          throw err;
        }
        return { success: false, error: err };
      }
    }

    return { success: false, error: new Error('Unknown async thunk state') };
  }

  /**
   * Xử lý async thunk với loading state và error handling
   * @param {Function} asyncThunk - Async thunk function
   * @param {Function} setLoading - Function để set loading state
   * @param {Object} options - Tùy chọn (giống như handle method)
   * @returns {Promise<Object>} - Result object với success/data/error
   */
  static async handleWithLoading(asyncThunk, setLoading, options = {}) {
    try {
      if (setLoading) setLoading(true);
      
      const result = await asyncThunk();
      
      if (setLoading) setLoading(false);
      return result;
    } catch (err) {
      if (setLoading) setLoading(false);
      throw err;
    }
  }

  /**
   * Wrapper cho việc dispatch async thunk với error handling
   * @param {Function} dispatch - Redux dispatch function
   * @param {Function} thunkAction - Async thunk action creator
   * @param {*} payload - Payload cho thunk action
   * @param {Object} options - Tùy chọn xử lý
   * @returns {Promise<Object>} - Result object
   */
  static async dispatch(dispatch, thunkAction, payload, options = {}) {
    try {
      const resultAction = await dispatch(thunkAction(payload));
      return this.handle(resultAction, thunkAction, options);
    } catch (err) {
      console.error('❌ Dispatch error:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Batch xử lý nhiều async thunks với parallel hoặc sequential execution
   * @param {Array} thunks - Array of {dispatch, thunkAction, payload, options}
   * @param {Object} batchOptions - Batch options
   * @param {boolean} batchOptions.parallel - Execute in parallel (default: true)
   * @param {boolean} batchOptions.stopOnError - Stop on first error (default: false)
   * @returns {Promise<Array>} - Array of results
   */
  static async batchHandle(thunks, batchOptions = {}) {
    const { parallel = true, stopOnError = false } = batchOptions;
    const results = [];

    if (parallel) {
      // Execute all thunks in parallel
      const promises = thunks.map(async (thunk) => {
        const { dispatch, thunkAction, payload, options = {} } = thunk;
        return this.dispatch(dispatch, thunkAction, payload, options);
      });

      const batchResults = await Promise.allSettled(promises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({ success: false, error: result.reason });
          
          if (stopOnError) {
            break;
          }
        }
      }
    } else {
      // Execute sequentially
      for (const thunk of thunks) {
        const { dispatch, thunkAction, payload, options = {} } = thunk;
        const result = await this.dispatch(dispatch, thunkAction, payload, options);
        results.push(result);

        if (!result.success && stopOnError) {
          break;
        }
      }
    }

    return results;
  }

  /**
   * Retry mechanism cho async thunks
   * @param {Function} dispatch - Redux dispatch function
   * @param {Function} thunkAction - Async thunk action creator
   * @param {*} payload - Payload cho thunk action
   * @param {Object} retryOptions - Retry options
   * @param {number} retryOptions.maxRetries - Maximum retry attempts (default: 3)
   * @param {number} retryOptions.delay - Delay between retries in ms (default: 1000)
   * @param {Function} retryOptions.shouldRetry - Function to determine if should retry
   * @param {Object} options - Handle options
   * @returns {Promise<Object>} - Result object
   */
  static async dispatchWithRetry(
    dispatch, 
    thunkAction, 
    payload, 
    retryOptions = {}, 
    options = {}
  ) {
    const {
      maxRetries = 3,
      delay = 1000,
      shouldRetry = (error) => true,
    } = retryOptions;

    let lastError = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.dispatch(dispatch, thunkAction, payload, options);
        
        if (result.success) {
          return result;
        }
        
        lastError = result.error;
        
        // Check if should retry
        if (attempt < maxRetries && shouldRetry(lastError)) {
          console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} for ${thunkAction.typePrefix}`);
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
          continue;
        }
        
        break;
      } catch (err) {
        lastError = err;
        
        if (attempt < maxRetries && shouldRetry(err)) {
          console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} for ${thunkAction.typePrefix}`);
          await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
          continue;
        }
        
        break;
      }
    }

    return { success: false, error: lastError };
  }

  /**
   * Debounced dispatch để tránh multiple rapid calls
   * @param {Function} dispatch - Redux dispatch function
   * @param {Function} thunkAction - Async thunk action creator
   * @param {number} delay - Debounce delay in ms
   * @returns {Function} - Debounced dispatch function
   */
  static createDebouncedDispatch(dispatch, thunkAction, delay = 300) {
    let timeoutId = null;
    let lastCall = null;

    return (payload, options = {}) => {
      // Cancel previous call
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Store current call
      lastCall = { payload, options };

      // Schedule new call
      timeoutId = setTimeout(async () => {
        if (lastCall) {
          const { payload: lastPayload, options: lastOptions } = lastCall;
          await this.dispatch(dispatch, thunkAction, lastPayload, lastOptions);
          lastCall = null;
        }
      }, delay);
    };
  }

  /**
   * Create a handler instance with default options
   * @param {Object} defaultOptions - Default options for all operations
   * @returns {Object} - Handler instance with bound methods
   */
  static createHandler(defaultOptions = {}) {
    return {
      handle: (resultAction, thunkAction, options = {}) => 
        this.handle(resultAction, thunkAction, { ...defaultOptions, ...options }),
      
      handleWithLoading: (asyncThunk, setLoading, options = {}) => 
        this.handleWithLoading(asyncThunk, setLoading, { ...defaultOptions, ...options }),
      
      dispatch: (dispatch, thunkAction, payload, options = {}) => 
        this.dispatch(dispatch, thunkAction, payload, { ...defaultOptions, ...options }),
      
      dispatchWithRetry: (dispatch, thunkAction, payload, retryOptions, options = {}) => 
        this.dispatchWithRetry(dispatch, thunkAction, payload, retryOptions, { ...defaultOptions, ...options }),
      
      batchHandle: (thunks, batchOptions) => 
        this.batchHandle(thunks, batchOptions),
      
      createDebouncedDispatch: (dispatch, thunkAction, delay) => 
        this.createDebouncedDispatch(dispatch, thunkAction, delay),
    };
  }
}

/**
 * Shorthand functions cho các use cases phổ biến
 */

// Xử lý fetch data
export const handleFetch = (resultAction, thunkAction, options = {}) => {
  return AsyncThunkHandler.handle(resultAction, thunkAction, {
    successMessage: 'Tải dữ liệu thành công',
    errorMessage: 'Không thể tải dữ liệu',
    showSuccessAlert: false,
    ...options,
  });
};

// Xử lý create/update operations
export const handleMutation = (resultAction, thunkAction, options = {}) => {
  return AsyncThunkHandler.handle(resultAction, thunkAction, {
    successMessage: 'Lưu thành công',
    errorMessage: 'Không thể lưu dữ liệu',
    showSuccessAlert: true,
    ...options,
  });
};

// Xử lý delete operations
export const handleDelete = (resultAction, thunkAction, options = {}) => {
  return AsyncThunkHandler.handle(resultAction, thunkAction, {
    successMessage: 'Xóa thành công',
    errorMessage: 'Không thể xóa',
    showSuccessAlert: true,
    ...options,
  });
};

// Create a default handler instance
export const defaultHandler = AsyncThunkHandler.createHandler({
  logResult: true,
  showErrorAlert: true,
  showSuccessAlert: false,
});

export default AsyncThunkHandler;
