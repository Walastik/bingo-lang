import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';

interface BingoCellProps {
  value: number | string; // It could be a number or the word "FREE"
  isDaubed: boolean;
  onPress: () => void;
}

const BingoCell = ({ value, isDaubed, onPress }: BingoCellProps) => {
  return (
    <Pressable
      style={[styles.cell, isDaubed && styles.cellDaubed]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.cellText}>
        {value === 'FREE' ? 'FREE' : value}
      </Text>
      {isDaubed && <View style={styles.daubOverlay} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cellDaubed: {
    backgroundColor: '#e8f5e9', // Light green background
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    zIndex: 2,
  },
  daubOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.5)', // Green semi-transparent circle
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BingoCell;