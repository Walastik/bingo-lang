import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getBallColor } from '../utils/bingoUtils';
import { ACTIVE_WIN_PATTERNS } from '../utils/winPatterns';

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
        <Text style={styles.patternLabel}>
          {isPreviewEnabled ? ACTIVE_WIN_PATTERNS[activePatternIndex].label : 'Win preview off'}
        </Text>
        <TouchableOpacity
          style={styles.previewToggleButton}
          onPress={togglePreview}
          activeOpacity={0.8}
        >
          <Text style={styles.previewToggleIcon}>
            {isPreviewEnabled ? '👁' : '🙈'}
          </Text>
        </TouchableOpacity>
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

      {/* Grid */}
      <View style={styles.grid}>
        {card.grid.map((cell, flatIndex) => {
          const row = Math.floor(flatIndex / 5);
          const col = flatIndex % 5;
          const isFree = cell === 'FREE';
          const isDaubed = userDaubs.has(`${cardIndex}-${row}-${col}`);
          const isPreviewCellActive = activePreviewCells.has(`${row}-${col}`);

          return (
            <TouchableOpacity
              key={flatIndex}
              style={[
                styles.cell,
                isDaubed && styles.cellDaubed,
              ]}
              onPress={() => !isFree && onCellPress(flatIndex)}
              activeOpacity={0.7}
              disabled={isFree}
            >
              <Text style={[
                styles.cellText,
                isDaubed && styles.cellTextDaubed
              ]}>
                {isFree ? '★' : cell}
              </Text>
              {isDaubed && !isFree && (
                <View style={styles.daubMarker} />
              )}
              {isPreviewCellActive && (
                <View pointerEvents="none" style={styles.winPreviewMarker} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  patternLabel: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  previewToggleButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9F7EC',
    borderWidth: 1,
    borderColor: '#B7DEBE',
  },
  previewToggleIcon: {
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: {
    width: '19%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
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
    width: 60,
    height: 60,
    borderRadius: 30,
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