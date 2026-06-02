import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
import { radius } from '../theme/theme';
import { HERO_GRADIENT } from '../data/assets';

// Градиентный баннер (настоящий градиент через сгенерированный PNG, без нативных
// зависимостей). Используется как «шапка» на экранах для премиум-вида.
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
      {/* лёгкое затемнение для контраста текста */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(8,14,30,0.18)' }]} />
      {children}
    </ImageBackground>
  );
};
