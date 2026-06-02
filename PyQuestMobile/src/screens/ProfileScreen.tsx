import React, { useCallback, useState } from 'react';
import { Image, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { levelFromXp, Palette, spacing, XP_PER_LEVEL, xpIntoLevel } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { Button, Card, ProgressBar } from '../components/UI';
import { Icon } from '../components/Icon';
import { useApp } from '../context/AppContext';
import * as api from '../api/mockApi';
import { evaluateAchievements } from '../data/achievements';
import { LOGO_DATA_URI } from '../data/images';
import { ProfileStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

export const ProfileScreen: React.FC = () => {
  const { user, stats, refresh } = useApp();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const navigation = useNavigation<Nav>();
  const [unlocked, setUnlocked] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refresh();
      (async () => {
        const s = await api.getStats();
        const ach = evaluateAchievements({ totalXp: s.totalXp, lessonsCompleted: s.lessonsCompleted, tasksSolved: s.tasksSolved });
        setUnlocked(ach.filter((a) => a.unlocked).length);
      })();
    }, [refresh]),
  );

  const xp = user?.totalXp ?? 0;
  const level = levelFromXp(xp);
  const intoLevel = xpIntoLevel(xp);

  const shareProgress = async () => {
    try {
      await Share.share({
        message: `Я изучаю Python в PyQuest! 🐍 Уровень ${level}, ${xp} XP, достижений: ${unlocked}. Присоединяйся!`,
      });
    } catch {
      /* отменено пользователем */
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconBtn}>
          <Icon name="sliders" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.displayName || '?').slice(0, 1).toUpperCase()}</Text>
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
        <Text style={styles.levelHint}>До уровня {level + 1}: {XP_PER_LEVEL - intoLevel} XP</Text>
      </Card>

      <View style={styles.statsRow}>
        <Stat label="Уроков пройдено" value={stats?.lessonsCompleted ?? 0} styles={styles} />
        <Stat label="Заданий решено" value={stats?.tasksSolved ?? 0} styles={styles} />
      </View>
      <View style={styles.statsRow}>
        <Stat label="Курсов начато" value={stats?.coursesStarted ?? 0} styles={styles} />
        <Stat label="Достижений" value={unlocked} styles={styles} />
      </View>

      <Button title="Поделиться прогрессом" variant="primary" icon={<Icon name="share" size={18} color="#06121F" />} onPress={shareProgress} style={{ marginTop: spacing.md }} />

      <Card style={styles.brandCard}>
        <Image source={{ uri: LOGO_DATA_URI }} style={styles.brandLogo} />
        <View style={styles.flex}>
          <Text style={styles.brandTitle}>PyQuest — ВКР 2026</Text>
          <Text style={styles.brandText}>Автор: Кутуева Алёна</Text>
          <Text style={styles.brandTextDim}>Елабужский институт КФУ</Text>
        </View>
      </Card>

      <Button title="Настройки" variant="ghost" icon={<Icon name="sliders" size={18} color={colors.text} />} onPress={() => navigation.navigate('Settings')} style={{ marginTop: spacing.lg }} />
    </ScrollView>
  );
};

const Stat: React.FC<{ label: string; value: number; styles: any }> = ({ label, value, styles }) => (
  <Card style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Card>
);

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    flex: { flex: 1 },
    topBar: { flexDirection: 'row', justifyContent: 'flex-end' },
    iconBtn: { padding: 8 },
    avatarWrap: { alignItems: 'center', marginBottom: spacing.lg },
    avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontSize: 36, fontWeight: '900' },
    name: { color: c.text, fontSize: 22, fontWeight: '800', marginTop: spacing.md },
    email: { color: c.textMuted, fontSize: 14, marginTop: 2 },
    levelCard: { marginBottom: spacing.md },
    levelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    levelLabel: { color: c.text, fontSize: 18, fontWeight: '700' },
    xpTotal: { color: c.accentDark, fontSize: 18, fontWeight: '800' },
    levelHint: { color: c.textMuted, fontSize: 13, marginTop: spacing.sm },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    stat: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
    statValue: { color: c.text, fontSize: 28, fontWeight: '900' },
    statLabel: { color: c.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' },
    brandCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
    brandLogo: { width: 48, height: 48, borderRadius: 12 },
    brandTitle: { color: c.text, fontSize: 15, fontWeight: '700' },
    brandText: { color: c.textMuted, fontSize: 13, marginTop: 2 },
    brandTextDim: { color: c.textDim, fontSize: 12, marginTop: 1 },
  });
