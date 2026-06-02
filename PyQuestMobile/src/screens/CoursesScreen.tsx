import React, { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { levelFromXp, Palette, radius, spacing, XP_PER_LEVEL, xpIntoLevel } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { Card, Pill, ProgressBar } from '../components/UI';
import { Hero } from '../components/Hero';
import { FadeInView } from '../components/Anim';
import { LOGO_DATA_URI } from '../data/images';
import { COURSE_ICON } from '../data/courseIcons';
import { CoursesStackParamList } from '../navigation/types';
import { Course, Lesson } from '../types';
import * as api from '../api/mockApi';
import { findCourse, firstIncompleteLesson, lessonsByCourse } from '../data/courses';
import { useApp } from '../context/AppContext';
import { BADGE_FLAME } from '../data/assets';

type Nav = NativeStackNavigationProp<CoursesStackParamList, 'Courses'>;

const DIFF_LABEL: Record<string, string> = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' };

export const CoursesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useApp();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressByCourse, setProgressByCourse] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [nextLes, setNextLes] = useState<Lesson | null>(null);

  const load = useCallback(async () => {
    const [cs, allProgress, stats] = await Promise.all([api.getCourses(), api.getAllProgress(), api.getStats()]);
    setCourses(cs);
    setStreak(stats.streak);
    const map: Record<string, number> = {};
    for (const cc of cs) {
      const lessons = lessonsByCourse(cc.id);
      const done = lessons.filter((l) => allProgress[l.id]?.status === 'completed').length;
      map[cc.id] = lessons.length ? done / lessons.length : 0;
    }
    setProgressByCourse(map);
    const completed = new Set(Object.values(allProgress).filter((p) => p.status === 'completed').map((p) => p.lesson_id));
    setNextLes(firstIncompleteLesson(completed));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const xp = user?.totalXp ?? 0;
  const level = levelFromXp(xp);
  const intoLevel = xpIntoLevel(xp);

  const header = (
    <FadeInView>
      <Hero style={styles.hero}>
        <View style={styles.heroInner}>
          <View style={styles.brandRow}>
            <Image source={{ uri: LOGO_DATA_URI }} style={styles.brandLogo} />
            <Text style={styles.brandName}>PyQuest</Text>
          </View>
          <View style={styles.heroTopRow}>
            <View style={styles.flex}>
              <Text style={styles.hello}>Привет, {user?.displayName || 'друг'}! 👋</Text>
              <Text style={styles.helloSub}>Продолжим изучать Python</Text>
            </View>
            <View style={styles.streakChip}>
              <Image source={{ uri: BADGE_FLAME }} style={{ width: 16, height: 16, tintColor: '#FFD43B' }} resizeMode="contain" />
              <Text style={styles.streakNum}>{streak}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeNum}>{level}</Text>
              <Text style={styles.levelBadgeLbl}>ур.</Text>
            </View>
          </View>
          <View style={styles.heroXpRow}>
            <Text style={styles.heroXp}>{xp} XP</Text>
            <Text style={styles.heroXpNext}>до {level + 1} ур. · {XP_PER_LEVEL - intoLevel} XP</Text>
          </View>
          <ProgressBar value={intoLevel / XP_PER_LEVEL} color={'#FFD43B'} height={9} />
        </View>
      </Hero>

      {nextLes && (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Lesson', { lessonId: nextLes.id, title: nextLes.title })}>
          <Card style={styles.continueCard}>
            <View style={styles.continuePlay}>
              <View style={styles.playTriangle} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.continueLabel}>ПРОДОЛЖИТЬ ОБУЧЕНИЕ</Text>
              <Text style={styles.continueTitle} numberOfLines={1}>{nextLes.title}</Text>
              <Text style={styles.continueCourse}>{findCourse(nextLes.course_id)?.title}</Text>
            </View>
          </Card>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Курсы</Text>
    </FadeInView>
  );

  const renderItem = ({ item, index }: { item: Course; index: number }) => {
    const lessons = lessonsByCourse(item.id);
    const progress = progressByCourse[item.id] ?? 0;
    const accent = item.accent || colors.primary;
    return (
      <FadeInView delay={80 + index * 60}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CourseDetail', { courseId: item.id, title: item.title })}>
          <Card style={styles.card}>
            <View style={[styles.accentStripe, { backgroundColor: accent }]} />
            <View style={styles.row}>
              <View style={[styles.emojiBox, { backgroundColor: accent + '24' }]}>
                <Image source={{ uri: COURSE_ICON[item.id] }} style={{ width: 32, height: 32, tintColor: accent }} resizeMode="contain" />
              </View>
              <View style={styles.flex}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.metaRow}>
                  <Pill text={DIFF_LABEL[item.difficulty]} color={accent} bg={accent + '24'} />
                  <Pill text={`${lessons.length} уроков`} />
                  {progress >= 1 && <Pill text="✓ Завершён" color={colors.success} bg={colors.success + '22'} />}
                </View>
              </View>
            </View>
            <View style={styles.progressRow}>
              <ProgressBar value={progress} color={accent} />
              <Text style={[styles.progressText, { color: accent }]}>{Math.round(progress * 100)}%</Text>
            </View>
          </Card>
        </TouchableOpacity>
      </FadeInView>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(cc) => cc.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + spacing.md }]}
        ListHeaderComponent={header}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    list: { padding: spacing.lg, paddingBottom: spacing.xxl },
    flex: { flex: 1 },
    hero: { marginBottom: spacing.lg },
    heroInner: { padding: spacing.lg },
    brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
    brandLogo: { width: 26, height: 26, borderRadius: 7, marginRight: 8 },
    brandName: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
    heroTopRow: { flexDirection: 'row', alignItems: 'center' },
    hello: { color: '#fff', fontSize: 22, fontWeight: '900' },
    helloSub: { color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 2 },
    levelBadge: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
    levelBadgeNum: { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 24 },
    levelBadgeLbl: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700' },
    heroXpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: spacing.lg, marginBottom: spacing.sm },
    heroXp: { color: '#fff', fontSize: 18, fontWeight: '800' },
    heroXpNext: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
    streakChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, marginRight: spacing.sm },
    streakNum: { color: '#fff', fontSize: 14, fontWeight: '800', marginLeft: 5 },
    continueCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
    continuePlay: { width: 46, height: 46, borderRadius: 23, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    playTriangle: { width: 0, height: 0, borderTopWidth: 9, borderBottomWidth: 9, borderLeftWidth: 14, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: c.accentText, marginLeft: 4 },
    continueLabel: { color: c.accentDark, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    continueTitle: { color: c.text, fontSize: 16, fontWeight: '700', marginTop: 2 },
    continueCourse: { color: c.textMuted, fontSize: 12, marginTop: 1 },
    sectionTitle: { color: c.text, fontSize: 18, fontWeight: '800', marginBottom: spacing.md },
    card: { marginBottom: spacing.md, overflow: 'hidden' },
    accentStripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
    row: { flexDirection: 'row' },
    emojiBox: { width: 56, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    emoji: { fontSize: 30 },
    title: { color: c.text, fontSize: 17, fontWeight: '700' },
    desc: { color: c.textMuted, fontSize: 13, marginTop: 2 },
    metaRow: { flexDirection: 'row', gap: 8, marginTop: spacing.sm, flexWrap: 'wrap' },
    progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.md },
    progressText: { fontSize: 12, fontWeight: '700', width: 38, textAlign: 'right' },
  });
