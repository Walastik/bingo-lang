import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getBallString, getBallColor } from '../utils/bingoUtils';

interface BingoBallProps {
  value: number;
  size?: 'small' | 'large';
  /** Disables shadow/elevation — avoids Android compositing flicker */
  flat?: boolean;
}

const BingoBall = memo(({ value, size = 'small', flat = false }: BingoBallProps) => {
  const ballText = getBallString(value);
  const backgroundColor = getBallColor(value);

  const dimension = size === 'large' ? 120 : 50;
  const fontSize = size === 'large' ? 32 : 16;

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
