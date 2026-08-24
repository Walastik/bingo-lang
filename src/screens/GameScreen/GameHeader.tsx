import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { GameScreenStyles } from './GameScreen.styles';

interface GameHeaderProps {
  roundNumber: number;
  totalRounds: number;
  roundLabel: string;
  onOpenSettings: () => void;
  /** Passed down so one StyleSheet is built per screen, not per section. */
  styles: GameScreenStyles;
}

/** Which round is being played, and the way into settings. */
const GameHeader = ({
  roundNumber,
  totalRounds,
  roundLabel,
  onOpenSettings,
  styles,
}: GameHeaderProps) => (
  <View style={styles.header}>
    <View style={styles.roundInfo}>
      <Text style={styles.roundInfoLabel}>
        Round {roundNumber}/{totalRounds}
      </Text>
      <Text style={styles.roundInfoName}>{roundLabel}</Text>
    </View>
    <TouchableOpacity
      style={styles.settingsButton}
      onPress={onOpenSettings}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="Open game settings"
    >
      <Text style={styles.settingsIcon}>⚙️</Text>
    </TouchableOpacity>
  </View>
);

export default GameHeader;
