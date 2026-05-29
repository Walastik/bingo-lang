import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getBallColor } from '../utils/bingoUtils';
import { ACTIVE_WIN_PATTERNS } from '../utils/winPatterns';

const GRID_GAP = 4;
const GRID_COLUMNS = 5;

interface BingoCard {
  grid: (number | 'FREE')[];
}

interface BingoCardViewProps {
  card: BingoCard;
  cardIndex: number;
  userDaubs: Set<string>;
  onCellPress: (flatIndex: number) => void;
  onHeaderPress: (col: number) => void;
}

const BingoCardView: React.FC<BingoCardViewProps> = ({ 
  card, 
  cardIndex, 
  userDaubs, 
  onCellPress,
  onHeaderPress
}) => {
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [activePatternIndex, setActivePatternIndex] = useState(0);
  const [gridWidth, setGridWidth] = useState(0);

  const cellSize =
    gridWidth > 0
      ? Math.floor((gridWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS)
      : 0;

  useEffect(() => {
    if (!isPreviewEnabled) {
      return;
    }

    const interval = setInterval(() => {
      setActivePatternIndex(prev => (prev + 1) % ACTIVE_WIN_PATTERNS.length);
    }, 750);

    return () => {
      clearInterval(interval);
    };
  }, [isPreviewEnabled]);

  const activePreviewCells = useMemo(() => {
    if (!isPreviewEnabled) {
      return new Set<string>();
    }

    return new Set(
      ACTIVE_WIN_PATTERNS[activePatternIndex].cells.map(({ row, col }) => `${row}-${col}`)
    );
  }, [isPreviewEnabled, activePatternIndex]);

  const togglePreview = () => {
    setIsPreviewEnabled(prev => {
      const next = !prev;
      if (next) {
        setActivePatternIndex(0);
      }
      return next;
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <TouchableOpacity
          style={styles.previewToggleButton}
          onPress={togglePreview}
          activeOpacity={0.8}
        >
          <Text style={styles.previewToggleIcon}>
            {isPreviewEnabled ? '👁' : '🙈'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.patternLabel}>
          {isPreviewEnabled ? ACTIVE_WIN_PATTERNS[activePatternIndex].label : 'Win preview off'}
        </Text>
      </View>

      <View style={styles.header}>
        {['B', 'I', 'N', 'G', 'O'].map((letter, col) => (
          <TouchableOpacity
            key={col}
            style={[styles.headerCell, { backgroundColor: getBallColor(letter) }]}
            onPress={() => onHeaderPress(col)}
            activeOpacity={0.8}
          >
            <Text style={[styles.headerText, { color: '#FFF' }]}>{letter}</Text>
          </TouchableOpacity>
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
                const isDaubed = userDaubs.has(`${cardIndex}-${row}-${col}`);
                const isPreviewCellActive = activePreviewCells.has(`${row}-${col}`);

                return (
                  <TouchableOpacity
                    key={flatIndex}
                    style={[
                      styles.cell,
                      { width: cellSize, height: cellSize },
                      isDaubed && styles.cellDaubed,
                    ]}
                    onPress={() => !isFree && onCellPress(flatIndex)}
                    activeOpacity={0.7}
                    disabled={isFree}
                  >
                    <Text style={[
                      styles.cellText,
                      isDaubed && styles.cellTextDaubed,
                    ]}>
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
                    {isPreviewCellActive && (
                      <View pointerEvents="none" style={styles.winPreviewMarker} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  patternLabel: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  previewToggleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9F7EC',
    borderWidth: 1,
    borderColor: '#B7DEBE',
  },
  previewToggleIcon: {
    fontSize: 15,
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
  },
  cellDaubed: {
    backgroundColor: '#e6f2ff',
  },
  cellText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cellTextDaubed: {
    color: '#007AFF',
  },
  daubMarker: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    zIndex: 1,
  },
  winPreviewMarker: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 199, 89, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.75)',
    zIndex: 3,
  },
});

export default BingoCardView;