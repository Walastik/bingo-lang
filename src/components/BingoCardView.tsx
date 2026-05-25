import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import BingoCell from './BingoCell';
import { BingoCard } from '../utils/bingoUtils';

interface BingoCardViewProps {
  card: BingoCard;
  onCellPress?: (index: number) => void;
}

const BingoCardView: React.FC<BingoCardViewProps> = ({ card, onCellPress }) => {
  const renderGrid = () => {
    // Render header row
    const headerRow = (
      <View style={styles.headerRow}>
        {['B', 'I', 'N', 'G', 'O'].map((letter) => (
          <Text key={letter} style={styles.headerText}>
            {letter}
          </Text>
        ))}
      </View>
    );

    // Render 5 rows of cells
    const rows = [];
    for (let row = 0; row < 5; row++) {
      const rowData = [];
      for (let col = 0; col < 5; col++) {
        const flatIndex = row * 5 + col;
        const value = card.grid[flatIndex];
        const isDaubed = card.daubed[flatIndex];
        
        rowData.push(
          <BingoCell
            key={`${row}-${col}`}
            value={value}
            isDaubed={isDaubed}
            onPress={() => onCellPress?.(flatIndex)}
          />
        );
      }
      rows.push(
        <View key={row} style={styles.row}>
          {rowData}
        </View>
      );
    }

    return (
      <>
        {headerRow}
        {rows}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BINGO CARD</Text>
      {renderGrid()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  headerText: {
    width: 60,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#666',
  },
  row: {
    flexDirection: 'row',
  },
});

export default BingoCardView;