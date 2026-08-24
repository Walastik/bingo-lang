import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getBallString, getBallColor } from '@/game/ballFormat';

/** Rendered diameter per size. Layouts that animate a ball must use these. */
export const BALL_SIZES = { small: 50, large: 120 } as const;

export type BallSize = keyof typeof BALL_SIZES;

const FONT_SIZES: Record<BallSize, number> = { small: 16, large: 32 };

interface BingoBallProps {
  value: number;
  size?: BallSize;
  /** Disables shadow/elevation — avoids Android compositing flicker */
  flat?: boolean;
}

const BingoBall = memo(({ value, size = 'small', flat = false }: BingoBallProps) => {
  const ballText = getBallString(value);
  const backgroundColor = getBallColor(value);

  const dimension = BALL_SIZES[size];
  const fontSize = FONT_SIZES[size];

  return (
    <View
      style={[
        styles.ballContainer,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor,
          overflow: 'hidden',
          ...(flat
            ? {}
            : {
                shadowColor: '#000',
                shadowOffset: { width: 4, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }),
        },
      ]}
    >
      <Text style={[styles.ballText, { fontSize, color: '#FFFFFF' }]}>{ballText}</Text>
    </View>
  );
});

BingoBall.displayName = 'BingoBall';

const styles = StyleSheet.create({
  ballContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballText: {
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});

export default BingoBall;
