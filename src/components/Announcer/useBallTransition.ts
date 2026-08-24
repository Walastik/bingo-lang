import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import {
  FADE_IN_MS,
  LARGE_BALL,
  MAX_RECENT_BALLS,
  SHRINK_PHASE_END,
  SLIDE_DISTANCE,
  SMALL_BALL,
  TRANSITION_MS,
} from './announcerLayout';

/** Recent row as shown before a call (newest first, excluding one ball). */
function recentRowFromDrawn(drawnBalls: number[], excludeBall: number): number[] {
  return drawnBalls
    .filter((ball) => ball !== excludeBall)
    .slice(-MAX_RECENT_BALLS)
    .reverse();
}

interface UseBallTransitionParams {
  currentBall: number | null;
  upcomingBall: number | null;
  recentBalls: number[];
}

/**
 * Drives the hand-off when a new ball is called: the outgoing ball shrinks and
 * slides into the recents row while the incoming ball fades into the stage.
 *
 * When the row is already full the whole row shifts one slot and the oldest
 * ball fades out; otherwise the outgoing ball is simply hidden from the row
 * until its slide lands, so it is never drawn in two places at once.
 */
export function useBallTransition({
  currentBall,
  upcomingBall,
  recentBalls,
}: UseBallTransitionParams) {
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

  return {
    slideValue,
    slideScale,
    slideTranslateX,
    currentOpacity,
    isTransitioning: slideValue !== null,
    isShifting,
    shiftProgress: isShifting ? transitionProgress : null,
    recentBallsToShow: isShifting
      ? shiftRecents
      : displayBalls.filter((ball) => ball !== hiddenRecentBall),
    windowCalledBall,
    windowCalledOpacity,
  };
}
