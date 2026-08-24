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
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 360,
      position: 'relative',
    },
    closeIconButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    closeIcon: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      lineHeight: 18,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
      paddingHorizontal: 28,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    speedOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 24,
    },
    speedButton: {
      minWidth: 56,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
    },
    speedButtonSelected: {
      backgroundColor: '#007AFF',
    },
    speedButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    speedButtonTextSelected: {
      color: '#fff',
    },
    quitButton: {
      backgroundColor: '#FF3B30',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    quitButtonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '700',
    },
  });
}

export type GameSettingsModalStyles = ReturnType<typeof createStyles>;
