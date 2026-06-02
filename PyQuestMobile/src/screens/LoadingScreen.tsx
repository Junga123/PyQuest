import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Palette, spacing } from '../theme/theme';
import { useTheme, useThemedStyles } from '../theme/ThemeContext';
import { LOGO_DATA_URI } from '../data/images';

export const LoadingScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      <Image source={{ uri: LOGO_DATA_URI }} style={styles.logo} />
      <Text style={styles.title}>PyQuest</Text>
      <Text style={styles.tagline}>Изучай Python в игре</Text>
      <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      <View style={styles.footer}>
        <Text style={styles.author}>Автор: Кутуева Алёна</Text>
        <Text style={styles.org}>Науч. руководитель: Анисимова Эллина Сергеевна</Text>
        <Text style={styles.org}>Елабужский институт КФУ · 2026</Text>
      </View>
    </View>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' },
    logo: { width: 120, height: 120, borderRadius: 28 },
    title: { color: c.text, fontSize: 34, fontWeight: '900', marginTop: spacing.lg, letterSpacing: 0.5 },
    tagline: { color: c.textMuted, fontSize: 15, marginTop: spacing.xs },
    footer: { position: 'absolute', bottom: 40, alignItems: 'center' },
    author: { color: c.text, fontSize: 14, fontWeight: '600' },
    org: { color: c.textDim, fontSize: 12, marginTop: 2 },
  });
