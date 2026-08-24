import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/theme/colors';
import {
  BALL_GAP,
  LARGE_BALL,
  RECENT_ROW_WIDTH,
  SMALL_BALL,
} from './announcerLayout';

export function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      paddingVertical: 14,
      paddingLeft: 6,
      paddingRight: 8,
      backgroundColor: colors.background,
      borderRadius: 10,
      marginHorizontal: 10,
      marginVertical: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    leftGroup: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4,
      flexShrink: 1,
      minWidth: 0,
    },
    label: {
      fontSize: 11,
      marginBottom: 6,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    nextColumn: {
      alignItems: 'center',
      width: 88,
      marginLeft: -4,
      flexShrink: 0,
    },
    controlRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    controlButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.controlBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlButtonActive: {
      backgroundColor: colors.controlActiveBackground,
      borderWidth: 2,
      borderColor: colors.controlActiveBorder,
    },
    controlButtonDisabled: {
      opacity: 0.45,
    },
    controlIcon: {
      fontSize: 18,
      color: colors.text,
      lineHeight: 22,
    },
    windowBox: {
      width: 72,
      height: 72,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.windowBoxBorder,
      backgroundColor: colors.windowBoxBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerColumn: {
      alignItems: 'center',
      flexShrink: 0,
    },
    currentSlot: {
      width: LARGE_BALL,
      height: LARGE_BALL,
      alignItems: 'center',
      justifyContent: 'center',
    },
    slideClip: {
      position: 'absolute',
      width: LARGE_BALL,
      height: LARGE_BALL,
      borderRadius: LARGE_BALL / 2,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    recentColumn: {
      flexShrink: 0,
      alignItems: 'flex-end',
      marginLeft: 10,
    },
    declareWinnerButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: '#34C759',
      marginBottom: 8,
    },
    declareWinnerButtonText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    calledBallsColumn: {
      alignItems: 'flex-end',
    },
    calledBallsButton: {
      alignSelf: 'flex-end',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: colors.calledBallsButtonBackground,
      borderWidth: 1,
      borderColor: colors.calledBallsButtonBorder,
      marginBottom: 6,
    },
    calledBallsButtonDisabled: {
      opacity: 0.6,
    },
    calledBallsButtonText: {
      fontSize: 11,
      color: colors.calledBallsButtonText,
      textTransform: 'uppercase',
      textAlign: 'center',
      fontWeight: '600',
    },
    recentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: BALL_GAP,
      minHeight: SMALL_BALL,
      width: RECENT_ROW_WIDTH,
    },
    recentRowClipped: {
      overflow: 'hidden',
    },
    recentSlot: {
      width: SMALL_BALL,
      height: SMALL_BALL,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recentPlaceholder: {
      width: SMALL_BALL,
      height: SMALL_BALL,
    },
  });
}

export type AnnouncerStyles = ReturnType<typeof createStyles>;
