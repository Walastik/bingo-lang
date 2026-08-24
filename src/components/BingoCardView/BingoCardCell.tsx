import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BingoCardViewStyles } from './BingoCardView.styles';

interface BingoCardCellProps {
  value: number | 'FREE';
  cellSize: number;
  isDaubed: boolean;
  isPreviewActive: boolean;
  onPress: () => void;
  /** Passed down so one StyleSheet is built per card, not per cell. */
  styles: BingoCardViewStyles;
}

const BingoCardCell = ({
  value,
  cellSize,
  isDaubed,
  isPreviewActive,
  onPress,
  styles,
}: BingoCardCellProps) => {
  const isFree = value === 'FREE';

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        { width: cellSize, height: cellSize },
        isDaubed && styles.cellDaubed,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isFree}
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
      {isPreviewActive && <View pointerEvents="none" style={styles.winPreviewMarker} />}
    </TouchableOpacity>
  );
};

export default BingoCardCell;
