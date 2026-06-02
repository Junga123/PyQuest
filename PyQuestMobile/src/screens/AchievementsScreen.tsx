import React, { useCallback, useState } from 'react';
import { FlatList, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Palette, radius, rarityColors, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';
import { Card, ProgressBar } from '../components/UI';
import { Icon } from '../components/Icon';
import { AchievementState, evaluateAchievements } from '../data/achievements';
import * as api from '../api/mockApi';

const RARITY_LABEL: Record<string, string> = {
  common: 'Обычное',
  rare: 'Редкое',
  epic: 'Эпическое',
  legendary: 'Легендарное',
};

export const AchievementsScreen: React.FC = () => {
  const styles = useThemedStyles(makeStyles);
  const [items, setItems] = useState<AchievementState[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await api.getStats();
        setItems(evaluateAchievements({ totalXp: s.totalXp, lessonsCompleted: s.lessonsCompleted, tasksSolved: s.tasksSolved }));
      })();
    }, []),
  );

  const unlockedCount = items.filter((i) => i.unlocked).length;

  const shareAchievement = async (a: AchievementState) => {
    try {
      await Share.share({ message: `🏆 В PyQuest я получил достижение «${a.title}» — ${a.description}! 🐍` });
    } catch {
      /* отменено */
    }
  };

  const renderItem = ({ item }: { item: AchievementState }) => (
    <Card style={[styles.card, !item.unlocked && { opacity: 0.6 }]}>
      <View style={[styles.iconBox, { backgroundColor: rarityColors[item.rarity] + '22' }]}>
        <Text style={styles.icon}>{item.unlocked ? item.icon : '🔒'}</Text>
      </View>
      <View style={styles.flex}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={[styles.rarity, { color: rarityColors[item.rarity] }]}>{RARITY_LABEL[item.rarity]}</Text>
        </View>
        <Text style={styles.desc}>{item.description}</Text>
        {!item.unlocked ? (
          <View style={styles.progWrap}>
            <ProgressBar value={item.progress} color={rarityColors[item.rarity]} height={6} />
            <Text style={styles.progText}>{Math.round(item.progress * 100)}%</Text>
          </View>
        ) : (
          <View style={styles.unlockedRow}>
            <Text style={styles.unlocked}>✓ Получено · +{item.xp_reward} XP</Text>
            <TouchableOpacity onPress={() => shareAchievement(item)} style={styles.shareBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="share" size={16} color={styles._muted.color} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>🎖 Достижения {unlockedCount}/{items.length}</Text>}
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
    card: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    flex: { flex: 1 },
    iconBox: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    icon: { fontSize: 26 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { color: c.text, fontSize: 16, fontWeight: '700', flex: 1 },
    rarity: { fontSize: 11, fontWeight: '700' },
    desc: { color: c.textMuted, fontSize: 13, marginTop: 2 },
    progWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
    progText: { color: c.textMuted, fontSize: 11, width: 34, textAlign: 'right' },
    unlockedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
    unlocked: { color: c.success, fontSize: 13, fontWeight: '600' },
    shareBtn: { padding: 4 },
    _muted: { color: c.textMuted },
  });
