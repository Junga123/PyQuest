import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../theme/theme';
import { Button, Card, CodeBlock, Pill } from '../components/UI';
import { CoursesStackParamList } from '../navigation/types';
import {
  CodeValidation,
  FillGapValidation,
  Lesson,
  MultipleChoiceValidation,
  Task,
} from '../types';
import * as api from '../api/mockApi';
import { findLesson, tasksByLesson } from '../data/courses';
import { getTrace } from '../data/traces';
import { useApp } from '../context/AppContext';

type Nav = NativeStackNavigationProp<CoursesStackParamList, 'Lesson'>;
type Rt = RouteProp<CoursesStackParamList, 'Lesson'>;

export const LessonScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { lessonId } = route.params;
  const { refresh } = useApp();

  const lesson = useMemo<Lesson | undefined>(() => findLesson(lessonId), [lessonId]);
  const tasks = useMemo<Task[]>(() => tasksByLesson(lessonId), [lessonId]);

  const [phase, setPhase] = useState<'theory' | 'tasks' | 'done'>('theory');
  const [index, setIndex] = useState(0);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    api.startLesson(lessonId);
  }, [lessonId]);

  const onTaskSolved = useCallback(
    (xp: number) => {
      setEarned((e) => e + xp);
      refresh();
    },
    [refresh],
  );

  const next = () => {
    if (index + 1 < tasks.length) setIndex(index + 1);
    else setPhase('done');
  };

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Урок не найден</Text>
      </View>
    );
  }

  if (phase === 'theory') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pill text="Теория" color={colors.primaryLight} bg={colors.primary + '22'} />
        <Text style={styles.h1}>{lesson.title}</Text>
        <Text style={styles.lead}>{lesson.content.description}</Text>

        {(lesson.content.theory || []).map((block, i) => {
          if (block.type === 'code') return <CodeBlock key={i} code={block.value} style={{ marginTop: spacing.md }} />;
          if (block.type === 'note') {
            return (
              <View key={i} style={styles.note}>
                <Text style={styles.noteText}>💡 {block.value}</Text>
              </View>
            );
          }
          return (
            <Text key={i} style={styles.paragraph}>
              {block.value}
            </Text>
          );
        })}

        <Button
          title={`Перейти к заданиям (${tasks.length})`}
          onPress={() => setPhase('tasks')}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    );
  }

  if (phase === 'done') {
    return (
      <View style={styles.center}>
        <Text style={styles.bigEmoji}>🎉</Text>
        <Text style={styles.h1}>Урок пройден!</Text>
        <Text style={styles.lead}>Вы заработали в этой сессии</Text>
        <Text style={styles.xpBig}>+{earned} XP</Text>
        <Button title="Вернуться к курсу" onPress={() => navigation.goBack()} style={{ marginTop: spacing.xl, alignSelf: 'stretch' }} />
      </View>
    );
  }

  const task = tasks[index];
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.progressHeader}>
        <Text style={styles.muted}>
          Задание {index + 1} из {tasks.length}
        </Text>
        <Pill text={`+${task.xp_reward} XP`} color={colors.accent} bg={colors.accent + '1A'} />
      </View>
      <TaskView
        key={task.id}
        task={task}
        onSolved={onTaskSolved}
        onNext={next}
        onVisualize={(traceId, title) =>
          navigation.navigate('CodeVisualizer', { traceId, title, task })
        }
      />
    </ScrollView>
  );
};

