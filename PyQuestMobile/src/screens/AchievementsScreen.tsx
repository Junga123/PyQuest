import React, { useCallback, useState } from 'react';
import { FlatList, Image, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, radius, rarityColors, spacing } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';
import { Card, ProgressBar } from '../components/UI';
import { Hero } from '../components/Hero';
import { FadeInView } from '../components/Anim';
import { Icon } from '../components/Icon';
import { AchievementState, evaluateAchievements } from '../data/achievements';
import * as api from '../api/mockApi';
import {
  BADGE_BOLT, BADGE_CROWN, BADGE_FLAME, BADGE_ROCKET, BADGE_STAR, BADGE_TARGET, BADGE_TROPHY, TAB_BOOK,
} from '../data/assets';

const RARITY_LABEL: Record<string, string> = { common: 'Обычное', rare: 'Редкое', epic: 'Эпическое', legendary: 'Легендарное' };

// Иконка достижения — PNG-глиф (рендерится везде, в т.ч. на эмуляторах).
const BADGE_IMG: Record<string, string> = {
  a1: BADGE_BOLT, a2: TAB_BOOK, a3: BADGE_TARGET, a4: BADGE_STAR,
  a5: BADGE_TROPHY, a6: BADGE_FLAME, a7: BADGE_ROCKET, a8: BADGE_CROWN,
};

export const AchievementsScreen: React.FC = () => {
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
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

  const renderItem = ({ item, index }: { item: AchievementState; index: number }) => {
    const tint = item.unlocked ? rarityColors[item.rarity] : styles._dim.color;
    return (
      <FadeInView delay={index * 45}>
        <Card style={[styles.card, !item.unlocked && { opacity: 0.7 }]}>
          <View style={[styles.iconBox, { backgroundColor: (item.unlocked ? rarityColors[item.rarity] : styles._dim.color) + '22', borderColor: tint + '55' }]}>
            <Image source={{ uri: BADGE_IMG[item.id] || BADGE_STAR }} style={{ width: 30, height: 30, tintColor: tint }} resizeMode="contain" />
            {!item.unlocked && <View style={styles.lock}><LockShape color={styles._dim.color} /></View>}
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
      </FadeInView>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + spacing.md }]}
        ListHeaderComponent={
          <FadeInView>
            <Hero style={styles.hero}>
              <View style={styles.heroInner}>
                <Text style={styles.heroTitle}>Достижения</Text>
                <Text style={styles.heroSub}>Получено {unlockedCount} из {items.length}</Text>
              </View>
            </Hero>
          </FadeInView>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// Замочек, нарисованный из View (рендерится везде).
const LockShape: React.FC<{ color: string }> = ({ color }) => (
  <View style={{ alignItems: 'center' }}>
    <View style={{ width: 9, height: 7, borderWidth: 2, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: 5, borderTopRightRadius: 5 }} />
    <View style={{ width: 14, height: 11, borderRadius: 3, backgroundColor: color, marginTop: -1 }} />
  </View>
);

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    list: { padding: spacing.lg, paddingBottom: spacing.xxl },
    hero: { marginBottom: spacing.lg },
    heroInner: { padding: spacing.lg },
    heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },
    card: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    flex: { flex: 1 },
    iconBox: { width: 54, height: 54, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    lock: { position: 'absolute', right: 4, bottom: 4 },
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
    _dim: { color: c.textDim },
  });
