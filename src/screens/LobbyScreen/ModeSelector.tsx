import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LobbyScreenStyles } from './LobbyScreen.styles';

const MODES = [
  { label: 'Play Bingo', isCallerOnly: false },
  { label: 'Caller Only', isCallerOnly: true },
] as const;

interface ModeSelectorProps {
  isCallerOnly: boolean;
  onSelect: (isCallerOnly: boolean) => void;
  /** Passed down so one StyleSheet is built per screen, not per section. */
  styles: LobbyScreenStyles;
}

/** Play along on your own cards, or just run the board for a room. */
const ModeSelector = ({ isCallerOnly, onSelect, styles }: ModeSelectorProps) => (
  <View style={styles.modeContainer}>
    {MODES.map((mode) => {
      const isActive = mode.isCallerOnly === isCallerOnly;

      return (
        <TouchableOpacity
          key={mode.label}
          style={[styles.modeButton, isActive && styles.modeButtonActive]}
          onPress={() => onSelect(mode.isCallerOnly)}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
        >
          <Text
            style={[
              styles.modeButtonText,
              isActive && styles.modeButtonTextActive,
            ]}
          >
            {mode.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default ModeSelector;