// ===================== Один таск (4 типа) =====================
const TaskView: React.FC<{
  task: Task;
  onSolved: (xp: number) => void;
  onNext: () => void;
  onVisualize: (traceId?: string, title?: string) => void;
}> = ({ task, onSolved, onNext, onVisualize }) => {
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // ввод по типам
  const [choice, setChoice] = useState<number | null>(null);
  const [gap, setGap] = useState('');
  const codeStart =
    task.task_type === 'write_code' || task.task_type === 'debug_code'
      ? (task.validation as CodeValidation).starterCode || ''
      : '';
  const [code, setCode] = useState(codeStart);

  const submit = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const body =
        task.task_type === 'multiple_choice'
          ? { answer: choice ?? -1 }
          : task.task_type === 'fill_gap'
          ? { answer: gap }
          : { code, step_through: true };
      const res = await api.attemptTask(task.id, body);
      if (res.ok) {
        setSolved(true);
        setFeedback({ ok: true, text: `Верно! +${res.xpEarned} XP` });
        onSolved(res.xpEarned);
      } else {
        const why = res.output?.stderr ? `\n${res.output.stderr}` : '';
        setFeedback({ ok: false, text: `Пока неверно. Попробуйте ещё раз.${why}` });
      }
    } catch (e: any) {
      setFeedback({ ok: false, text: e?.message || 'Ошибка' });
    } finally {
      setLoading(false);
    }
  };

  const isCode = task.task_type === 'write_code' || task.task_type === 'debug_code';
  const traceId = isCode ? (task.validation as CodeValidation).traceId : undefined;

  return (
    <Card>
      <Pill text={TASK_TYPE_LABEL[task.task_type]} color={colors.primaryLight} bg={colors.primary + '22'} />
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.prompt}>{task.prompt}</Text>

      {/* MULTIPLE CHOICE */}
      {task.task_type === 'multiple_choice' && (
        <View style={{ marginTop: spacing.md }}>
          {(task.validation as MultipleChoiceValidation).options.map((opt, i) => {
            const selected = choice === i;
            const correct = (task.validation as MultipleChoiceValidation).correctAnswerIndex === i;
            const showState = solved || (feedback && !feedback.ok && selected);
            const bg = showState && correct ? colors.successBg : showState && selected ? colors.dangerBg : selected ? colors.cardAlt : colors.bgElevated;
            const border = selected ? colors.primary : colors.border;
            return (
              <TouchableOpacity
                key={i}
                disabled={solved}
                activeOpacity={0.8}
                onPress={() => setChoice(i)}
                style={[styles.option, { backgroundColor: bg, borderColor: border }]}>
                <View style={[styles.radio, selected && { borderColor: colors.primary }]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* FILL GAP */}
      {task.task_type === 'fill_gap' && (
        <View style={{ marginTop: spacing.md }}>
          {!!(task.validation as FillGapValidation).template && (
            <CodeBlock code={(task.validation as FillGapValidation).template!.replace(/___/g, '▢▢▢')} />
          )}
          <TextInput
            style={styles.codeInput}
            placeholder="Ваш ответ"
            placeholderTextColor={colors.textDim}
            autoCapitalize="none"
            autoCorrect={false}
            value={gap}
            onChangeText={setGap}
            editable={!solved}
          />
        </View>
      )}

      {/* CODE */}
      {isCode && (
        <View style={{ marginTop: spacing.md }}>
          <Text style={styles.editorLabel}>Редактор кода (Python):</Text>
          <TextInput
            style={styles.editor}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            value={code}
            onChangeText={setCode}
            editable={!solved}
          />
          <View style={styles.codeButtons}>
            <Button
              title="👁 Визуализировать"
              variant="ghost"
              onPress={() => onVisualize(traceId, task.title)}
              style={{ flex: 1 }}
            />
            {!solved && (
              <Button
                title="Решение"
                variant="ghost"
                onPress={() => {
                  const b = getTrace(traceId);
                  if (b) setCode(stripHarness(b.code));
                }}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </View>
      )}

      {/* HINT */}
      {!!task.hint && (
        <TouchableOpacity onPress={() => setShowHint((s) => !s)} style={{ marginTop: spacing.md }}>
          <Text style={styles.hintToggle}>{showHint ? '▼' : '▶'} Подсказка</Text>
        </TouchableOpacity>
      )}
      {showHint && !!task.hint && <Text style={styles.hint}>{task.hint}</Text>}

      {/* FEEDBACK */}
      {!!feedback && (
        <View style={[styles.feedback, { backgroundColor: feedback.ok ? colors.successBg : colors.dangerBg }]}>
          <Text style={[styles.feedbackText, { color: feedback.ok ? colors.success : colors.danger }]}>
            {feedback.ok ? '✓ ' : '✕ '}
            {feedback.text}
          </Text>
        </View>
      )}

      {/* ACTIONS */}
      {!solved ? (
        <Button
          title="Проверить"
          onPress={submit}
          loading={loading}
          disabled={task.task_type === 'multiple_choice' && choice === null}
          style={{ marginTop: spacing.lg }}
        />
      ) : (
        <Button title="Далее →" variant="success" onPress={onNext} style={{ marginTop: spacing.lg }} />
      )}
    </Card>
  );
};

// Убирает из «эталонного» кода визуализации вызовы print/тестов — оставляет решение.
function stripHarness(code: string): string {
  return code
    .split('\n')
    .filter((l) => !/^\s*print\(/.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const TASK_TYPE_LABEL: Record<string, string> = {
  multiple_choice: 'Выбор ответа',
  fill_gap: 'Заполни пропуск',
  write_code: 'Напиши код',
  debug_code: 'Найди ошибку',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  h1: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: spacing.sm },
  lead: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm, lineHeight: 22 },
  paragraph: { color: colors.text, fontSize: 15, lineHeight: 23, marginTop: spacing.md },
  note: { backgroundColor: colors.primary + '1A', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary },
  noteText: { color: colors.text, fontSize: 14, lineHeight: 21 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  muted: { color: colors.textMuted, fontSize: 14 },
  taskTitle: { color: colors.text, fontSize: 19, fontWeight: '700', marginTop: spacing.sm },
  prompt: { color: colors.text, fontSize: 15, marginTop: spacing.sm, lineHeight: 22 },
  option: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.textDim, marginRight: spacing.md, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optionText: { color: colors.text, fontSize: 15, flex: 1 },
  codeInput: { backgroundColor: '#0A1120', borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.text, fontFamily: 'monospace', fontSize: 15, marginTop: spacing.md },
  editorLabel: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
  editor: { backgroundColor: '#0A1120', borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, color: colors.text, fontFamily: 'monospace', fontSize: 14, minHeight: 140, textAlignVertical: 'top', lineHeight: 21 },
  codeButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  hintToggle: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  hint: { color: colors.textMuted, fontSize: 14, marginTop: spacing.sm, fontStyle: 'italic', lineHeight: 21 },
  feedback: { borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg },
  feedbackText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  bigEmoji: { fontSize: 64, marginBottom: spacing.md },
  xpBig: { color: colors.accent, fontSize: 40, fontWeight: '900', marginTop: spacing.sm },
});
