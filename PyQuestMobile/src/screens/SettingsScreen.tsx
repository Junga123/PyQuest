import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Palette, spacing, radius } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { Button, Card } from '../components/UI';
import { useApp } from '../context/AppContext';

export const SettingsScreen: React.FC = () => {
  const { mode, toggle, colors } = useTheme();
  const { logout, resetProgress } = useApp();
  const styles = useThemedStyles(makeStyles);

  const confirmReset = () => {
    Alert.alert('Сбросить прогресс?', 'Будут удалены все данные обучения на устройстве.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Сбросить', style: 'destructive', onPress: () => resetProgress() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Оформление</Text>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>Тёмная тема</Text>
            <Text style={styles.rowSub}>{mode === 'dark' ? 'Включена' : 'Выключена (светлая тема)'}</Text>
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggle}
            trackColor={{ true: colors.primary, false: colors.cardAlt }}
            thumbColor={colors.accent}
          />
        </View>
      </Card>

      <Text style={styles.section}>Язык</Text>
      <Card style={styles.card}>
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <Text style={styles.rowTitle}>Русский</Text>
          <Text style={styles.check}>✓</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <View style={[styles.row, { opacity: 0.5 }]}>
          <Text style={styles.rowTitle}>Татарский</Text>
          <View style={styles.soonPill}>
            <Text style={styles.soonText}> скоро</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={[styles.row, { opacity: 0.5 }]}>
          <Text style={styles.rowTitle}>English</Text>
          <View style={styles.soonPill}>
            <Text style={styles.soonText}> скоро</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.section}>О приложении</Text>
      <Card style={styles.card}>
        <Text style={styles.aboutTitle}>PyQuest</Text>
        <Text style={styles.aboutText}>
          Образовательная платформа для игрового изучения Python: теория, интерактивные задания
          с автопроверкой и пошаговая визуализация исполнения кода.
        </Text>
        <View style={styles.divider} />
        <Text style={styles.aboutMeta}>Версия 1.2.0</Text>
        <Text style={styles.aboutMeta}>ВКР 2026 · Автор: Кутуева Алёна</Text>
        <Text style={styles.aboutMeta}>Научный руководитель: Анисимова Эллина Сергеевна</Text>
        <Text style={styles.aboutMeta}>Елабужский институт КФУ</Text>
      </Card>

      <Button title="Сбросить прогресс" variant="ghost" onPress={confirmReset} style={{ marginTop: spacing.lg }} />
      <Button title="Выйти" variant="danger" onPress={logout} style={{ marginTop: spacing.sm }} />
    </ScrollView>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    section: { color: c.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.lg, marginBottom: spacing.sm },
    card: { paddingVertical: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
    flex: { flex: 1 },
    rowTitle: { color: c.text, fontSize: 16, fontWeight: '600' },
    rowSub: { color: c.textMuted, fontSize: 13, marginTop: 2 },
    check: { color: c.success, fontSize: 18, fontWeight: '800' },
    soonPill: { backgroundColor: c.cardAlt, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
    soonText: { color: c.textMuted, fontSize: 12, fontWeight: '600' },
    divider: { height: 1, backgroundColor: c.border },
    aboutTitle: { color: c.text, fontSize: 18, fontWeight: '800' },
    aboutText: { color: c.textMuted, fontSize: 14, lineHeight: 21, marginTop: spacing.sm, marginBottom: spacing.md },
    aboutMeta: { color: c.textDim, fontSize: 13, marginTop: 2 },
  });
