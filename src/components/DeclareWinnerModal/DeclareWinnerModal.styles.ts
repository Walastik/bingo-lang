import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/theme/colors';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    content: {
      width: '100%',
      maxWidth: 360,
      borderRadius: 20,
      backgroundColor: colors.surface,
      padding: 24,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      color: colors.textSecondary,
      fontSize: 16,
      lineHeight: 23,
      textAlign: 'center',
      marginBottom: 24,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    confirmButton: {
      backgroundColor: '#34C759',
    },
    cancelButton: {
      backgroundColor: '#FF3B30',
    },
    buttonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '700',
    },
  });
}

export type DeclareWinnerModalStyles = ReturnType<typeof createStyles>;
