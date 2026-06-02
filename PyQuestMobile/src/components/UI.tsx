import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

export const Card: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const Button: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'ghost' | 'success' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}> = ({ title, onPress, variant = 'primary', disabled, loading, style }) => {
  const bg = {
    primary: colors.primary,
    accent: colors.accent,
    ghost: 'transparent',
    success: colors.success,
    danger: colors.danger,
  }[variant];
  const fg = variant === 'accent' ? '#1A1300' : variant === 'ghost' ? colors.text : '#06121F';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : 1 },
        variant === 'ghost' && styles.buttonGhost,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export const Pill: React.FC<{ text: string; color?: string; bg?: string }> = ({ text, color, bg }) => (
  <View style={[styles.pill, { backgroundColor: bg ?? colors.cardAlt }]}>
    <Text style={[styles.pillText, { color: color ?? colors.textMuted }]}>{text}</Text>
  </View>
);

export const ProgressBar: React.FC<{ value: number; color?: string; height?: number }> = ({
  value,
  color = colors.accent,
  height = 8,
}) => (
  <View style={[styles.progressTrack, { height, borderRadius: height / 2 }]}>
    <View
      style={{
        width: `${Math.max(0, Math.min(1, value)) * 100}%`,
        height,
        borderRadius: height / 2,
        backgroundColor: color,
      }}
    />
  </View>
);

// ---- Лёгкая подсветка синтаксиса Python (нативная, для код-блоков) ----
const KEYWORDS = new Set([
  'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'and', 'or', 'not',
  'class', 'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'pass',
  'break', 'continue', 'True', 'False', 'None', 'lambda', 'global', 'is', 'self',
]);
const BUILTINS = new Set([
  'print', 'len', 'range', 'int', 'str', 'float', 'list', 'dict', 'set', 'tuple',
  'sum', 'max', 'min', 'append', 'get', 'input', 'type', 'sorted', 'abs',
]);

type Tok = { text: string; color: string };

function tokenizeLine(line: string): Tok[] {
  const toks: Tok[] = [];
  // комментарий
  const hashIdx = line.indexOf('#');
  let code = line;
  let comment = '';
  if (hashIdx >= 0) {
    code = line.slice(0, hashIdx);
    comment = line.slice(hashIdx);
  }
  // разбиваем по строковым литералам и токенам
  const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+\.?\d*\b|[A-Za-z_]\w*|\s+|[^\sA-Za-z_0-9])/g;
  const parts = code.match(re) || [code];
  for (const p of parts) {
    if (/^["']/.test(p)) toks.push({ text: p, color: colors.synString });
    else if (/^\d/.test(p)) toks.push({ text: p, color: colors.synNumber });
    else if (KEYWORDS.has(p)) toks.push({ text: p, color: colors.synKeyword });
    else if (BUILTINS.has(p)) toks.push({ text: p, color: colors.synBuiltin });
    else toks.push({ text: p, color: colors.text });
  }
  if (comment) toks.push({ text: comment, color: colors.synComment });
  return toks;
}

export const CodeBlock: React.FC<{
  code: string;
  highlightLine?: number; // 1-based
  style?: ViewStyle;
}> = ({ code, highlightLine, style }) => {
  const lines = code.replace(/\t/g, '    ').split('\n');
  return (
    <View style={[styles.codeBlock, style]}>
      {lines.map((line, idx) => {
        const isHL = highlightLine === idx + 1;
        return (
          <View
            key={idx}
            style={[styles.codeLine, isHL && { backgroundColor: colors.highlightLine }]}>
            <Text style={styles.codeGutter}>{String(idx + 1).padStart(2, ' ')}</Text>
            <Text style={styles.codeText}>
              {tokenizeLine(line).map((t, i) => (
                <Text key={i} style={{ color: t.color }}>
                  {t.text}
                </Text>
              ))}
              {line.length === 0 ? ' ' : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export const SectionTitle: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({ children, style }) => (
  <Text style={[styles.sectionTitle, style]}>{children}</Text>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGhost: { borderWidth: 1, borderColor: colors.border },
  buttonText: { fontSize: 16, fontWeight: '700' },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: 12, fontWeight: '600' },
  progressTrack: { backgroundColor: colors.cardAlt, overflow: 'hidden', width: '100%' },
  codeBlock: {
    backgroundColor: '#0A1120',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeLine: { flexDirection: 'row', paddingHorizontal: spacing.sm, paddingVertical: 1 },
  codeGutter: {
    color: colors.textDim,
    fontFamily: 'monospace',
    fontSize: 13,
    width: 26,
    textAlign: 'right',
    marginRight: 10,
  },
  codeText: { fontFamily: 'monospace', fontSize: 13, flex: 1, lineHeight: 20 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
});
