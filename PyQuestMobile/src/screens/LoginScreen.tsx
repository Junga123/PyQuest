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
import { Palette, radius, spacing } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { Button } from '../components/UI';
import { useApp } from '../context/AppContext';
import { LOGO_DATA_URI } from '../data/images';

export const LoginScreen: React.FC = () => {
  const { login, register, loginDemo } = useApp();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
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
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={{ uri: LOGO_DATA_URI }} style={styles.logo} />
        <Text style={styles.title}>PyQuest</Text>
        <Text style={styles.subtitle}>{mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}</Text>

        <View style={styles.form}>
          {mode === 'register' && (
            <TextInput style={styles.input} placeholder="Имя" placeholderTextColor={colors.textDim} value={name} onChangeText={setName} />
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

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.divider} />
          </View>

          <Button title="Войти как гость (демо)" variant="ghost" onPress={demo} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.author}>Автор: Кутуева Алёна</Text>
          <Text style={styles.author}>Науч. рук.: Анисимова Эллина Сергеевна</Text>
          <Text style={styles.author}>Елабужский институт КФУ · 2026</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: 'transparent' },
    container: { flexGrow: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
    logo: { width: 84, height: 84, borderRadius: 20 },
    title: { color: c.text, fontSize: 30, fontWeight: '900', marginTop: spacing.md },
    subtitle: { color: c.textMuted, fontSize: 15, marginTop: spacing.xs, marginBottom: spacing.xl },
    form: { width: '100%', maxWidth: 420 },
    input: {
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
      color: c.text,
      fontSize: 16,
      marginBottom: spacing.md,
    },
    error: { color: c.danger, fontSize: 14, marginBottom: spacing.sm },
    switch: { color: c.primaryLight, textAlign: 'center', marginTop: spacing.lg, fontSize: 14 },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
    divider: { flex: 1, height: 1, backgroundColor: c.border },
    dividerText: { color: c.textDim, marginHorizontal: spacing.md, fontSize: 13 },
    social: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: radius.md,
      padding: 12,
      marginBottom: spacing.sm,
    },
    socialBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    socialG: { fontSize: 16, fontWeight: '900' },
    socialText: { color: c.text, fontSize: 15, fontWeight: '600' },
    footer: { marginTop: spacing.xxl },
    author: { color: c.textDim, fontSize: 12, textAlign: 'center' },
  });
