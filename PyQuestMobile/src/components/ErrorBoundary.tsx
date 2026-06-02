import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../theme/theme';

interface State {
  hasError: boolean;
  error?: Error;
}

// Перехватывает runtime-ошибки в дереве компонентов и показывает их на экране,
// вместо «белого экрана» / краша приложения.
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.log('PyQuest ErrorBoundary:', error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>🐍💥</Text>
          <Text style={styles.title}>Упс, что-то пошло не так</Text>
          <Text style={styles.subtitle}>
            Приложение перехватило ошибку и не упало. Можно продолжить работу.
          </Text>
          <ScrollView style={styles.errBox}>
            <Text style={styles.errText}>{this.state.error?.message || 'Неизвестная ошибка'}</Text>
            {!!this.state.error?.stack && (
              <Text style={styles.stack}>{this.state.error.stack}</Text>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={this.reset}>
            <Text style={styles.buttonText}>Продолжить</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  errBox: {
    maxHeight: 240,
    backgroundColor: colors.dangerBg,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errText: { color: colors.danger, fontFamily: 'monospace', fontSize: 13, marginBottom: spacing.sm },
  stack: { color: colors.textDim, fontFamily: 'monospace', fontSize: 11 },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
