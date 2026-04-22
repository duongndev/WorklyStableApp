import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store from './src/redux/store';
import { persistor } from './src/redux/store';
import { setStore } from './src/api/api.service';

const app = getApp();
setBackgroundMessageHandler(getMessaging(app), async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});


// Thiết lập store instance cho api.service
setStore(store);

const Root = () => (
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);

AppRegistry.registerComponent(appName, () => Root);
