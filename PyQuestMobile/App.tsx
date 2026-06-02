/**
 * PyQuest — мобильная EdTech-платформа для игрового изучения Python.
 * ВКР 2026 · Кутуева Алёна · Елабужский институт КФУ.
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AppProvider, useApp } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LoadingScreen } from './src/screens/LoadingScreen';

const ThemedStatusBar: React.FC = () => {
  const { mode, colors } = useTheme();
  return <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />;
};

const Gate: React.FC = () => {
  const { ready } = useApp();
  if (!ready) return <LoadingScreen />;
  return <RootNavigator />;
};

const App: React.FC = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <SafeAreaProvider>
        <ThemedStatusBar />
        <AppProvider>
          <Gate />
        </AppProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
