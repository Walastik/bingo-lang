import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CardHeaderRow from '@/components/CardHeaderRow';
import { GRID_SIZE, cellKey, daubKey, toFlatIndex } from '@/game/constants';
import { BingoCard, WinPattern } from '@/game/types';
import { useGridCellSize } from '@/hooks/useGridCellSize';
import { useTheme } from '@/theme/ThemeContext';
import BingoCardCell from './BingoCardCell';
import { createStyles } from './BingoCardView.styles';
import { useWinPreview } from './useWinPreview';

interface BingoCardViewProps {
  card: BingoCard;
  cardIndex: number;
  userDaubs: Set<string>;
  winPatterns: WinPattern[];
  /** Stable id so preview cycling resets only when the round type changes. */
  previewKey: string;
  onCellPress: (flatIndex: number) => void;
  onHeaderPress: (col: number) => void;
}

const BingoCardView: React.FC<BingoCardViewProps> = ({
  card,
  cardIndex,
  userDaubs,
  winPatterns,
  previewKey,
  onCellPress,
  onHeaderPress,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { cellSize, onLayout } = useGridCellSize();
  const { isEnabled, activePattern, previewCells, toggle } = useWinPreview(
    winPatterns,
    previewKey,
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <TouchableOpacity
          style={styles.previewToggleButton}
          onPress={toggle}
          activeOpacity={0.8}
        >
          <Text style={styles.previewToggleIcon}>{isEnabled ? '👁' : '🙈'}</Text>
        </TouchableOpacity>
        <Text style={styles.patternLabel}>
          {isEnabled && activePattern ? activePattern.label : 'Win preview off'}
        </Text>
      </View>

      <CardHeaderRow onColumnPress={onHeaderPress} />

      <View style={styles.grid} onLayout={onLayout}>
        {cellSize > 0 &&
          Array.from({ length: GRID_SIZE }, (_, row) => (
            <View key={row} style={[styles.gridRow, { height: cellSize }]}>
              {card.grid
                .slice(row * GRID_SIZE, row * GRID_SIZE + GRID_SIZE)
                .map((cell, col) => {
                  const flatIndex = toFlatIndex(row, col);

                  return (
                    <BingoCardCell
                      key={flatIndex}
                      value={cell}
                      cellSize={cellSize}
                      isDaubed={userDaubs.has(daubKey(cardIndex, row, col))}
                      isPreviewActive={previewCells.has(cellKey(row, col))}
                      onPress={() => onCellPress(flatIndex)}
                      styles={styles}
                    />
                  );
                })}
            </View>
          ))}
      </View>
    </View>
  );
};

export default BingoCardView;
