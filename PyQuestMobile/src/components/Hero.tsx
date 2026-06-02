import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
import { radius } from '../theme/theme';
import { HERO_GRADIENT } from '../data/assets';

// Градиентная «стеклянная» шапка: настоящий градиент (PNG) + стеклянные блики —
// световая полоса по верхней кромке, мягкая засветка сверху и тонкая нижняя грань.
export const Hero: React.FC<{ children: React.ReactNode; style?: ViewStyle; rounded?: boolean }> = ({
  children,
  style,
  rounded = true,
}) => {
  const br = rounded ? radius.xl : 0;
  return (
    <ImageBackground
      source={{ uri: HERO_GRADIENT }}
      style={[{ overflow: 'hidden', borderRadius: br, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }, style]}
      imageStyle={{ borderRadius: br }}
      resizeMode="cover">
      {/* мягкая верхняя засветка (стеклянный отблеск) */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.05)', bottom: '55%' }]} />
      {/* лёгкое затемнение для контраста текста */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(8,12,26,0.16)' }]} />
      {/* световая полоса по верхней кромке */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, backgroundColor: 'rgba(255,255,255,0.45)' }} />
      {children}
    </ImageBackground>
  );
};
