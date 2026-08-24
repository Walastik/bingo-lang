import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import BingoBall from '@/components/BingoBall';
import { useTheme } from '@/theme/ThemeContext';
import { AnnouncerStyles, createStyles } from './Announcer.styles';
import {
  FADE_IN_MS,
  IS_ANDROID,
  LARGE_BALL,
  MAX_RECENT_BALLS,
  SHRINK_PHASE_END,
  SLIDE_DISTANCE,
  SLOT_WIDTH,
  SMALL_BALL,
  TRANSITION_MS,
} from './announcerLayout';

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

type AnimatedValue = Animated.Value;

/** Recent row as shown before a call (newest first, excludes a ball e.g. current). */
function recentRowFromDrawn(drawnBalls: number[], excludeBall: number): number[] {
  return drawnBalls
    .filter((ball) => ball !== excludeBall)
    .slice(-MAX_RECENT_BALLS)
    .reverse();
}

function RecentBallsRow({
  balls,
  shiftProgress,
  isShifting,
  styles,
}: {
  balls: number[];
  shiftProgress: AnimatedValue | null;
  isShifting: boolean;
  styles: AnnouncerStyles;
}) {
  if (balls.length === 0) {
    return <View style={styles.recentPlaceholder} />;
  }

  const shiftX =
    shiftProgress?.interpolate({
      inputRange: [0, SHRINK_PHASE_END, 1],
      outputRange: [0, 0, SLOT_WIDTH],
    }) ?? 0;

  const rightmostFade =
    shiftProgress?.interpolate({
      inputRange: [0, SHRINK_PHASE_END, 1],
      outputRange: [1, 1, 0],
    }) ?? 1;

  return (
    <>
      {balls.map((ball, index) => {
        const isRightmost = index === balls.length - 1;
        const shouldShift = isShifting && balls.length >= MAX_RECENT_BALLS;

        return (
          <View key={`recent-${ball}-${index}`} style={styles.recentSlot}>
            <Animated.View
              style={
                shouldShift
                  ? {
                      transform: [{ translateX: shiftX }],
                      opacity: isRightmost ? rightmostFade : 1,
                    }
                  : undefined
              }
            >
              <BingoBall value={ball} size="small" flat={IS_ANDROID} />
            </Animated.View>
          </View>
        );
      })}
    </>
  );
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

  const previousBalls = recentBalls.filter((ball) => ball !== currentBall);
  const displayBalls = previousBalls.slice(-MAX_RECENT_BALLS).reverse();

  const prevCurrentRef = useRef<number | null>(currentBall);
  const lastUpcomingRef = useRef<number | null>(upcomingBall);

  const [slideValue, setSlideValue] = useState<number | null>(null);
  const [hiddenRecentBall, setHiddenRecentBall] = useState<number | null>(null);
  const [shiftRecents, setShiftRecents] = useState<number[] | null>(null);
  const [windowCalledBall, setWindowCalledBall] = useState<number | null>(null);

  const transitionProgress = useRef(new Animated.Value(0)).current;
  const currentOpacity = useRef(new Animated.Value(1)).current;
  const windowCalledOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (upcomingBall !== null) {
      lastUpcomingRef.current = upcomingBall;
    }
  }, [upcomingBall]);

  useEffect(() => {
    if (currentBall === null) {
      prevCurrentRef.current = null;
      currentOpacity.setValue(1);
      setShiftRecents(null);
      setWindowCalledBall(null);
      return;
    }

    if (prevCurrentRef.current === currentBall) {
      return;
    }

    const oldCurrent = prevCurrentRef.current;
    const calledFromWindow = lastUpcomingRef.current === currentBall;

    if (oldCurrent !== null && oldCurrent !== currentBall) {
      // Snapshot recents *before* this call: exclude outgoing current and newly drawn ball.
      const drawnBeforeCall = recentBalls.filter((ball) => ball !== currentBall);
      const preShift = recentRowFromDrawn(drawnBeforeCall, oldCurrent);

      if (preShift.length >= MAX_RECENT_BALLS) {
        setShiftRecents(preShift);
        setHiddenRecentBall(null);
      } else {
        setShiftRecents(null);
        setHiddenRecentBall(oldCurrent);
      }

      if (calledFromWindow) {
        setWindowCalledBall(currentBall);
        windowCalledOpacity.setValue(1);
        Animated.timing(windowCalledOpacity, {
          toValue: 0,
          duration: TRANSITION_MS,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            setWindowCalledBall(null);
          }
        });
        lastUpcomingRef.current = null;
      }

      setSlideValue(oldCurrent);
      transitionProgress.setValue(0);
      currentOpacity.setValue(0);

      Animated.timing(transitionProgress, {
        toValue: 1,
        duration: TRANSITION_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) {
          return;
        }

        setSlideValue(null);
        setHiddenRecentBall(null);
        setShiftRecents(null);
        transitionProgress.setValue(0);

        Animated.timing(currentOpacity, {
          toValue: 1,
          duration: FADE_IN_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      });
    } else {
      setShiftRecents(null);
      currentOpacity.setValue(0);
      Animated.timing(currentOpacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }

    prevCurrentRef.current = currentBall;
  }, [currentBall, currentOpacity, recentBalls, transitionProgress, windowCalledOpacity]);

  const slideScale = transitionProgress.interpolate({
    inputRange: [0, SHRINK_PHASE_END, 1],
    outputRange: [1, SMALL_BALL / LARGE_BALL, SMALL_BALL / LARGE_BALL],
  });
  const slideTranslateX = transitionProgress.interpolate({
    inputRange: [0, SHRINK_PHASE_END, 1],
    outputRange: [0, 0, SLIDE_DISTANCE],
  });

  const isShifting = shiftRecents !== null;
  const isTransitioning = slideValue !== null;
  const recentBallsToShow = isShifting
    ? shiftRecents
    : displayBalls.filter((ball) => ball !== hiddenRecentBall);

  const windowPreviewBall = upcomingBall ?? null;
  const windowCalledPreview = windowCalledBall;
  const calledBallsCount = recentBalls.length;
  const calledBallsLabel =
    calledBallsCount > MAX_RECENT_BALLS
      ? `Called Balls (${calledBallsCount})`
      : 'Called Balls';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.leftGroup}>
          <View style={styles.nextColumn}>
            {(showPauseControl || showNextControl || showAutoControl) && (
              <View style={styles.controlRow}>
                {showPauseControl && (
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={onTogglePause}
                    accessibilityRole="button"
                    accessibilityLabel={isPaused ? 'Resume game' : 'Pause game'}
                  >
                    <Text style={styles.controlIcon}>{isPaused ? '▶' : '⏸'}</Text>
                  </TouchableOpacity>
                )}
                {showNextControl && onNextBall && (
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      !canCallNextBall && styles.controlButtonDisabled,
                    ]}
                    onPress={onNextBall}
                    disabled={!canCallNextBall}
                    accessibilityRole="button"
                    accessibilityLabel={
                      canCallNextBall ? 'Call next ball' : 'All balls have been called'
                    }
                  >
                    <Text style={styles.controlIcon}>⏭</Text>
                  </TouchableOpacity>
                )}
                {showAutoControl && onToggleAutoMode && (
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      isAutoMode && styles.controlButtonActive,
                    ]}
                    onPress={onToggleAutoMode}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isAutoMode ? 'Switch to manual daubing' : 'Switch to auto daubing'
                    }
                  >
                    <Text style={styles.controlIcon}>🤖</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <Text style={styles.label}>Next Ball</Text>
            <View style={styles.windowBox}>
              {windowPreviewBall !== null && (
                <BingoBall value={windowPreviewBall} size="small" flat={IS_ANDROID} />
              )}
              {windowPreviewBall === null && windowCalledPreview !== null && (
                <Animated.View style={{ opacity: windowCalledOpacity }}>
                  <BingoBall value={windowCalledPreview} size="small" flat={IS_ANDROID} />
                </Animated.View>
              )}
            </View>
          </View>

          <View style={styles.centerColumn}>
            <Text style={styles.label}>Current Ball</Text>
            <View
              style={styles.currentSlot}
              collapsable={false}
              renderToHardwareTextureAndroid={IS_ANDROID}
            >
              {!isTransitioning && currentBall !== null && (
                <Animated.View style={{ opacity: currentOpacity }}>
                  <BingoBall value={currentBall} size="large" flat={IS_ANDROID} />
                </Animated.View>
              )}

              {slideValue !== null && (
                <Animated.View
                  pointerEvents="none"
                  collapsable={false}
                  renderToHardwareTextureAndroid={IS_ANDROID}
                  style={[
                    styles.slideClip,
                    {
                      transform: [{ scale: slideScale }, { translateX: slideTranslateX }],
                    },
                  ]}
                >
                  <BingoBall value={slideValue} size="large" flat />
                </Animated.View>
              )}
            </View>
          </View>
        </View>

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
              calledBallsCount > MAX_RECENT_BALLS
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
                {calledBallsLabel}
              </Text>
            </View>
            <View style={[styles.recentRow, isShifting && styles.recentRowClipped]}>
              <RecentBallsRow
                balls={recentBallsToShow}
                shiftProgress={isShifting ? transitionProgress : null}
                isShifting={isShifting}
                styles={styles}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Announcer;
