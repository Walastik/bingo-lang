import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface BingoCard {
  grid: (number | 'FREE')[];
}

interface BingoCardViewProps {
  card: BingoCard;
  cardIndex: number;
  userDaubs: Set<string>;
  onCellPress: (flatIndex: number) => void;
}

const BingoCardView: React.FC<BingoCardViewProps> = ({ 
  card, 
  cardIndex, 
  userDaubs, 
  onCellPress 
}) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        {['B', 'I', 'N', 'G', 'O'].map((letter, col) => (
          <View key={col} style={styles.headerCell}>
            <Text style={styles.headerText}>{letter}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {card.grid.map((cell, flatIndex) => {
          const row = Math.floor(flatIndex / 5);
          const col = flatIndex % 5;
          const isFree = cell === 'FREE';
          const isDaubed = userDaubs.has(`${cardIndex}-${row}-${col}`);

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
  header: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
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
});

export default BingoCardView;