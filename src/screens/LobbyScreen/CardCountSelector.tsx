import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LobbyScreenStyles } from './LobbyScreen.styles';

/** More than four cards cannot be daubed fast enough to be fun. */
const CARD_COUNT_OPTIONS = [1, 2, 3, 4];

interface CardCountSelectorProps {
  selected: number;
  onSelect: (count: number) => void;
  /** Passed down so one StyleSheet is built per screen, not per section. */
  styles: LobbyScreenStyles;
}

const CardCountSelector = ({
  selected,
  onSelect,
  styles,
}: CardCountSelectorProps) => (
  <View style={styles.selectionContainer}>
    {CARD_COUNT_OPTIONS.map((count) => (
      <TouchableOpacity
        key={count}
        style={[
          styles.selectionButton,
          selected === count && styles.selectionButtonActive,
        ]}
        onPress={() => onSelect(count)}
      >
        <Text style={styles.selectionText}>{count}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default CardCountSelector;
