import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getBallColor } from '@/game/ballFormat';
import { COLUMN_LETTERS } from '@/game/constants';
import { GRID_GAP } from './cardGridLayout';

interface CardHeaderRowProps {
  /** Omit for a static header — the winning-card view does not take taps. */
  onColumnPress?: (col: number) => void;
}

/** The B-I-N-G-O row above a card grid. Colors are per-letter, so not themed. */
const CardHeaderRow = ({ onColumnPress }: CardHeaderRowProps) => (
  <View style={styles.header}>
    {COLUMN_LETTERS.map((letter, col) => {
      const cellStyle = [styles.headerCell, { backgroundColor: getBallColor(letter) }];
      const label = <Text style={styles.headerText}>{letter}</Text>;

      return onColumnPress ? (
        <TouchableOpacity
          key={letter}
          style={cellStyle}
          onPress={() => onColumnPress(col)}
          activeOpacity={0.8}
        >
          {label}
        </TouchableOpacity>
      ) : (
        <View key={letter} style={cellStyle}>
          {label}
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
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
});

export default CardHeaderRow;
