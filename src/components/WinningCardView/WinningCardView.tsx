import React, { useMemo } from 'react';
import { Animated, Text, View } from 'react-native';
import CardHeaderRow from '@/components/CardHeaderRow';
import {
  GRID_SIZE,
  cellKey,
  daubKey,
  isFreeSpace,
  toFlatIndex,
} from '@/game/constants';
import { BingoCard, CellCoord } from '@/game/types';
import { useGridCellSize } from '@/hooks/useGridCellSize';
import { useTheme } from '@/theme/ThemeContext';
import WinningCardCell from './WinningCardCell';
import { createStyles } from './WinningCardView.styles';
import { useWinCardAnimation } from './useWinCardAnimation';

interface WinningCardViewProps {
  card: BingoCard;
  drawnBalls: number[];
  winningCells: CellCoord[];
  isNpcCard: boolean;
  userDaubs?: Set<string>;
  cardIndex?: number;
  ownerLabel: string;
}

const WinningCardView: React.FC<WinningCardViewProps> = ({
  card,
  drawnBalls,
  winningCells,
  isNpcCard,
  userDaubs,
  cardIndex = 0,
  ownerLabel,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { cellSize, onLayout } = useGridCellSize();
  const { cardScale, cardOpacity, pulse, cellRevealValues } =
    useWinCardAnimation(winningCells);

  const drawnBallsSet = useMemo(() => new Set(drawnBalls), [drawnBalls]);

  const winningCellKeys = useMemo(
    () => new Set(winningCells.map(({ row, col }) => cellKey(row, col))),
    [winningCells],
  );

  /**
   * An NPC is assumed to daub perfectly, so any called number counts. The
   * user's card shows only what they actually daubed.
   */
  const isCellDaubed = (row: number, col: number): boolean => {
    if (isFreeSpace(row, col)) {
      return true;
    }

    const cell = card.grid[toFlatIndex(row, col)];

    if (typeof cell !== 'number' || !drawnBallsSet.has(cell)) {
      return false;
    }

    if (isNpcCard) {
      return true;
    }

    return userDaubs?.has(daubKey(cardIndex, row, col)) ?? false;
  };

  const getWinningCellIndex = (row: number, col: number) =>
    winningCells.findIndex((cell) => cell.row === row && cell.col === col);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: cardOpacity,
          transform: [{ scale: cardScale }],
        },
      ]}
    >
      <Text style={styles.ownerLabel}>{ownerLabel}</Text>

      <CardHeaderRow />

      <View style={styles.grid} onLayout={onLayout}>
        {cellSize > 0 &&
          Array.from({ length: GRID_SIZE }, (_, row) => (
            <View key={row} style={[styles.gridRow, { height: cellSize }]}>
              {card.grid
                .slice(row * GRID_SIZE, row * GRID_SIZE + GRID_SIZE)
                .map((cell, col) => {
                  const winningIndex = getWinningCellIndex(row, col);

                  return (
                    <WinningCardCell
                      key={toFlatIndex(row, col)}
                      value={cell}
                      cellSize={cellSize}
                      isDaubed={isCellDaubed(row, col)}
                      isWinning={winningCellKeys.has(cellKey(row, col))}
                      revealValue={
                        winningIndex >= 0 ? cellRevealValues[winningIndex] : null
                      }
                      pulse={pulse}
                      styles={styles}
                    />
                  );
                })}
            </View>
          ))}
      </View>
    </Animated.View>
  );
};

export default WinningCardView;
