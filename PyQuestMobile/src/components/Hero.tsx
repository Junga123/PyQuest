import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
import { radius } from '../theme/theme';
import { HERO_GRADIENT } from '../data/assets';

// Чистая градиентная шапка (настоящий градиент через PNG). Без бликов —
// современный минималистичный вид, лёгкое затемнение лишь для контраста текста.
export const Hero: React.FC<{ children: React.ReactNode; style?: ViewStyle; rounded?: boolean }> = ({
  children,
  style,
  rounded = true,
}) => {
  const br = rounded ? radius.xl : 0;
  return (
    <ImageBackground
      source={{ uri: HERO_GRADIENT }}
      style={[{ overflow: 'hidden', borderRadius: br }, style]}
      imageStyle={{ borderRadius: br }}
      resizeMode="cover">
      <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(8,12,26,0.14)' }]} />
      {children}
    </ImageBackground>
  );
};
