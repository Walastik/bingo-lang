import { RefObject, useCallback, useState } from 'react';
import { BingoCard, RoundConfig, WinResult } from '@/game/types';
import { checkWin, findWinningCard } from '@/game/winCheck';
import { useLatestRef } from './useLatestRef';

interface UseWinDetectionParams {
  userCardsRef: RefObject<BingoCard[]>;
  npcCardsRef: RefObject<BingoCard[]>;
  currentRoundRef: RefObject<RoundConfig>;
  getUserDaubsForCard: (cardIndex: number) => Set<string>;
}

/**
 * Decides who has won and remembers the winning card for the overlay.
 *
 * An NPC is assumed to daub perfectly, so a called number counts immediately.
 * The player only wins on spaces they actually marked.
 */
export function useWinDetection({
  userCardsRef,
  npcCardsRef,
  currentRoundRef,
  getUserDaubsForCard,
}: UseWinDetectionParams) {
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const getUserDaubsForCardRef = useLatestRef(getUserDaubsForCard);

  const clearWinResult = useCallback(() => {
    setWinResult(null);
  }, []);

  const npcHasWon = useCallback(
    (drawnBalls: Set<number>) =>
      npcCardsRef.current.some((card) =>
        checkWin(card, drawnBalls, false, undefined, currentRoundRef.current),
      ),
    [currentRoundRef, npcCardsRef],
  );

  const userHasBingo = useCallback(
    (drawnBalls: Set<number>) =>
      userCardsRef.current.some((card, cardIndex) =>
        checkWin(
          card,
          drawnBalls,
          true,
          getUserDaubsForCardRef.current(cardIndex),
          currentRoundRef.current,
        ),
      ),
    [currentRoundRef, getUserDaubsForCardRef, userCardsRef],
  );

  const recordUserWin = useCallback(
    (drawnBalls: Set<number>) => {
      const result = findWinningCard(
        userCardsRef.current,
        drawnBalls,
        true,
        (cardIndex) => getUserDaubsForCardRef.current(cardIndex),
        currentRoundRef.current,
      );
      setWinResult(result ? { ...result, isNpc: false } : null);
    },
    [currentRoundRef, getUserDaubsForCardRef, userCardsRef],
  );

  const recordNpcWin = useCallback(
    (drawnBalls: Set<number>) => {
      const result = findWinningCard(
        npcCardsRef.current,
        drawnBalls,
        false,
        () => undefined,
        currentRoundRef.current,
      );
      setWinResult(result ? { ...result, isNpc: true } : null);
    },
    [currentRoundRef, npcCardsRef],
  );

  return {
    winResult,
    clearWinResult,
    npcHasWon,
    userHasBingo,
    recordUserWin,
    recordNpcWin,
  };
}
