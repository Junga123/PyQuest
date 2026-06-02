import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { tokenizeLine } from './UI';

// Редактор кода Python с:
//  — живой подсветкой синтаксиса (подсвеченный Text под прозрачным TextInput),
//  — автодополнением: чипы вставляют типовые токены в позицию курсора.
// F4.3 ТЗ. Без нативных зависимостей.

const SNIPPETS = ['def ', 'return ', 'for ', ' in ', 'range(', 'if ', 'else:', 'elif ', 'while ', 'print(', 'self.', 'len(', '== ', '+= ', ':', '()', '[]', '{}'];

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  editable?: boolean;
  minHeight?: number;
}

export const CodeEditor: React.FC<Props> = ({ value, onChangeText, editable = true, minHeight = 150 }) => {
  const { colors } = useTheme();
  const [sel, setSel] = useState<{ start: number; end: number }>({ start: value.length, end: value.length });

  const insert = (token: string) => {
    const { start, end } = sel;
    const next = value.slice(0, start) + token + value.slice(end);
    onChangeText(next);
    const pos = start + token.length;
    setSel({ start: pos, end: pos });
  };

  const textStyle = {
    fontFamily: 'monospace' as const,
    fontSize: 14,
    lineHeight: 21,
    padding: spacing.md,
  };

  const lines = value.replace(/\t/g, '    ').split('\n');

  return (
    <View>
      <View style={[styles.box, { backgroundColor: colors.codeBg, borderColor: colors.border, minHeight }]}>
        {/* подсвеченный слой */}
        <Text style={[textStyle, StyleSheet.absoluteFillObject as any]} pointerEvents="none">
          {lines.map((line, i) => (
            <Text key={i}>
              {tokenizeLine(line, colors).map((tk, j) => (
                <Text key={j} style={{ color: tk.color }}>
                  {tk.text}
                </Text>
              ))}
              {i < lines.length - 1 ? '\n' : ''}
            </Text>
          ))}
        </Text>
        {/* прозрачный ввод поверх */}
        <TextInput
          style={[textStyle, { color: 'transparent', minHeight, textAlignVertical: 'top' }]}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          value={value}
          onChangeText={onChangeText}
          onSelectionChange={(e) => setSel(e.nativeEvent.selection)}
          editable={editable}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          caretHidden={false}
        />
      </View>

      {editable && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ gap: 6 }}>
          {SNIPPETS.map((sn) => (
            <TouchableOpacity key={sn} onPress={() => insert(sn)} style={[styles.chip, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
              <Text style={[styles.chipText, { color: colors.synFunc }]}>{sn.trim() || sn}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  box: { borderRadius: radius.md, borderWidth: 1, overflow: 'hidden' },
  chips: { marginTop: spacing.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.sm, borderWidth: 1 },
  chipText: { fontFamily: 'monospace', fontSize: 14, fontWeight: '700' },
});
