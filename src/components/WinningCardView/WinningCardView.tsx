import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { getCellSize } from '@/components/cardGridLayout';
import { getBallColor } from '@/game/ballFormat';
import {
  COLUMN_LETTERS,
  GRID_SIZE,
  cellKey,
  daubKey,
  isFreeSpace,
  toFlatIndex,
} from '@/game/constants';
import { BingoCard, CellCoord } from '@/game/types';
import { useTheme } from '@/theme/ThemeContext';
import { createStyles } from './WinningCardView.styles';

const STAGGER_MS = 70;

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

  const [gridWidth, setGridWidth] = React.useState(0);
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const drawnBallsSet = useMemo(() => new Set(drawnBalls), [drawnBalls]);

  const winningCellKeys = useMemo(
    () => new Set(winningCells.map(({ row, col }) => cellKey(row, col))),
    [winningCells],
  );

  const cellRevealValues = useRef(
    winningCells.map(() => new Animated.Value(0)),
  ).current;

  const cellSize = getCellSize(gridWidth);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const staggeredReveals = winningCells.map((_, index) =>
      Animated.sequence([
        Animated.delay(index * STAGGER_MS),
        Animated.spring(cellRevealValues[index], {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.stagger(STAGGER_MS / 2, staggeredReveals).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, [cardOpacity, cardScale, cellRevealValues, pulse, winningCells]);

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

      <View style={styles.header}>
        {COLUMN_LETTERS.map((letter) => (
          <View
            key={letter}
            style={[styles.headerCell, { backgroundColor: getBallColor(letter) }]}
          >
            <Text style={styles.headerText}>{letter}</Text>
          </View>
        ))}
      </View>

      <View
        style={styles.grid}
        onLayout={(event) => {
          const nextWidth = event.nativeEvent.layout.width;
          if (nextWidth !== gridWidth) {
            setGridWidth(nextWidth);
          }
        }}
      >
        {cellSize > 0 &&
          Array.from({ length: GRID_SIZE }, (_, row) => (
            <View key={row} style={[styles.gridRow, { height: cellSize }]}>
              {card.grid
                .slice(row * GRID_SIZE, row * GRID_SIZE + GRID_SIZE)
                .map((cell, col) => {
                  const flatIndex = toFlatIndex(row, col);
                  const isFree = cell === 'FREE';
                  const isDaubed = isCellDaubed(row, col);
                  const isWinningCell = winningCellKeys.has(cellKey(row, col));
                  const winningIndex = getWinningCellIndex(row, col);
                  const revealValue =
                    winningIndex >= 0 ? cellRevealValues[winningIndex] : null;

                  return (
                    <View
                      key={flatIndex}
                      style={[
                        styles.cell,
                        { width: cellSize, height: cellSize },
                        isDaubed && styles.cellDaubed,
                        isWinningCell && styles.cellWinning,
                      ]}
                    >
                      <Text
                        style={[styles.cellText, isDaubed && styles.cellTextDaubed]}
                      >
                        {isFree ? '★' : cell}
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
                      {isWinningCell && revealValue && (
                        <Animated.View
                          pointerEvents="none"
                          style={[
                            styles.winHighlight,
                            {
                              opacity: Animated.add(
                                revealValue,
                                Animated.multiply(pulse, 0.35),
                              ),
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
                })}
            </View>
          ))}
      </View>
    </Animated.View>
  );
};

export default WinningCardView;
