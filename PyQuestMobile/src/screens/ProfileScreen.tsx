import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radius, spacing, levelFromXp, xpIntoLevel, XP_PER_LEVEL } from '../theme/theme';
import { Button, Card, ProgressBar } from '../components/UI';
import { useApp } from '../context/AppContext';
import * as api from '../api/mockApi';
import { evaluateAchievements } from '../data/achievements';
import { LOGO_DATA_URI } from '../data/images';

export const ProfileScreen: React.FC = () => {
  const { user, stats, logout, resetProgress, refresh } = useApp();
  const [unlocked, setUnlocked] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await api.getStats();
        const ach = evaluateAchievements({
          totalXp: s.totalXp,
          lessonsCompleted: s.lessonsCompleted,
          tasksSolved: s.tasksSolved,
        });
        setUnlocked(ach.filter((a) => a.unlocked).length);
      })();
    }, []),
  );

  const xp = user?.totalXp ?? 0;
  const level = levelFromXp(xp);
  const intoLevel = xpIntoLevel(xp);

  const confirmReset = () => {
    Alert.alert('Сбросить прогресс?', 'Будут удалены все данные обучения на устройстве.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Сбросить', style: 'destructive', onPress: () => resetProgress() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.displayName || '?').slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.displayName || 'Студент'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Card style={styles.levelCard}>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Уровень {level}</Text>
          <Text style={styles.xpTotal}>{xp} XP</Text>
        </View>
        <ProgressBar value={intoLevel / XP_PER_LEVEL} color={colors.accent} height={10} />
        <Text style={styles.levelHint}>
          До уровня {level + 1}: {XP_PER_LEVEL - intoLevel} XP
        </Text>
      </Card>

      <View style={styles.statsRow}>
        <Stat label="Уроков пройдено" value={stats?.lessonsCompleted ?? 0} />
        <Stat label="Заданий решено" value={stats?.tasksSolved ?? 0} />
      </View>
      <View style={styles.statsRow}>
        <Stat label="Курсов начато" value={stats?.coursesStarted ?? 0} />
        <Stat label="Достижений" value={unlocked} />
      </View>

      <Card style={styles.brandCard}>
        <Image source={{ uri: LOGO_DATA_URI }} style={styles.brandLogo} />
        <View style={styles.flex}>
          <Text style={styles.brandTitle}>PyQuest — ВКР 2026</Text>
          <Text style={styles.brandText}>Автор: Кутуева Алёна</Text>
          <Text style={styles.brandTextDim}>Елабужский институт КФУ</Text>
        </View>
      </Card>

      <Button title="Сбросить прогресс" variant="ghost" onPress={confirmReset} style={{ marginTop: spacing.lg }} />
      <Button title="Выйти" variant="danger" onPress={logout} style={{ marginTop: spacing.sm }} />
    </ScrollView>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <Card style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Card>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  flex: { flex: 1 },
  avatarWrap: { alignItems: 'center', marginVertical: spacing.lg },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '900' },
  name: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: spacing.md },
  email: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  levelCard: { marginBottom: spacing.md },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  levelLabel: { color: colors.text, fontSize: 18, fontWeight: '700' },
  xpTotal: { color: colors.accent, fontSize: 18, fontWeight: '800' },
  levelHint: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  stat: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  statValue: { color: colors.text, fontSize: 28, fontWeight: '900' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  brandCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  brandLogo: { width: 48, height: 48, borderRadius: 12 },
  brandTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  brandText: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  brandTextDim: { color: colors.textDim, fontSize: 12, marginTop: 1 },
});
