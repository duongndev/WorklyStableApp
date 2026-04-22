import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const CustomAlert = ({
  visible,
  title,
  message,
  type = 'info', // 'info', 'warning', 'error', 'success'
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  showCancel = true,
  closable = true,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.8));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: 'alert-outline',
          iconColor: '#F59E0B',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          confirmColor: '#F59E0B',
        };
      case 'error':
        return {
          icon: 'close-circle-outline',
          iconColor: '#EF4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          confirmColor: '#EF4444',
        };
      case 'success':
        return {
          icon: 'check-circle-outline',
          iconColor: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          confirmColor: '#10B981',
        };
      default:
        return {
          icon: 'information-outline',
          iconColor: colors.primary,
          bgColor: `${colors.primary}20`,
          confirmColor: colors.primary,
        };
    }
  };

  const typeConfig = getTypeConfig();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleBackdropPress = () => {
    if (closable) {
      handleCancel();
    }
  };

  console.log('CustomAlert - visible:', visible);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleBackdropPress}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          activeOpacity={1}
          onStartShouldSetResponder={() => true}
        >
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: typeConfig.bgColor }]}>
            <MaterialCommunityIcons
              name={typeConfig.icon}
              size={48}
              color={typeConfig.iconColor}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.subText }]}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {showCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, { color: colors.subText }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: typeConfig.confirmColor },
              ]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText, { color: '#FFF' }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '90%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  confirmButton: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontWeight: '700',
  },
});

export default CustomAlert;
