import React from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { AnnouncerStyles } from './Announcer.styles';
import RecentBallsRow from './RecentBallsRow';
import { MAX_RECENT_BALLS } from './announcerLayout';

interface CalledBallsSummaryProps {
  recentBalls: number[];
  calledBallsCount: number;
  shiftProgress: Animated.Value | null;
  isShifting: boolean;
  showDeclareWinnerControl: boolean;
  onDeclareWinner?: () => void;
  onRecentPress?: () => void;
  styles: AnnouncerStyles;
}

const CalledBallsSummary = ({
  recentBalls,
  calledBallsCount,
  shiftProgress,
  isShifting,
  showDeclareWinnerControl,
  onDeclareWinner,
  onRecentPress,
  styles,
}: CalledBallsSummaryProps) => {
  const hasHiddenBalls = calledBallsCount > MAX_RECENT_BALLS;

  return (
    <View style={styles.recentColumn}>
      {showDeclareWinnerControl && onDeclareWinner && (
        <TouchableOpacity
          style={styles.declareWinnerButton}
          onPress={onDeclareWinner}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Declare winner and move to the next game"
        >
          <Text style={styles.declareWinnerButtonText}>Declare Winner</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.calledBallsColumn}
        onPress={onRecentPress}
        disabled={!onRecentPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          hasHiddenBalls
            ? `View all called balls, ${calledBallsCount} called`
            : 'View all called balls'
        }
        accessibilityHint="Opens the full called balls board"
      >
        <View
          style={[
            styles.calledBallsButton,
            !onRecentPress && styles.calledBallsButtonDisabled,
          ]}
        >
          <Text
            style={styles.calledBallsButtonText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {hasHiddenBalls ? `Called Balls (${calledBallsCount})` : 'Called Balls'}
          </Text>
        </View>
        <View style={[styles.recentRow, isShifting && styles.recentRowClipped]}>
          <RecentBallsRow
            balls={recentBalls}
            shiftProgress={shiftProgress}
            isShifting={isShifting}
            styles={styles}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CalledBallsSummary;
