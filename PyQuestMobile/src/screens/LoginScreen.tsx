import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { Button } from '../components/UI';
import { useApp } from '../context/AppContext';
import { LOGO_DATA_URI } from '../data/images';

export const LoginScreen: React.FC = () => {
  const { login, register, loginDemo } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!email.includes('@')) throw new Error('Введите корректный email');
        if (password.length < 6) throw new Error('Пароль не короче 6 символов');
        if (!name.trim()) throw new Error('Введите имя');
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (e: any) {
      setError(e?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const demo = async () => {
    setLoading(true);
    try {
      await loginDemo();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={{ uri: LOGO_DATA_URI }} style={styles.logo} />
        <Text style={styles.title}>PyQuest</Text>
        <Text style={styles.subtitle}>
          {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
        </Text>

        <View style={styles.form}>
          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Имя"
              placeholderTextColor={colors.textDim}
              value={name}
              onChangeText={setName}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textDim}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            placeholderTextColor={colors.textDim}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Button
            title={mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            onPress={submit}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />

          <TouchableOpacity
            onPress={() => {
              setError(null);
              setMode(mode === 'login' ? 'register' : 'login');
            }}>
            <Text style={styles.switch}>
              {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />
          <Button title="Войти как гость (демо)" variant="ghost" onPress={demo} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.author}>Кутуева Алёна · Елабужский институт КФУ · 2026</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 84, height: 84, borderRadius: 20 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: spacing.md },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: spacing.xs, marginBottom: spacing.xl },
  form: { width: '100%', maxWidth: 420 },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  error: { color: colors.danger, fontSize: 14, marginBottom: spacing.sm },
  switch: { color: colors.primaryLight, textAlign: 'center', marginTop: spacing.lg, fontSize: 14 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  footer: { marginTop: spacing.xxl },
  author: { color: colors.textDim, fontSize: 12, textAlign: 'center' },
});
