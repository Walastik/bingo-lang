import { useCallback, useMemo, useState } from 'react';
import { ROUND_SEQUENCE } from '@/game/patterns/roundConfigs';

/**
 * The lobby's own state: how many cards to deal, which mode to play, and which
 * rounds are in the lineup.
 *
 * `selectedRoundIndices` is memoized because the game hook deals a new board
 * whenever it changes identity.
 */
export function useLobbyConfig() {
  const [selectedCardCount, setSelectedCardCount] = useState(1);
  const [isCallerOnly, setIsCallerOnly] = useState(false);
  const [selectedRounds, setSelectedRounds] = useState<boolean[]>(() =>
    ROUND_SEQUENCE.map(() => true),
  );

  const selectedRoundIndices = useMemo(
    () =>
      selectedRounds.flatMap((isSelected, index) => (isSelected ? [index] : [])),
    [selectedRounds],
  );

  /** The last round standing cannot be turned off; a game needs one. */
  const toggleRoundSelection = useCallback((index: number) => {
    setSelectedRounds((prev) => {
      const isOnlySelection = prev[index] && prev.filter(Boolean).length <= 1;
      if (isOnlySelection) {
        return prev;
      }

      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  return {
    selectedCardCount,
    setSelectedCardCount,
    isCallerOnly,
    setIsCallerOnly,
    selectedRounds,
    selectedRoundIndices,
    toggleRoundSelection,
  };
}
