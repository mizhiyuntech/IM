import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as AntProvider } from '@ant-design/react-native';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation';
import { Colors } from './src/theme';

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
