import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { CellCoord } from '@/game/types';

const STAGGER_MS = 70;

/**
 * Runs the win celebration: the card springs in, the winning cells light up one
 * after another, then the highlight pulses until unmount.
 */
export function useWinCardAnimation(winningCells: CellCoord[]) {
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const cellRevealValues = useRef(
    winningCells.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const staggeredReveals = winningCells.map((_, index) =>
      Animated.sequence([
        Animated.delay(index * STAGGER_MS),
        Animated.spring(cellRevealValues[index], {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.stagger(STAGGER_MS / 2, staggeredReveals).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, [cardOpacity, cardScale, cellRevealValues, pulse, winningCells]);

  return { cardScale, cardOpacity, pulse, cellRevealValues };
}
