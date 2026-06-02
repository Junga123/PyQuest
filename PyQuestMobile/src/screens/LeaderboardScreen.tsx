import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';
import { Card } from '../components/UI';
import { Hero } from '../components/Hero';
import { FadeInView } from '../components/Anim';
import { buildLeaderboard } from '../data/leaderboard';
import { LeaderboardEntry } from '../types';
import { useApp } from '../context/AppContext';

const MEDAL_COLORS: Record<number, [string, string]> = {
  1: ['#FFD43B', '#B8860B'],
  2: ['#D5DCE6', '#9AA6B5'],
  3: ['#E0996A', '#A9683E'],
};

// Медаль места (рисованная — рендерится везде).
const RankBadge: React.FC<{ rank: number; styles: any }> = ({ rank, styles }) => {
  const mc = MEDAL_COLORS[rank];
  if (mc) {
    return (
      <View style={[styles.medal, { backgroundColor: mc[0], borderColor: mc[1] }]}>
        <Text style={[styles.medalNum, { color: mc[1] }]}>{rank}</Text>
      </View>
    );
  }
  return (
    <View style={styles.rankPlain}>
      <Text style={styles.rankPlainNum}>{rank}</Text>
    </View>
  );
};

export const LeaderboardScreen: React.FC = () => {
  const { user } = useApp();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      setEntries(buildLeaderboard({ displayName: user?.displayName || 'Вы', totalXp: user?.totalXp ?? 0 }));
    }, [user]),
  );

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <FadeInView delay={index * 35}>
      <Card style={[styles.row, item.isCurrentUser && styles.me]}>
        <RankBadge rank={item.rank} styles={styles} />
        <View style={styles.flex}>
          <Text style={[styles.name, item.isCurrentUser && styles.meName]} numberOfLines={1}>
            {item.displayName} {item.isCurrentUser ? '(вы)' : ''}
          </Text>
          <Text style={styles.level}>Уровень {item.level}</Text>
        </View>
        <Text style={styles.xp}>{item.totalXp} XP</Text>
      </Card>
    </FadeInView>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(e) => `${e.rank}-${e.displayName}`}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + spacing.md }]}
        ListHeaderComponent={
          <FadeInView>
            <Hero style={styles.hero}>
              <View style={styles.heroInner}>
                <Text style={styles.heroTitle}>Рейтинг игроков</Text>
                <Text style={styles.heroSub}>Соревнуйся и поднимайся в топ</Text>
              </View>
            </Hero>
          </FadeInView>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    list: { padding: spacing.lg, paddingBottom: spacing.xxl },
    hero: { marginBottom: spacing.lg },
    heroInner: { padding: spacing.lg },
    heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingVertical: spacing.md },
    me: { borderColor: c.accent, borderWidth: 1.5 },
    meName: { color: c.accentDark },
    flex: { flex: 1 },
    medal: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    medalNum: { fontSize: 17, fontWeight: '900' },
    rankPlain: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.cardAlt, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    rankPlainNum: { color: c.textMuted, fontSize: 15, fontWeight: '800' },
    name: { color: c.text, fontSize: 16, fontWeight: '600' },
    level: { color: c.textMuted, fontSize: 12, marginTop: 2 },
    xp: { color: c.accentDark, fontSize: 16, fontWeight: '800' },
  });
