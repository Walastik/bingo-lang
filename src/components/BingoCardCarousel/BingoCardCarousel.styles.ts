import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/theme/colors';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    singleCardContainer: {
      flex: 1,
      width: '100%',
    },
    list: {
      flex: 1,
    },
    page: {
      width: '100%',
      paddingBottom: 6,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginTop: 10,
      paddingTop: 4,
      paddingBottom: 4,
    },
    arrowButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    arrowButtonDisabled: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.borderLight,
      shadowOpacity: 0,
      elevation: 0,
    },
    arrowText: {
      fontSize: 24,
      lineHeight: 26,
      fontWeight: '600',
      color: '#007AFF',
      marginTop: -1,
    },
    arrowTextDisabled: {
      color: colors.textMuted,
    },
    pageIndicator: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      minWidth: 100,
      textAlign: 'center',
    },
  });
}

export type BingoCardCarouselStyles = ReturnType<typeof createStyles>;
