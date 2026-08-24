import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getCellSize } from '@/components/cardGridLayout';
import { getBallColor } from '@/game/ballFormat';
import { COLUMN_LETTERS, GRID_SIZE, cellKey, daubKey } from '@/game/constants';
import { BingoCard, WinPattern } from '@/game/types';
import { useTheme } from '@/theme/ThemeContext';
import { createStyles } from './BingoCardView.styles';

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

const PREVIEW_CYCLE_MS = 750;

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

  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [activePatternIndex, setActivePatternIndex] = useState(0);
  const [gridWidth, setGridWidth] = useState(0);
  const winPatternsRef = useRef(winPatterns);
  winPatternsRef.current = winPatterns;

  const cellSize = getCellSize(gridWidth);

  useEffect(() => {
    setActivePatternIndex(0);
  }, [previewKey]);

  useEffect(() => {
    if (winPatterns.length === 0) {
      return;
    }

    setActivePatternIndex((prev) => prev % winPatterns.length);
  }, [previewKey, winPatterns.length]);

  useEffect(() => {
    if (!isPreviewEnabled || winPatterns.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setActivePatternIndex(
        (prev) => (prev + 1) % winPatternsRef.current.length,
      );
    }, PREVIEW_CYCLE_MS);

    return () => {
      clearInterval(interval);
    };
  }, [isPreviewEnabled, previewKey, winPatterns.length]);

  const safePatternIndex =
    winPatterns.length === 0 ? 0 : activePatternIndex % winPatterns.length;
  const activePattern = winPatterns[safePatternIndex];

  const activePreviewCells = useMemo(() => {
    if (!isPreviewEnabled || !activePattern) {
      return new Set<string>();
    }

    return new Set(activePattern.cells.map(({ row, col }) => cellKey(row, col)));
  }, [isPreviewEnabled, activePattern]);

  const togglePreview = () => {
    setIsPreviewEnabled((prev) => {
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
          {isPreviewEnabled && activePattern
            ? activePattern.label
            : 'Win preview off'}
        </Text>
      </View>

      <View style={styles.header}>
        {COLUMN_LETTERS.map((letter, col) => (
          <TouchableOpacity
            key={col}
            style={[styles.headerCell, { backgroundColor: getBallColor(letter) }]}
            onPress={() => onHeaderPress(col)}
            activeOpacity={0.8}
          >
            <Text style={styles.headerText}>{letter}</Text>
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
          Array.from({ length: GRID_SIZE }, (_, row) => (
            <View key={row} style={[styles.gridRow, { height: cellSize }]}>
              {card.grid
                .slice(row * GRID_SIZE, row * GRID_SIZE + GRID_SIZE)
                .map((cell, col) => {
                  const flatIndex = row * GRID_SIZE + col;
                  const isFree = cell === 'FREE';
                  const isDaubed = userDaubs.has(daubKey(cardIndex, row, col));
                  const isPreviewCellActive = activePreviewCells.has(
                    cellKey(row, col),
                  );

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
                      <Text
                        style={[
                          styles.cellText,
                          isDaubed && styles.cellTextDaubed,
                        ]}
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

export default BingoCardView;
