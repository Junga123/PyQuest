import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/theme';
import { LOGO_DATA_URI } from '../data/images';

export const LoadingScreen: React.FC = () => (
  <View style={styles.container}>
    <Image source={{ uri: LOGO_DATA_URI }} style={styles.logo} />
    <Text style={styles.title}>PyQuest</Text>
    <Text style={styles.tagline}>Изучай Python в игре</Text>
    <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
    <View style={styles.footer}>
      <Text style={styles.author}>Автор: Кутуева Алёна</Text>
      <Text style={styles.org}>Елабужский институт КФУ · 2026</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 120, height: 120, borderRadius: 28 },
  title: { color: colors.text, fontSize: 34, fontWeight: '900', marginTop: spacing.lg, letterSpacing: 0.5 },
  tagline: { color: colors.textMuted, fontSize: 15, marginTop: spacing.xs },
  footer: { position: 'absolute', bottom: 40, alignItems: 'center' },
  author: { color: colors.text, fontSize: 14, fontWeight: '600' },
  org: { color: colors.textDim, fontSize: 12, marginTop: 2 },
});
