import { StyleSheet } from 'react-native';
import { ThemeColors } from './colors';

/** Full-bleed themed root shared by every screen. */
export function createScreenStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });
}

export type ScreenStyles = ReturnType<typeof createScreenStyles>;
