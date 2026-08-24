import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { GameScreenStyles } from './GameScreen.styles';

interface BingoButtonProps {
  onPress: () => void;
  /** Passed down so one StyleSheet is built per screen, not per section. */
  styles: GameScreenStyles;
}

/** Floats over the cards; the player's claim that they have won. */
const BingoButton = ({ onPress, styles }: BingoButtonProps) => (
  <View style={styles.floatingButtonContainer}>
    <TouchableOpacity
      style={styles.bingoButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.bingoButtonText}>BINGO!</Text>
    </TouchableOpacity>
  </View>
);

export default BingoButton;
