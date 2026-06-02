import React, { useCallback, useState } from 'react';
import { Image, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { levelFromXp, Palette, spacing, XP_PER_LEVEL, xpIntoLevel } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { Button, Card, ProgressBar } from '../components/UI';
import { Hero } from '../components/Hero';
import { FadeInView } from '../components/Anim';
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
  const insets = useSafeAreaInsets();
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
      /* отменено */
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]} showsVerticalScrollIndicator={false}>
      <FadeInView>
        <Hero style={styles.hero}>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.gear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="sliders" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroInner}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.displayName || '?').slice(0, 1).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{user?.displayName || 'Студент'}</Text>
            <Text style={styles.email}>{user?.email}</Text>

            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Уровень {level}</Text>
              <Text style={styles.xpTotal}>{xp} XP</Text>
            </View>
            <ProgressBar value={intoLevel / XP_PER_LEVEL} color={'#FFD43B'} height={10} />
            <Text style={styles.levelHint}>До уровня {level + 1}: {XP_PER_LEVEL - intoLevel} XP</Text>
          </View>
        </Hero>
      </FadeInView>

      <FadeInView delay={100}>
        <View style={styles.statsRow}>
          <Stat label="Уроков" value={stats?.lessonsCompleted ?? 0} styles={styles} />
          <Stat label="Заданий" value={stats?.tasksSolved ?? 0} styles={styles} />
          <Stat label="Наград" value={unlocked} styles={styles} />
        </View>
      </FadeInView>

      <FadeInView delay={160}>
        <Button title="Поделиться прогрессом" variant="primary" icon={<Icon name="share" size={18} color="#06121F" />} onPress={shareProgress} style={{ marginTop: spacing.md }} />

        <Card style={styles.brandCard}>
          <Image source={{ uri: LOGO_DATA_URI }} style={styles.brandLogo} />
          <View style={styles.flex}>
            <Text style={styles.brandTitle}>PyQuest — ВКР 2026</Text>
            <Text style={styles.brandText}>Автор: Кутуева Алёна</Text>
            <Text style={styles.brandTextDim}>Науч. рук.: Анисимова Эллина Сергеевна</Text>
            <Text style={styles.brandTextDim}>Елабужский институт КФУ</Text>
          </View>
        </Card>

        <Button title="Настройки" variant="ghost" icon={<Icon name="sliders" size={18} color={colors.text} />} onPress={() => navigation.navigate('Settings')} style={{ marginTop: spacing.lg }} />
      </FadeInView>
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
    hero: { marginBottom: spacing.md },
    gear: { position: 'absolute', top: spacing.md, right: spacing.md, zIndex: 5, padding: 4 },
    heroInner: { padding: spacing.lg, alignItems: 'center' },
    avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
    avatarText: { color: '#fff', fontSize: 36, fontWeight: '900' },
    name: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: spacing.md },
    email: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
    levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: spacing.lg, marginBottom: spacing.sm },
    levelLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
    xpTotal: { color: '#FFD43B', fontSize: 16, fontWeight: '800' },
    levelHint: { color: 'rgba(255,255,255,0.8)', fontSize: 12, alignSelf: 'flex-start', marginTop: spacing.sm },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
    stat: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
    statValue: { color: c.text, fontSize: 26, fontWeight: '900' },
    statLabel: { color: c.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' },
    brandCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
    brandLogo: { width: 48, height: 48, borderRadius: 12 },
    brandTitle: { color: c.text, fontSize: 15, fontWeight: '700' },
    brandText: { color: c.textMuted, fontSize: 13, marginTop: 2 },
    brandTextDim: { color: c.textDim, fontSize: 12, marginTop: 1 },
  });
