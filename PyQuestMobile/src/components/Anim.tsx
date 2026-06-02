import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

// Плавное появление (opacity + лёгкий подъём). useNativeDriver — без лагов.
export const FadeInView: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  offset?: number;
}> = ({ children, delay = 0, style, offset = 12 }) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 380,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) }],
        },
      ]}>
      {children}
    </Animated.View>
  );
};
