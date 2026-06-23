import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BingoCard, getBallColor } from '../utils/bingoUtils';
import { CellCoord } from '../utils/winPatterns';

const GRID_GAP = 4;
const GRID_COLUMNS = 5;
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
  const [gridWidth, setGridWidth] = React.useState(0);
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const drawnBallsSet = useMemo(() => new Set(drawnBalls), [drawnBalls]);

  const winningCellKeys = useMemo(
    () => new Set(winningCells.map(({ row, col }) => `${row}-${col}`)),
    [winningCells],
  );

  const cellRevealValues = useRef(
    winningCells.map(() => new Animated.Value(0)),
  ).current;

  const cellSize =
    gridWidth > 0
      ? Math.floor((gridWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS)
      : 0;

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
    if (row === 2 && col === 2) {
      return true;
    }

    const flatIndex = row * 5 + col;
    const cell = card.grid[flatIndex];

    if (typeof cell !== 'number' || !drawnBallsSet.has(cell)) {
      return false;
    }

    if (isNpcCard) {
      return true;
    }

    return userDaubs?.has(`${cardIndex}-${row}-${col}`) ?? false;
  };

  const getWinningCellIndex = (row: number, col: number) =>
    winningCells.findIndex(cell => cell.row === row && cell.col === col);

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
        {['B', 'I', 'N', 'G', 'O'].map((letter) => (
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
          Array.from({ length: 5 }, (_, row) => (
            <View key={row} style={[styles.gridRow, { height: cellSize }]}>
              {card.grid.slice(row * 5, row * 5 + 5).map((cell, col) => {
                const flatIndex = row * 5 + col;
                const isFree = cell === 'FREE';
                const isDaubed = isCellDaubed(row, col);
                const isWinningCell = winningCellKeys.has(`${row}-${col}`);
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
                    <Text style={[styles.cellText, isDaubed && styles.cellTextDaubed]}>
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

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  ownerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    gap: GRID_GAP,
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFF',
  },
  grid: {
    width: '100%',
    gap: GRID_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  cell: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cellDaubed: {
    backgroundColor: '#e6f2ff',
  },
  cellWinning: {
    backgroundColor: '#fff8e1',
  },
  cellText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    zIndex: 2,
  },
  cellTextDaubed: {
    color: '#007AFF',
  },
  daubMarker: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    zIndex: 1,
  },
  winHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 193, 7, 0.55)',
    borderWidth: 2,
    borderColor: '#FF9500',
    zIndex: 3,
  },
});

export default WinningCardView;
