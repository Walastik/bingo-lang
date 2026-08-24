import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/theme/colors';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 100,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
      paddingVertical: 32,
    },
    content: {
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 20,
      alignItems: 'center',
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 22,
    },
    cardSection: {
      width: '100%',
      gap: 16,
    },
    primaryButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    continueButton: {
      backgroundColor: '#FF9500',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 12,
      minWidth: 150,
      alignItems: 'center',
    },
    continueButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
}

export type WinnerOverlayStyles = ReturnType<typeof createStyles>;
