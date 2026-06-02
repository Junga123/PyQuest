import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Palette, radius, spacing } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';

export const Card: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.glass,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.22,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        },
        style,
      ]}>
      {/* стеклянный блик по верхней кромке */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, backgroundColor: colors.glassHi }}
      />
      {children}
    </View>
  );
};

export const Button: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'ghost' | 'success' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}> = ({ title, onPress, variant = 'primary', disabled, loading, style, icon }) => {
  const { colors } = useTheme();
  const bg = {
    primary: colors.primary,
    accent: colors.accent,
    ghost: 'transparent',
    success: colors.success,
    danger: colors.danger,
  }[variant];
  const fg = variant === 'accent' ? colors.accentText : variant === 'ghost' ? colors.text : '#06121F';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          flexDirection: 'row',
          paddingVertical: 14,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'ghost' && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
          <Text style={{ fontSize: 16, fontWeight: '700', color: fg }}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export const Pill: React.FC<{ text: string; color?: string; bg?: string }> = ({ text, color, bg }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.sm,
        alignSelf: 'flex-start',
        backgroundColor: bg ?? colors.cardAlt,
      }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: color ?? colors.textMuted }}>{text}</Text>
    </View>
  );
};

export const ProgressBar: React.FC<{ value: number; color?: string; height?: number }> = ({
  value,
  color,
  height = 8,
}) => {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const target = Math.max(0, Math.min(1, value));
  useEffect(() => {
    Animated.timing(anim, { toValue: target, duration: 650, useNativeDriver: false }).start();
  }, [anim, target]);
  return (
    <View style={{ backgroundColor: colors.cardAlt, overflow: 'hidden', width: '100%', height, borderRadius: height / 2 }}>
      <Animated.View
        style={{
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          height,
          borderRadius: height / 2,
          backgroundColor: color ?? colors.accent,
        }}
      />
    </View>
  );
};

// ---- Лёгкая подсветка синтаксиса Python (нативная) ----
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

export function tokenizeLine(line: string, c: Palette): Tok[] {
  const toks: Tok[] = [];
  const hashIdx = line.indexOf('#');
  let code = line;
  let comment = '';
  if (hashIdx >= 0) {
    code = line.slice(0, hashIdx);
    comment = line.slice(hashIdx);
  }
  const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+\.?\d*\b|[A-Za-z_]\w*|\s+|[^\sA-Za-z_0-9])/g;
  const parts = code.match(re) || [code];
  for (const p of parts) {
    if (/^["']/.test(p)) toks.push({ text: p, color: c.synString });
    else if (/^\d/.test(p)) toks.push({ text: p, color: c.synNumber });
    else if (KEYWORDS.has(p)) toks.push({ text: p, color: c.synKeyword });
    else if (BUILTINS.has(p)) toks.push({ text: p, color: c.synBuiltin });
    else toks.push({ text: p, color: '#EAF0FB' });
  }
  if (comment) toks.push({ text: comment, color: c.synComment });
  return toks;
}

export const CodeBlock: React.FC<{
  code: string;
  highlightLine?: number;
  style?: ViewStyle;
}> = ({ code, highlightLine, style }) => {
  const { colors } = useTheme();
  const lines = code.replace(/\t/g, '    ').split('\n');
  return (
    <View
      style={[
        { backgroundColor: colors.codeBg, borderRadius: radius.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border },
        style,
      ]}>
      {lines.map((line, idx) => {
        const isHL = highlightLine === idx + 1;
        return (
          <View
            key={idx}
            style={[
              { flexDirection: 'row', paddingHorizontal: spacing.sm, paddingVertical: 1 },
              isHL && { backgroundColor: colors.highlightLine },
            ]}>
            <Text style={{ color: colors.textDim, fontFamily: 'monospace', fontSize: 13, width: 26, textAlign: 'right', marginRight: 10 }}>
              {String(idx + 1).padStart(2, ' ')}
            </Text>
            <Text style={{ fontFamily: 'monospace', fontSize: 13, flex: 1, lineHeight: 20 }}>
              {tokenizeLine(line, colors).map((tk, i) => (
                <Text key={i} style={{ color: tk.color }}>
                  {tk.text}
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

export const SectionTitle: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({ children, style }) => {
  const { colors } = useTheme();
  return <Text style={[{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: spacing.sm }, style]}>{children}</Text>;
};

// заглушка (стили теперь инлайновые/темовые)
export const _styles = StyleSheet.create({});
