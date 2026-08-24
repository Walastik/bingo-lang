import { StyleSheet } from 'react-native';
import { GRID_GAP } from '@/components/cardGridLayout';
import { ThemeColors } from '@/theme/colors';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    patternLabel: {
      fontSize: 12,
      color: colors.patternLabel,
      fontWeight: '600',
    },
    previewToggleButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.previewToggleBackground,
      borderWidth: 1,
      borderColor: colors.previewToggleBorder,
    },
    previewToggleIcon: {
      fontSize: 15,
    },
    grid: {
      width: '100%',
      gap: GRID_GAP,
    },
    gridRow: {
      flexDirection: 'row',
      gap: GRID_GAP,
    },
    cell: {
      backgroundColor: colors.cellBackground,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    cellDaubed: {
      backgroundColor: colors.cellDaubedBackground,
    },
    cellText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.cellText,
    },
    cellTextDaubed: {
      color: '#007AFF',
    },
    daubMarker: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 122, 255, 0.3)',
      zIndex: 1,
    },
    winPreviewMarker: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 8,
      backgroundColor: 'rgba(52, 199, 89, 0.4)',
      borderWidth: 1,
      borderColor: 'rgba(46, 125, 50, 0.75)',
      zIndex: 3,
    },
  });
}

export type BingoCardViewStyles = ReturnType<typeof createStyles>;
