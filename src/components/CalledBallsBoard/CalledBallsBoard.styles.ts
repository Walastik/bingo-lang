import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/theme/colors';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    closeButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: '#007AFF',
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    table: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    headerRow: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    headerCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 6,
    },
    headerLetter: {
      fontSize: 26,
      fontWeight: '800',
    },
    dataRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    ballCell: {
      flex: 1,
      marginHorizontal: 2,
      aspectRatio: 1,
      maxHeight: 44,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ballCellUncalled: {
      backgroundColor: colors.ballCellUncalled,
    },
    ballNumber: {
      fontSize: 15,
      fontWeight: '700',
    },
    ballNumberCalled: {
      color: '#fff',
    },
    ballNumberUncalled: {
      color: colors.ballNumberUncalled,
    },
  });
}

export type CalledBallsBoardStyles = ReturnType<typeof createStyles>;
