import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ROUND_SEQUENCE, getRoundConfig } from '@/game/patterns/roundConfigs';
import { LobbyScreenStyles } from './LobbyScreen.styles';

interface RoundLineupListProps {
  /** One flag per entry in `ROUND_SEQUENCE`, in order. */
  selectedRounds: boolean[];
  onToggle: (index: number) => void;
  /** Passed down so one StyleSheet is built per screen, not per section. */
  styles: LobbyScreenStyles;
}

/** The full round sequence, each row toggling whether it is played. */
const RoundLineupList = ({
  selectedRounds,
  onToggle,
  styles,
}: RoundLineupListProps) => (
  <View style={styles.roundLineup}>
    {ROUND_SEQUENCE.map((roundType, index) => {
      const round = getRoundConfig(roundType);
      const isSelected = selectedRounds[index];

      return (
        <TouchableOpacity
          key={roundType}
          style={[styles.roundLineupRow, !isSelected && styles.roundLineupRowOff]}
          onPress={() => onToggle(index)}
          activeOpacity={0.7}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSelected }}
          accessibilityLabel={`${round.label}, ${isSelected ? 'included' : 'excluded'}`}
        >
          <View
            style={[
              styles.roundCheckbox,
              isSelected && styles.roundCheckboxSelected,
            ]}
          >
            {isSelected && <Text style={styles.roundCheckboxMark}>✓</Text>}
          </View>
          <View style={styles.roundLineupText}>
            <Text
              style={[
                styles.roundLineupLabel,
                !isSelected && styles.roundLineupLabelOff,
              ]}
            >
              {round.label}
            </Text>
            <Text
              style={[
                styles.roundLineupDescription,
                !isSelected && styles.roundLineupDescriptionOff,
              ]}
            >
              {round.description}
            </Text>
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default RoundLineupList;
