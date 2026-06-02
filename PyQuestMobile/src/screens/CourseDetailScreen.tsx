import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Palette, radius, spacing } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { Pill } from '../components/UI';
import { CoursesStackParamList } from '../navigation/types';
import { Lesson, LessonProgress } from '../types';
import * as api from '../api/mockApi';
import { findCourse, tasksByLesson } from '../data/courses';
import { COURSE_ICON } from '../data/courseIcons';

type Nav = NativeStackNavigationProp<CoursesStackParamList, 'CourseDetail'>;
type Rt = RouteProp<CoursesStackParamList, 'CourseDetail'>;

export const CourseDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { courseId } = route.params;
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const course = findCourse(courseId);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});

  const load = useCallback(async () => {
    const [ls, all] = await Promise.all([api.getLessons(courseId), api.getAllProgress()]);
    setLessons(ls);
    setProgress(all);
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const statusOf = (lesson: Lesson, idx: number) => {
    const p = progress[lesson.id];
    if (p?.status === 'completed') return { state: 'done' as const, locked: false };
    if (p?.status === 'in_progress') return { state: 'active' as const, locked: false };
    const prev = idx === 0 ? null : lessons[idx - 1];
    const locked = !!prev && progress[prev.id]?.status !== 'completed';
    return { state: locked ? ('locked' as const) : ('open' as const), locked };
  };

  const completedCount = lessons.filter((l) => progress[l.id]?.status === 'completed').length;
  const accent = course?.accent || colors.primary;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.mapHeader}>
        <View style={[styles.mapIconBox, { backgroundColor: accent + '24' }]}>
          <Image source={{ uri: COURSE_ICON[courseId] }} style={{ width: 38, height: 38, tintColor: accent }} resizeMode="contain" />
        </View>
        <Text style={styles.mapTitle}>{course?.title}</Text>
        <Text style={styles.mapSub}>
          Пройдено {completedCount} из {lessons.length} квестов
        </Text>
      </View>

      {lessons.map((lesson, index) => {
        const s = statusOf(lesson, index);
        const tasks = tasksByLesson(lesson.id);
        const nodeColor =
          s.state === 'done' ? colors.success : s.state === 'active' ? accent : s.state === 'open' ? colors.primaryLight : colors.textDim;
        const isLast = index === lessons.length - 1;
        const offset = index % 2 === 0 ? 0 : 28; // лёгкое смещение «змейкой»

        return (
          <View key={lesson.id} style={styles.rowWrap}>
            {/* левый рельс с узлом и коннектором */}
            <View style={styles.rail}>
              <View style={[styles.node, { borderColor: nodeColor, backgroundColor: s.state === 'done' ? colors.success : colors.bgElevated }]}>
                <Text style={[styles.nodeText, { color: s.state === 'done' ? '#06121F' : nodeColor }]}>
                  {s.state === 'done' ? '✓' : s.state === 'locked' ? '🔒' : index + 1}
                </Text>
              </View>
              {!isLast && <View style={[styles.connector, { backgroundColor: s.state === 'done' ? colors.success : colors.border }]} />}
            </View>

            {/* карточка квеста */}
            <TouchableOpacity
              activeOpacity={s.locked ? 1 : 0.85}
              onPress={() => {
                if (!s.locked) navigation.navigate('Lesson', { lessonId: lesson.id, title: lesson.title });
              }}
              style={[styles.questCard, { marginLeft: offset, opacity: s.locked ? 0.55 : 1, borderColor: s.state === 'active' ? accent : colors.border }]}>
              <Text style={styles.questTitle}>{lesson.title}</Text>
              <Text style={styles.questDesc} numberOfLines={2}>
                {lesson.content.shortDescription || lesson.content.description}
              </Text>
              <View style={styles.metaRow}>
                <Pill text={`${tasks.length} заданий`} />
                {!!lesson.content.xpReward && <Pill text={`+${lesson.content.xpReward} XP`} color={colors.accent} bg={colors.accent + '1A'} />}
                {s.state === 'done' && <Pill text="✓ Пройден" color={colors.success} bg={colors.success + '22'} />}
                {s.state === 'active' && <Pill text="В процессе" color={accent} bg={accent + '22'} />}
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    content: { padding: spacing.lg },
    mapHeader: { alignItems: 'center', marginBottom: spacing.lg },
    mapIconBox: { width: 64, height: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
    mapTitle: { color: c.text, fontSize: 22, fontWeight: '800', marginTop: spacing.sm },
    mapSub: { color: c.textMuted, fontSize: 13, marginTop: 2 },
    rowWrap: { flexDirection: 'row' },
    rail: { width: 48, alignItems: 'center' },
    node: { width: 40, height: 40, borderRadius: 20, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    nodeText: { fontSize: 16, fontWeight: '800' },
    connector: { width: 3, flex: 1, minHeight: 28, marginVertical: 2 },
    questCard: { flex: 1, backgroundColor: c.card, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.lg },
    questTitle: { color: c.text, fontSize: 16, fontWeight: '700' },
    questDesc: { color: c.textMuted, fontSize: 13, marginTop: 2 },
    metaRow: { flexDirection: 'row', gap: 8, marginTop: spacing.sm, flexWrap: 'wrap' },
  });
