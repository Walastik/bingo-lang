import { StyleSheet } from 'react-native';
import { GRID_GAP } from '@/components/cardGridLayout';
import { ThemeColors } from '@/theme/colors';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      width: '100%',
      backgroundColor: colors.surfaceElevated,
      borderRadius: 16,
      padding: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    ownerLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
      textAlign: 'center',
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
      overflow: 'hidden',
    },
    cellDaubed: {
      backgroundColor: colors.cellDaubedBackground,
    },
    cellWinning: {
      backgroundColor: '#fff8e1',
    },
    cellText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.cellText,
      zIndex: 2,
    },
    cellTextDaubed: {
      color: '#007AFF',
    },
    daubMarker: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 122, 255, 0.3)',
      zIndex: 1,
    },
    winHighlight: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 8,
      backgroundColor: 'rgba(255, 193, 7, 0.55)',
      borderWidth: 2,
      borderColor: '#FF9500',
      zIndex: 3,
    },
  });
}

export type WinningCardViewStyles = ReturnType<typeof createStyles>;
