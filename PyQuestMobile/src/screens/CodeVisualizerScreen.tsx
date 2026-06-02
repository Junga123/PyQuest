import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { colors, radius, spacing } from '../theme/theme';
import { Button, CodeBlock, Pill } from '../components/UI';
import { CoursesStackParamList } from '../navigation/types';
import { getTrace, TraceBundle } from '../data/traces';

type Rt = RouteProp<CoursesStackParamList, 'CodeVisualizer'>;

// Пошаговая визуализация исполнения кода (аналог Python Tutor):
// — подсветка текущей строки в коде,
// — панель «Переменные» с состоянием на каждом шаге,
// — накопленный вывод программы (stdout),
// — авто-проигрывание и ручное перемещение по шагам.
export const CodeVisualizerScreen: React.FC = () => {
  const route = useRoute<Rt>();
  const bundle: TraceBundle | null = useMemo(
    () => getTrace(route.params?.traceId),
    [route.params?.traceId],
  );

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = bundle?.steps ?? [];
  const total = steps.length;
  const current = steps[step];

  // авто-проигрывание
  useEffect(() => {
    if (!playing) return;
    if (step >= total - 1) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setStep((s) => Math.min(s + 1, total - 1)), 1100);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, step, total]);

  if (!bundle) {
    return (
      <View style={styles.center}>
        <Text style={styles.bigEmoji}>📭</Text>
        <Text style={styles.muted}>Для этого задания визуализация недоступна</Text>
      </View>
    );
  }

  // накопленный вывод до текущего шага включительно
  const stdout = steps
    .slice(0, step + 1)
    .map((s) => s.stdout)
    .filter(Boolean)
    .join('\n');

  const varEntries = Object.entries(current?.locals || {});

  const reset = () => {
    setPlaying(false);
    setStep(0);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pill text="Визуализация исполнения" color={colors.accent} bg={colors.accent + '1A'} />
        <Text style={styles.title}>{route.params?.title || bundle.title}</Text>

        <CodeBlock code={bundle.code} highlightLine={current?.lineno} style={{ marginTop: spacing.md }} />

        {/* Текущий шаг / пояснение */}
        <View style={styles.stepCard}>
          <Text style={styles.stepCounter}>
            Шаг {step + 1} / {total} · строка {current?.lineno} · {current?.function}()
          </Text>
          {!!current?.note && <Text style={styles.note}>{current.note}</Text>}
        </View>

        {/* Панель переменных */}
        <Text style={styles.panelTitle}>Переменные</Text>
        <View style={styles.varsPanel}>
          {varEntries.length === 0 ? (
            <Text style={styles.varEmpty}>— пока нет локальных переменных —</Text>
          ) : (
            varEntries.map(([k, v]) => (
              <View key={k} style={styles.varRow}>
                <Text style={styles.varName}>{k}</Text>
                <Text style={styles.varArrow}>=</Text>
                <Text style={styles.varValue}>{v}</Text>
              </View>
            ))
          )}
        </View>

        {/* Вывод программы */}
        <Text style={styles.panelTitle}>Вывод программы</Text>
        <View style={styles.stdoutPanel}>
          <Text style={styles.stdoutText}>{stdout || '(пусто)'}</Text>
        </View>
      </ScrollView>

      {/* Панель управления */}
      <View style={styles.controls}>
        <Button title="⟲" variant="ghost" onPress={reset} style={styles.ctrlSmall} />
        <Button
          title="‹ Назад"
          variant="ghost"
          onPress={() => {
            setPlaying(false);
            setStep((s) => Math.max(0, s - 1));
          }}
          disabled={step === 0}
          style={styles.ctrl}
        />
        <Button
          title={playing ? '⏸' : '▶'}
          variant="accent"
          onPress={() => setPlaying((p) => !p)}
          disabled={step >= total - 1 && !playing}
          style={styles.ctrlSmall}
        />
        <Button
          title="Вперёд ›"
          onPress={() => {
            setPlaying(false);
            setStep((s) => Math.min(total - 1, s + 1));
          }}
          disabled={step >= total - 1}
          style={styles.ctrl}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  bigEmoji: { fontSize: 56, marginBottom: spacing.md },
  muted: { color: colors.textMuted, fontSize: 15, textAlign: 'center' },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: spacing.sm },
  stepCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  stepCounter: { color: colors.accent, fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },
  note: { color: colors.text, fontSize: 14, marginTop: spacing.sm, lineHeight: 21 },
  panelTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.lg, marginBottom: spacing.sm },
  varsPanel: { backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, minHeight: 50 },
  varEmpty: { color: colors.textDim, fontSize: 14, fontStyle: 'italic' },
  varRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  varName: { color: colors.synFunc, fontFamily: 'monospace', fontSize: 15, fontWeight: '700', minWidth: 70 },
  varArrow: { color: colors.textDim, fontFamily: 'monospace', fontSize: 15, marginHorizontal: 8 },
  varValue: { color: colors.synNumber, fontFamily: 'monospace', fontSize: 15, flex: 1 },
  stdoutPanel: { backgroundColor: '#0A1120', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, minHeight: 44 },
  stdoutText: { color: colors.synString, fontFamily: 'monospace', fontSize: 14, lineHeight: 20 },
  controls: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgElevated },
  ctrl: { flex: 1 },
  ctrlSmall: { width: 52 },
});
