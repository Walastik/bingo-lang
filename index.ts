import React from 'react';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import App from './App';
import { ThemeProvider } from './src/theme/ThemeContext';

function Root() {
  return React.createElement(
    SafeAreaProvider,
    null,
    React.createElement(ThemeProvider, null, React.createElement(App)),
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
