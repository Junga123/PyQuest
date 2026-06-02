import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

// Лёгкая анимация конфетти (без нативных зависимостей, useNativeDriver).
const COLORS = ['#FFD43B', '#3776AB', '#3DD68C', '#FF7AB2', '#C792EA', '#4B8BC4'];
const COUNT = 18;

const Piece: React.FC<{ index: number; width: number; height: number }> = ({ index, width, height }) => {
  const v = useRef(new Animated.Value(0)).current;
  const startX = (width / COUNT) * index + (index % 3) * 8;
  const size = 7 + (index % 4) * 2;
  const color = COLORS[index % COLORS.length];
  const drift = ((index % 5) - 2) * 22;
  const spins = 2 + (index % 3);

  useEffect(() => {
    Animated.loop(
      Animated.timing(v, {
        toValue: 1,
        duration: 2200 + (index % 6) * 250,
        delay: (index % 8) * 90,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: 2 },
    ).start();
  }, [v, index]);

  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [-30, height + 30] });
  const translateX = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, drift, 0] });
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spins * 360}deg`] });
  const opacity = v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        width: size,
        height: size * 1.6,
        borderRadius: 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
};

export const Confetti: React.FC = () => {
  const { width, height } = Dimensions.get('window');
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: COUNT }).map((_, i) => (
        <Piece key={i} index={i} width={width} height={height} />
      ))}
    </View>
  );
};
