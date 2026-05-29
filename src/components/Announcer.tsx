import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BingoBall from './BingoBall';

interface AnnouncerProps {
  currentBall: number | null;
  upcomingBall: number | null;
  recentBalls: number[];
  isPaused: boolean;
  showPauseControl: boolean;
  onTogglePause: () => void;
  isAutoMode?: boolean;
  showAutoControl?: boolean;
  onToggleAutoMode?: () => void;
  onRecentPress?: () => void;
}

const LARGE_BALL = 120;
const SMALL_BALL = 50;
const BALL_GAP = 10;
const SLOT_WIDTH = SMALL_BALL + BALL_GAP;
const RECENT_ROW_WIDTH = SMALL_BALL * 3 + BALL_GAP * 2;
const SLIDE_DISTANCE = LARGE_BALL / 2 + BALL_GAP + SMALL_BALL / 2;
const TRANSITION_MS = 460;
const SHRINK_PHASE_END = 0.4;
const FADE_IN_MS = 220;
const IS_ANDROID = Platform.OS === 'android';

type AnimatedValue = Animated.Value;

/** Recent row as shown before a call (newest first, excludes a ball e.g. current). */
function recentRowFromDrawn(drawnBalls: number[], excludeBall: number): number[] {
  return drawnBalls.filter((ball) => ball !== excludeBall).slice(-3).reverse();
}

function RecentBallsRow({
  balls,
  shiftProgress,
  isShifting,
}: {
  balls: number[];
  shiftProgress: AnimatedValue | null;
  isShifting: boolean;
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
        const shouldShift = isShifting && balls.length >= 3;

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
  isAutoMode = false,
  showAutoControl = false,
  onToggleAutoMode,
  onRecentPress,
}: AnnouncerProps) => {
  const previousBalls = recentBalls.filter((ball) => ball !== currentBall);
  const displayBalls = previousBalls.slice(-3).reverse();

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

      if (preShift.length >= 3) {
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
    calledBallsCount >= 4 ? `Called Balls (${calledBallsCount})` : 'Called Balls';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.leftGroup}>
          <View style={styles.nextColumn}>
            {(showPauseControl || showAutoControl) && (
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

        <TouchableOpacity
          style={styles.recentColumn}
          onPress={onRecentPress}
          disabled={!onRecentPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            calledBallsCount >= 4
              ? `View all called balls, ${calledBallsCount} called`
              : 'View all called balls'
          }
          accessibilityHint="Opens the full called balls board"
        >
          <View style={[styles.calledBallsButton, !onRecentPress && styles.calledBallsButtonDisabled]}>
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
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingLeft: 6,
    paddingRight: 8,
    backgroundColor: '#f5f5f5',
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
    color: '#666',
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
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#D4EDFF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  controlIcon: {
    fontSize: 18,
    color: '#333',
    lineHeight: 22,
  },
  windowBox: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    backgroundColor: '#fafafa',
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
  calledBallsButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E6F2FF',
    borderWidth: 1,
    borderColor: '#A8CEFF',
    marginBottom: 6,
  },
  calledBallsButtonDisabled: {
    opacity: 0.6,
  },
  calledBallsButtonText: {
    fontSize: 11,
    color: '#0051A8',
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

export default Announcer;
