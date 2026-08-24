import React from 'react';
import { Animated, Text, View } from 'react-native';
import { WinningCardViewStyles } from './WinningCardView.styles';

interface WinningCardCellProps {
  value: number | 'FREE';
  cellSize: number;
  isDaubed: boolean;
  isWinning: boolean;
  /** Reveal progress for this cell, or null when it is not part of the win. */
  revealValue: Animated.Value | null;
  pulse: Animated.Value;
  /** Passed down so one StyleSheet is built per card, not per cell. */
  styles: WinningCardViewStyles;
}

const WinningCardCell = ({
  value,
  cellSize,
  isDaubed,
  isWinning,
  revealValue,
  pulse,
  styles,
}: WinningCardCellProps) => {
  const isFree = value === 'FREE';

  return (
    <View
      style={[
        styles.cell,
        { width: cellSize, height: cellSize },
        isDaubed && styles.cellDaubed,
        isWinning && styles.cellWinning,
      ]}
    >
      <Text style={[styles.cellText, isDaubed && styles.cellTextDaubed]}>
        {isFree ? '★' : value}
      </Text>
      {isDaubed && !isFree && (
        <View
          style={[
            styles.daubMarker,
            {
              width: cellSize * 0.85,
              height: cellSize * 0.85,
              borderRadius: cellSize * 0.425,
            },
          ]}
        />
      )}
      {isWinning && revealValue && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.winHighlight,
            {
              opacity: Animated.add(revealValue, Animated.multiply(pulse, 0.35)),
              transform: [
                {
                  scale: revealValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ],
            },
          ]}
        />
      )}
    </View>
  );
};

export default WinningCardCell;
