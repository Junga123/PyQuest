import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Palette, radius, spacing } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { Button, CodeBlock, Pill, ProgressBar } from '../components/UI';
import { FadeInView } from '../components/Anim';
import { Icon } from '../components/Icon';
import { CoursesStackParamList } from '../navigation/types';
import { getTrace, TraceBundle } from '../data/traces';

type Rt = RouteProp<CoursesStackParamList, 'CodeVisualizer'>;

// Пошаговая визуализация исполнения (аналог Python Tutor):
// текущая строка, переменные, стек вызовов, графика списков/словарей, вывод.
export const CodeVisualizerScreen: React.FC = () => {
  const route = useRoute<Rt>();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const bundle: TraceBundle | null = useMemo(() => getTrace(route.params?.traceId), [route.params?.traceId]);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = bundle?.steps ?? [];
  const total = steps.length;
  const current = steps[step];

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

  const stdout = steps
    .slice(0, step + 1)
    .map((s) => s.stdout)
    .filter(Boolean)
    .join('\n');

  const varEntries = Object.entries(current?.locals || {});

  // стек вызовов: используем поле stack, иначе синтезируем из function
  const callStack =
    current?.stack && current.stack.length
      ? [...current.stack].reverse()
      : current?.function === '<module>'
      ? ['<module>']
      : ['<module>', current?.function || ''];

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

        <FadeInView key={step} offset={6} style={styles.stepCard}>
          <Text style={styles.stepCounter}>
            Шаг {step + 1} / {total} · строка {current?.lineno} · {current?.function}()
          </Text>
          {!!current?.note && <Text style={styles.note}>{current.note}</Text>}
        </FadeInView>

        <View style={{ marginTop: spacing.md }}>
          <ProgressBar value={total > 1 ? step / (total - 1) : 1} color={colors.accent} height={6} />
        </View>

        {/* Стек вызовов */}
        <Text style={styles.panelTitle}>Стек вызовов</Text>
        <View style={styles.stackPanel}>
          {callStack.map((fn, i) => (
            <View key={i} style={[styles.stackFrame, { borderColor: i === callStack.length - 1 ? colors.accent : colors.border }]}>
              <Text style={[styles.stackFn, { color: i === callStack.length - 1 ? colors.accent : colors.textMuted }]}>
                {fn}()
              </Text>
              {i === callStack.length - 1 && <Text style={styles.stackTop}>← текущий</Text>}
            </View>
          ))}
        </View>

        {/* Переменные + графика структур */}
        <Text style={styles.panelTitle}>Переменные</Text>
        <View style={styles.varsPanel}>
          {varEntries.length === 0 ? (
            <Text style={styles.varEmpty}>— пока нет локальных переменных —</Text>
          ) : (
            varEntries.map(([k, v]) => <VarView key={k} name={k} value={v} c={colors} styles={styles} />)
          )}
        </View>

        {/* Вывод программы */}
        <Text style={styles.panelTitle}>Вывод программы</Text>
        <View style={styles.stdoutPanel}>
          <Text style={styles.stdoutText}>{stdout || '(пусто)'}</Text>
        </View>
      </ScrollView>

      <View style={styles.controls}>
        <Button title="" variant="ghost" icon={<Icon name="reset" size={18} color={colors.text} />} onPress={reset} style={styles.ctrlSmall} />
        <Button
          title="Назад"
          variant="ghost"
          icon={<Icon name="chevronLeft" size={16} color={colors.text} />}
          onPress={() => {
            setPlaying(false);
            setStep((s) => Math.max(0, s - 1));
          }}
          disabled={step === 0}
          style={styles.ctrl}
        />
        <Button
          title=""
          variant="accent"
          icon={<Icon name={playing ? 'pause' : 'play'} size={18} color={colors.accentText} />}
          onPress={() => setPlaying((p) => !p)}
          disabled={step >= total - 1 && !playing}
          style={styles.ctrlSmall}
        />
        <Button
          title="Вперёд"
          icon={<Icon name="chevronRight" size={16} color="#06121F" />}
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

// Отображение одной переменной: списки и словари рисуются графически.
const VarView: React.FC<{ name: string; value: string; c: Palette; styles: any }> = ({ name, value, c, styles }) => {
  const v = value.trim();

  if (v.startsWith('[') && v.endsWith(']')) {
    const items = splitTop(v.slice(1, -1));
    return (
      <View style={styles.varBlock}>
        <Text style={styles.varName}>{name}</Text>
        <View style={styles.structRow}>
          {items.length === 0 ? (
            <Text style={styles.varEmpty}>[ ]</Text>
          ) : (
            items.map((it, i) => (
              <View key={i} style={styles.cell}>
                <Text style={styles.cellIdx}>{i}</Text>
                <View style={[styles.cellBox, { borderColor: c.synFunc }]}>
                  <Text style={styles.cellVal}>{it}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  }

  if (v.startsWith('{') && v.endsWith('}')) {
    const pairs = splitTop(v.slice(1, -1));
    return (
      <View style={styles.varBlock}>
        <Text style={styles.varName}>{name}</Text>
        <View style={styles.dictWrap}>
          {pairs.length === 0 ? (
            <Text style={styles.varEmpty}>{'{ }'}</Text>
          ) : (
            pairs.map((p, i) => {
              const ci = p.indexOf(':');
              const key = ci >= 0 ? p.slice(0, ci).trim() : p;
              const val = ci >= 0 ? p.slice(ci + 1).trim() : '';
              return (
                <View key={i} style={[styles.dictRow, { borderColor: c.synBuiltin }]}>
                  <Text style={styles.dictKey}>{key}</Text>
                  <Text style={styles.dictArrow}>→</Text>
                  <Text style={styles.dictVal}>{val}</Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.varRow}>
      <Text style={styles.varName}>{name}</Text>
      <Text style={styles.varArrow}>=</Text>
      <Text style={styles.varValue}>{value}</Text>
    </View>
  );
};

// разбивает по запятым верхнего уровня (учитывает вложенные []/{}/'' )
function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  let quote = '';
  for (const ch of s) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    if (ch === '[' || ch === '{' || ch === '(') depth++;
    if (ch === ']' || ch === '}' || ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    center: { flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    bigEmoji: { fontSize: 56, marginBottom: spacing.md },
    muted: { color: c.textMuted, fontSize: 15, textAlign: 'center' },
    title: { color: c.text, fontSize: 20, fontWeight: '800', marginTop: spacing.sm },
    stepCard: { backgroundColor: c.card, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: c.border },
    stepCounter: { color: c.accent, fontSize: 13, fontWeight: '700', fontFamily: 'monospace' },
    note: { color: c.text, fontSize: 14, marginTop: spacing.sm, lineHeight: 21 },
    panelTitle: { color: c.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.lg, marginBottom: spacing.sm },
    stackPanel: { backgroundColor: c.bgElevated, borderRadius: radius.md, padding: spacing.sm, borderWidth: 1, borderColor: c.border },
    stackFrame: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 8, marginVertical: 2 },
    stackFn: { fontFamily: 'monospace', fontSize: 14, fontWeight: '700' },
    stackTop: { color: c.accent, fontSize: 11, fontWeight: '700' },
    varsPanel: { backgroundColor: c.bgElevated, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: c.border, minHeight: 50 },
    varEmpty: { color: c.textDim, fontSize: 14, fontStyle: 'italic' },
    varRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
    varBlock: { paddingVertical: 6 },
    varName: { color: c.synFunc, fontFamily: 'monospace', fontSize: 15, fontWeight: '700', minWidth: 70 },
    varArrow: { color: c.textDim, fontFamily: 'monospace', fontSize: 15, marginHorizontal: 8 },
    varValue: { color: c.synNumber, fontFamily: 'monospace', fontSize: 15, flex: 1 },
    structRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 6 },
    cell: { alignItems: 'center' },
    cellIdx: { color: c.textDim, fontSize: 10, fontFamily: 'monospace', marginBottom: 2 },
    cellBox: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, minWidth: 34, alignItems: 'center', backgroundColor: c.codeBg },
    cellVal: { color: c.synNumber, fontFamily: 'monospace', fontSize: 14, fontWeight: '700' },
    dictWrap: { marginTop: 6, gap: 6 },
    dictRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: c.codeBg },
    dictKey: { color: c.synString, fontFamily: 'monospace', fontSize: 14, fontWeight: '700' },
    dictArrow: { color: c.textDim, marginHorizontal: 10, fontSize: 14 },
    dictVal: { color: c.synNumber, fontFamily: 'monospace', fontSize: 14, fontWeight: '700' },
    stdoutPanel: { backgroundColor: c.codeBg, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: c.border, minHeight: 44 },
    stdoutText: { color: c.synString, fontFamily: 'monospace', fontSize: 14, lineHeight: 20 },
    controls: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.bgElevated },
    ctrl: { flex: 1 },
    ctrlSmall: { width: 52 },
  });
