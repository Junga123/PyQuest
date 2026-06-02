import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Palette, radius, spacing } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { Card, Pill, ProgressBar } from '../components/UI';
import { CoursesStackParamList } from '../navigation/types';
import { Course } from '../types';
import * as api from '../api/mockApi';
import { lessonsByCourse } from '../data/courses';
import { useApp } from '../context/AppContext';

type Nav = NativeStackNavigationProp<CoursesStackParamList, 'Courses'>;

const DIFF_LABEL: Record<string, string> = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' };

export const CoursesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useApp();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressByCourse, setProgressByCourse] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    const [cs, allProgress] = await Promise.all([api.getCourses(), api.getAllProgress()]);
    setCourses(cs);
    const map: Record<string, number> = {};
    for (const cc of cs) {
      const lessons = lessonsByCourse(cc.id);
      const done = lessons.filter((l) => allProgress[l.id]?.status === 'completed').length;
      map[cc.id] = lessons.length ? done / lessons.length : 0;
    }
    setProgressByCourse(map);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const renderItem = ({ item }: { item: Course }) => {
    const lessons = lessonsByCourse(item.id);
    const progress = progressByCourse[item.id] ?? 0;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CourseDetail', { courseId: item.id, title: item.title })}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.emojiBox, { backgroundColor: (item.accent || colors.primary) + '22' }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.metaRow}>
                <Pill text={DIFF_LABEL[item.difficulty]} color={item.accent} bg={(item.accent || '') + '22'} />
                <Pill text={`${lessons.length} уроков`} />
              </View>
            </View>
          </View>
          <View style={styles.progressRow}>
            <ProgressBar value={progress} color={item.accent} />
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(cc) => cc.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.greeting}>Привет, {user?.displayName || 'друг'}! 👋</Text>
            <Text style={styles.headerSub}>Выбери курс и продолжай обучение</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    list: { padding: spacing.lg, paddingBottom: spacing.xxl },
    header: { marginBottom: spacing.lg },
    greeting: { color: c.text, fontSize: 24, fontWeight: '800' },
    headerSub: { color: c.textMuted, fontSize: 14, marginTop: 4 },
    card: { marginBottom: spacing.md },
    row: { flexDirection: 'row' },
    flex: { flex: 1 },
    emojiBox: { width: 56, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    emoji: { fontSize: 30 },
    title: { color: c.text, fontSize: 17, fontWeight: '700' },
    desc: { color: c.textMuted, fontSize: 13, marginTop: 2 },
    metaRow: { flexDirection: 'row', gap: 8, marginTop: spacing.sm },
    progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.md },
    progressText: { color: c.textMuted, fontSize: 12, width: 38, textAlign: 'right' },
  });
