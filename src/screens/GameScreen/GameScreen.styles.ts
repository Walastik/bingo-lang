import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/theme/colors';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingBottom: 4,
    },
    roundInfo: {
      flex: 1,
      paddingRight: 8,
    },
    roundInfoLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    roundInfoName: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginTop: 2,
    },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    },
    settingsIcon: {
      fontSize: 24,
      color: colors.text,
      lineHeight: 28,
    },
    cardsContainer: {
      flex: 1,
      paddingHorizontal: 10,
      paddingTop: 10,
      // Leaves room for the floating BINGO button.
      paddingBottom: 100,
    },
    callerBoardContainer: {
      paddingBottom: 10,
    },
    floatingButtonContainer: {
      position: 'absolute',
      bottom: 30,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bingoButton: {
      backgroundColor: '#FF3B30',
      paddingVertical: 20,
      paddingHorizontal: 60,
      borderRadius: 50,
      shadowColor: '#FF3B30',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    bingoButtonText: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: 2,
    },
  });
}

export type GameScreenStyles = ReturnType<typeof createStyles>;
