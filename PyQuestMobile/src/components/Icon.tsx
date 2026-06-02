import React from 'react';
import { View } from 'react-native';

// Векторные иконки, нарисованные из View-примитивов — без эмодзи и без нативных
// зависимостей (react-native-vector-icons). Гарантированно рендерятся одинаково
// на любом Android/iOS и принимают цвет через prop `color` (тинт активного таба).

export type IconName =
  | 'book'
  | 'chart'
  | 'medal'
  | 'person'
  | 'sliders'
  | 'eye'
  | 'share'
  | 'play'
  | 'pause'
  | 'reset'
  | 'chevronLeft'
  | 'chevronRight';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon: React.FC<Props> = ({ name, size = 24, color = '#fff' }) => {
  const s = size;
  const box = { width: s, height: s, alignItems: 'center' as const, justifyContent: 'center' as const };
  const stroke = Math.max(2, Math.round(s * 0.09));

  switch (name) {
    case 'book':
      return (
        <View style={box}>
          <View
            style={{
              width: s * 0.7,
              height: s * 0.82,
              borderWidth: stroke,
              borderColor: color,
              borderRadius: s * 0.1,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: stroke,
              height: s * 0.82,
              backgroundColor: color,
              left: s * 0.28,
            }}
          />
        </View>
      );

    case 'chart': {
      const bar = (h: number, mb = 0) => (
        <View
          style={{
            width: s * 0.16,
            height: s * h,
            backgroundColor: color,
            borderRadius: stroke / 2,
            marginBottom: mb,
          }}
        />
      );
      return (
        <View style={[box, { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }]}>
          {bar(0.38)}
          <View style={{ width: s * 0.07 }} />
          {bar(0.66)}
          <View style={{ width: s * 0.07 }} />
          {bar(0.5)}
        </View>
      );
    }

    case 'medal':
      return (
        <View style={box}>
          {/* лента */}
          <View
            style={{
              position: 'absolute',
              top: s * 0.05,
              width: stroke,
              height: s * 0.4,
              backgroundColor: color,
              transform: [{ rotate: '24deg' }],
              left: s * 0.36,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: s * 0.05,
              width: stroke,
              height: s * 0.4,
              backgroundColor: color,
              transform: [{ rotate: '-24deg' }],
              right: s * 0.36,
            }}
          />
          {/* кружок медали */}
          <View
            style={{
              position: 'absolute',
              bottom: s * 0.04,
              width: s * 0.5,
              height: s * 0.5,
              borderRadius: s * 0.25,
              borderWidth: stroke,
              borderColor: color,
            }}
          />
        </View>
      );

    case 'person':
      return (
        <View style={box}>
          <View
            style={{
              width: s * 0.36,
              height: s * 0.36,
              borderRadius: s * 0.18,
              borderWidth: stroke,
              borderColor: color,
              marginBottom: s * 0.04,
            }}
          />
          <View
            style={{
              width: s * 0.62,
              height: s * 0.34,
              borderTopLeftRadius: s * 0.31,
              borderTopRightRadius: s * 0.31,
              borderWidth: stroke,
              borderBottomWidth: 0,
              borderColor: color,
            }}
          />
        </View>
      );

    case 'sliders': {
      const row = (knobLeft: number) => (
        <View style={{ width: s * 0.78, height: stroke, backgroundColor: color, borderRadius: stroke, justifyContent: 'center' }}>
          <View
            style={{
              position: 'absolute',
              width: s * 0.16,
              height: s * 0.16,
              borderRadius: s * 0.05,
              backgroundColor: color,
              left: knobLeft,
              top: -s * 0.08 + stroke / 2,
            }}
          />
        </View>
      );
      return (
        <View style={[box, { justifyContent: 'space-between', paddingVertical: s * 0.18 }]}>
          {row(s * 0.5)}
          {row(s * 0.12)}
          {row(s * 0.42)}
        </View>
      );
    }

    case 'eye':
      return (
        <View style={box}>
          <View
            style={{
              width: s * 0.8,
              height: s * 0.5,
              borderRadius: s * 0.25,
              borderWidth: stroke,
              borderColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View style={{ width: s * 0.2, height: s * 0.2, borderRadius: s * 0.1, backgroundColor: color }} />
          </View>
        </View>
      );

    case 'share':
      return (
        <View style={box}>
          {/* короб */}
          <View
            style={{
              position: 'absolute',
              bottom: s * 0.08,
              width: s * 0.62,
              height: s * 0.42,
              borderWidth: stroke,
              borderTopWidth: 0,
              borderColor: color,
              borderBottomLeftRadius: s * 0.08,
              borderBottomRightRadius: s * 0.08,
            }}
          />
          {/* стрелка вверх */}
          <View style={{ position: 'absolute', top: s * 0.08, width: stroke, height: s * 0.42, backgroundColor: color }} />
          <View style={{ position: 'absolute', top: s * 0.1, width: s * 0.22, height: stroke, backgroundColor: color, borderRadius: stroke, transform: [{ rotate: '45deg' }], left: s * 0.31 }} />
          <View style={{ position: 'absolute', top: s * 0.1, width: s * 0.22, height: stroke, backgroundColor: color, borderRadius: stroke, transform: [{ rotate: '-45deg' }], right: s * 0.31 }} />
        </View>
      );

    case 'play':
      return (
        <View style={box}>
          <View
            style={{
              width: 0,
              height: 0,
              borderTopWidth: s * 0.28,
              borderBottomWidth: s * 0.28,
              borderLeftWidth: s * 0.44,
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: color,
              marginLeft: s * 0.1,
            }}
          />
        </View>
      );

    case 'pause':
      return (
        <View style={[box, { flexDirection: 'row' }]}>
          <View style={{ width: s * 0.2, height: s * 0.56, backgroundColor: color, borderRadius: stroke / 2, marginRight: s * 0.1 }} />
          <View style={{ width: s * 0.2, height: s * 0.56, backgroundColor: color, borderRadius: stroke / 2 }} />
        </View>
      );

    case 'reset':
      return (
        <View style={box}>
          <View
            style={{
              width: s * 0.5,
              height: s * 0.5,
              borderRadius: s * 0.25,
              borderWidth: stroke,
              borderColor: color,
              borderTopColor: 'transparent',
            }}
          />
          <View style={{ position: 'absolute', top: s * 0.16, right: s * 0.22, width: stroke, height: s * 0.16, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
        </View>
      );

    case 'chevronLeft':
    case 'chevronRight':
      return (
        <View style={box}>
          <View
            style={{
              width: s * 0.32,
              height: s * 0.32,
              borderColor: color,
              borderLeftWidth: stroke,
              borderBottomWidth: stroke,
              transform: [{ rotate: name === 'chevronLeft' ? '45deg' : '-135deg' }],
            }}
          />
        </View>
      );

    default:
      return <View style={box} />;
  }
};
