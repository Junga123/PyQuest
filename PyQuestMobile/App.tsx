/**
 * PyQuest — мобильная EdTech-платформа для игрового изучения Python.
 * ВКР 2026 · Кутуева Алёна · Елабужский институт КФУ.
 */
import React from 'react';
import { ImageBackground, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AppProvider, useApp } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { AMBIENT_DARK, AMBIENT_LIGHT } from './src/data/assets';

const ThemedStatusBar: React.FC = () => {
  const { mode, colors } = useTheme();
  return <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} translucent={false} />;
};

// Амбиентный фон с мягкими цветными свечениями — поверх него «стеклянные» панели.
const AmbientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode, colors } = useTheme();
  return (
    <ImageBackground
      source={{ uri: mode === 'dark' ? AMBIENT_DARK : AMBIENT_LIGHT }}
      style={[styles.fill, { backgroundColor: colors.bg }]}
      resizeMode="cover">
      {children}
    </ImageBackground>
  );
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
        <AmbientBackground>
          <AppProvider>
            <Gate />
          </AppProvider>
        </AmbientBackground>
      </SafeAreaProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

const styles = StyleSheet.create({ fill: { flex: 1 } });

export default App;
