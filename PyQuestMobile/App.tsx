/**
 * PyQuest — мобильная EdTech-платформа для игрового изучения Python.
 * ВКР 2026 · Кутуева Алёна · Елабужский институт КФУ.
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AppProvider, useApp } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { colors } from './src/theme/theme';

const Gate: React.FC = () => {
  const { ready } = useApp();
  if (!ready) return <LoadingScreen />;
  return <RootNavigator />;
};

const App: React.FC = () => (
  <ErrorBoundary>
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppProvider>
        <Gate />
      </AppProvider>
    </SafeAreaProvider>
  </ErrorBoundary>
);

export default App;
