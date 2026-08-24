import React from 'react';
import { Switch, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { LobbyScreenStyles } from './LobbyScreen.styles';

interface AppearanceSectionProps {
  /** Passed down so one StyleSheet is built per screen, not per section. */
  styles: LobbyScreenStyles;
}

/**
 * Reads the theme directly rather than taking it as props: the theme is its
 * entire subject, and `Switch` needs a color that no style prop carries.
 */
const AppearanceSection = ({ styles }: AppearanceSectionProps) => {
  const { colors, isDarkMode, setDarkMode } = useTheme();

  return (
    <View style={styles.appearanceSection}>
      <View style={styles.appearanceRow}>
        <View>
          <Text style={styles.appearanceLabel}>Dark Mode</Text>
          <Text style={styles.appearanceHint}>{isDarkMode ? 'On' : 'Off'}</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: colors.surfaceMuted, true: '#007AFF' }}
          thumbColor="#ffffff"
          accessibilityLabel="Toggle dark mode"
        />
      </View>
    </View>
  );
};

export default AppearanceSection;
