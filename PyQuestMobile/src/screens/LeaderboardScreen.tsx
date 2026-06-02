import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Palette, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';
import { Card } from '../components/UI';
import { buildLeaderboard } from '../data/leaderboard';
import { LeaderboardEntry } from '../types';
import { useApp } from '../context/AppContext';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export const LeaderboardScreen: React.FC = () => {
  const { user } = useApp();
  const styles = useThemedStyles(makeStyles);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      setEntries(buildLeaderboard({ displayName: user?.displayName || 'Вы', totalXp: user?.totalXp ?? 0 }));
    }, [user]),
  );

  const renderItem = ({ item }: { item: LeaderboardEntry }) => (
    <Card style={[styles.row, item.isCurrentUser && styles.me]}>
      <Text style={styles.rank}>{MEDALS[item.rank] || item.rank}</Text>
      <View style={styles.flex}>
        <Text style={[styles.name, item.isCurrentUser && styles.meName]}>
          {item.displayName} {item.isCurrentUser ? '(вы)' : ''}
        </Text>
        <Text style={styles.level}>Уровень {item.level}</Text>
      </View>
      <Text style={styles.xp}>{item.totalXp} XP</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(e) => `${e.rank}-${e.displayName}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>🏆 Рейтинг игроков</Text>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    list: { padding: spacing.lg, paddingBottom: spacing.xxl },
    header: { color: c.text, fontSize: 22, fontWeight: '800', marginBottom: spacing.lg },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingVertical: spacing.md },
    me: { borderColor: c.accent, borderWidth: 1.5 },
    meName: { color: c.accentDark },
    flex: { flex: 1 },
    rank: { color: c.text, fontSize: 20, fontWeight: '800', width: 40, textAlign: 'center' },
    name: { color: c.text, fontSize: 16, fontWeight: '600' },
    level: { color: c.textMuted, fontSize: 12, marginTop: 2 },
    xp: { color: c.accentDark, fontSize: 16, fontWeight: '800' },
  });
