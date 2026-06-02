import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../theme/theme';
import { Card, Pill } from '../components/UI';
import { CoursesStackParamList } from '../navigation/types';
import { Lesson, LessonProgress } from '../types';
import * as api from '../api/mockApi';
import { lessonsByCourse, tasksByLesson } from '../data/courses';

type Nav = NativeStackNavigationProp<CoursesStackParamList, 'CourseDetail'>;
type Rt = RouteProp<CoursesStackParamList, 'CourseDetail'>;

export const CourseDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { courseId } = route.params;
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

  const statusOf = (lesson: Lesson, idx: number): { label: string; color: string; locked: boolean } => {
    const p = progress[lesson.id];
    if (p?.status === 'completed') return { label: '✓ Пройден', color: colors.success, locked: false };
    if (p?.status === 'in_progress') return { label: 'В процессе', color: colors.accent, locked: false };
    // первый урок всегда открыт; следующий открывается после предыдущего
    const prev = idx === 0 ? null : lessons[idx - 1];
    const locked = !!prev && progress[prev.id]?.status !== 'completed';
    return { label: locked ? '🔒 Закрыт' : 'Начать', color: locked ? colors.textDim : colors.primaryLight, locked };
  };

  const renderItem = ({ item, index }: { item: Lesson; index: number }) => {
    const s = statusOf(item, index);
    const tasks = tasksByLesson(item.id);
    return (
      <TouchableOpacity
        activeOpacity={s.locked ? 1 : 0.85}
        onPress={() => {
          if (!s.locked) navigation.navigate('Lesson', { lessonId: item.id, title: item.title });
        }}>
        <Card style={[styles.card, s.locked && { opacity: 0.55 }]}>
          <View style={styles.row}>
            <View style={[styles.num, { borderColor: s.color }]}>
              <Text style={[styles.numText, { color: s.color }]}>{index + 1}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc} numberOfLines={2}>
                {item.content.shortDescription || item.content.description}
              </Text>
              <View style={styles.metaRow}>
                <Pill text={s.label} color={s.color} bg={s.color + '22'} />
                <Pill text={`${tasks.length} заданий`} />
                {!!item.content.xpReward && <Pill text={`+${item.content.xpReward} XP`} color={colors.accent} bg={colors.accent + '1A'} />}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={lessons}
        keyExtractor={(l) => l.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  num: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  numText: { fontSize: 16, fontWeight: '800' },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  desc: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: spacing.sm, flexWrap: 'wrap' },
});
