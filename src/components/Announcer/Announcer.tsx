import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import AnnouncerControls from './AnnouncerControls';
import { createStyles } from './Announcer.styles';
import CalledBallsSummary from './CalledBallsSummary';
import CurrentBallStage from './CurrentBallStage';
import NextBallWindow from './NextBallWindow';
import { useBallTransition } from './useBallTransition';

interface AnnouncerProps {
  currentBall: number | null;
  upcomingBall: number | null;
  recentBalls: number[];
  isPaused: boolean;
  showPauseControl: boolean;
  onTogglePause: () => void;
  showNextControl?: boolean;
  canCallNextBall?: boolean;
  onNextBall?: () => void;
  isAutoMode?: boolean;
  showAutoControl?: boolean;
  onToggleAutoMode?: () => void;
  showDeclareWinnerControl?: boolean;
  onDeclareWinner?: () => void;
  onRecentPress?: () => void;
}

const Announcer = ({
  currentBall,
  upcomingBall,
  recentBalls,
  isPaused,
  showPauseControl,
  onTogglePause,
  showNextControl = false,
  canCallNextBall = true,
  onNextBall,
  isAutoMode = false,
  showAutoControl = false,
  onToggleAutoMode,
  showDeclareWinnerControl = false,
  onDeclareWinner,
  onRecentPress,
}: AnnouncerProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    slideValue,
    slideScale,
    slideTranslateX,
    currentOpacity,
    isTransitioning,
    isShifting,
    shiftProgress,
    recentBallsToShow,
    windowCalledBall,
    windowCalledOpacity,
  } = useBallTransition({ currentBall, upcomingBall, recentBalls });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.leftGroup}>
          <View style={styles.nextColumn}>
            <AnnouncerControls
              isPaused={isPaused}
              showPauseControl={showPauseControl}
              onTogglePause={onTogglePause}
              showNextControl={showNextControl}
              canCallNextBall={canCallNextBall}
              onNextBall={onNextBall}
              isAutoMode={isAutoMode}
              showAutoControl={showAutoControl}
              onToggleAutoMode={onToggleAutoMode}
              styles={styles}
            />
            <NextBallWindow
              upcomingBall={upcomingBall}
              calledBall={windowCalledBall}
              calledOpacity={windowCalledOpacity}
              styles={styles}
            />
          </View>

          <CurrentBallStage
            currentBall={currentBall}
            isTransitioning={isTransitioning}
            currentOpacity={currentOpacity}
            slideValue={slideValue}
            slideScale={slideScale}
            slideTranslateX={slideTranslateX}
            styles={styles}
          />
        </View>

        <CalledBallsSummary
          recentBalls={recentBallsToShow}
          calledBallsCount={recentBalls.length}
          shiftProgress={shiftProgress}
          isShifting={isShifting}
          showDeclareWinnerControl={showDeclareWinnerControl}
          onDeclareWinner={onDeclareWinner}
          onRecentPress={onRecentPress}
          styles={styles}
        />
      </View>
    </View>
  );
};

export default Announcer;
