import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/theme/colors';

/** Width every lobby section aligns to, so labels and cards share one edge. */
const SECTION_MAX_WIDTH = 360;

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      paddingVertical: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 24,
    },
    subtitle: {
      fontSize: 18,
      color: colors.textSecondary,
      marginBottom: 14,
      alignSelf: 'flex-start',
      width: '100%',
      maxWidth: SECTION_MAX_WIDTH,
    },
    modeContainer: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
      maxWidth: SECTION_MAX_WIDTH,
      marginBottom: 28,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
    },
    modeButtonActive: {
      backgroundColor: '#007AFF',
    },
    modeButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    modeButtonTextActive: {
      color: '#fff',
    },
    selectionContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 28,
      justifyContent: 'center',
      width: '100%',
      maxWidth: SECTION_MAX_WIDTH,
    },
    selectionButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.surfaceMuted,
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectionButtonActive: {
      backgroundColor: '#007AFF',
    },
    selectionText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
    },
    roundLineupHint: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 12,
      alignSelf: 'flex-start',
      width: '100%',
      maxWidth: SECTION_MAX_WIDTH,
    },
    roundLineup: {
      width: '100%',
      maxWidth: SECTION_MAX_WIDTH,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 8,
      marginBottom: 28,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    roundLineupRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    roundLineupRowOff: {
      opacity: 0.55,
    },
    roundCheckbox: {
      width: 26,
      height: 26,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
      backgroundColor: colors.surface,
    },
    roundCheckboxSelected: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
    roundCheckboxMark: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '800',
      lineHeight: 17,
    },
    roundLineupText: {
      flex: 1,
    },
    roundLineupLabel: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    roundLineupLabelOff: {
      color: colors.textSecondary,
    },
    roundLineupDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    roundLineupDescriptionOff: {
      color: colors.textMuted,
    },
    appearanceSection: {
      width: '100%',
      maxWidth: SECTION_MAX_WIDTH,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 28,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    appearanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    appearanceLabel: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    appearanceHint: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    startButton: {
      backgroundColor: '#34C759',
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 12,
    },
    startButtonDisabled: {
      backgroundColor: '#a8ddb4',
    },
    startButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
}

export type LobbyScreenStyles = ReturnType<typeof createStyles>;
