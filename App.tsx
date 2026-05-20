import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as AntProvider } from '@ant-design/react-native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation';
import { Colors } from './src/theme';

function App() {
  return (
    <SafeAreaProvider>
      <AntProvider>
        <AppProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={Colors.white}
          />
          <AppNavigator />
        </AppProvider>
      </AntProvider>
    </SafeAreaProvider>
  );
}

export default App;
