import { useCallback, useRef, useState } from 'react';
import { RoundConfig } from '@/game/types';
import { useLatestRef } from './useLatestRef';

/**
 * Tracks which round of the lineup is being played.
 *
 * The index ref is written at the mutation site rather than in an effect:
 * advancing a round and then asking whether it was the last one happens in a
 * single tick, before any re-render.
 */
export function useRoundProgression(rounds: RoundConfig[]) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const currentRoundIndexRef = useRef(0);

  const currentRound = rounds[currentRoundIndex] ?? rounds[0];
  const currentRoundRef = useLatestRef(currentRound);
  const roundCountRef = useLatestRef(rounds.length);

  const setRoundIndex = useCallback((index: number) => {
    currentRoundIndexRef.current = index;
    setCurrentRoundIndex(index);
  }, []);

  const advanceRound = useCallback(() => {
    setRoundIndex(currentRoundIndexRef.current + 1);
  }, [setRoundIndex]);

  const resetRounds = useCallback(() => {
    setRoundIndex(0);
  }, [setRoundIndex]);

  const isFinalRound = useCallback(
    () => currentRoundIndexRef.current >= roundCountRef.current - 1,
    [roundCountRef],
  );

  return {
    currentRoundIndex,
    currentRound,
    currentRoundRef,
    totalRounds: rounds.length,
    advanceRound,
    resetRounds,
    isFinalRound,
  };
}
