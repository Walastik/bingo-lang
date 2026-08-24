import { useCallback, useState } from 'react';
import { generateCard } from '@/game/card';
import { BingoCard } from '@/game/types';
import { useLatestRef } from './useLatestRef';

/** Invisible opponents. Enough that someone usually wins near the real pace. */
const NPC_CARD_COUNT = 10;

interface UseCardSetParams {
  userCardCount: number;
  isCallerOnly: boolean;
}

/**
 * Owns the cards in play. The refs let the draw timer check for a win without
 * being rebuilt each time a card is dealt.
 */
export function useCardSet({ userCardCount, isCallerOnly }: UseCardSetParams) {
  const [userCards, setUserCards] = useState<BingoCard[]>([]);
  const [npcCards, setNpcCards] = useState<BingoCard[]>([]);

  const userCardsRef = useLatestRef(userCards);
  const npcCardsRef = useLatestRef(npcCards);

  const generateFreshCards = useCallback(() => {
    // A caller runs the board for a physical room; nobody is playing in-app.
    if (isCallerOnly) {
      setNpcCards([]);
      setUserCards([]);
      return;
    }

    setNpcCards(Array.from({ length: NPC_CARD_COUNT }, () => generateCard()));
    setUserCards(Array.from({ length: userCardCount }, () => generateCard()));
  }, [isCallerOnly, userCardCount]);

  return { userCards, npcCards, userCardsRef, npcCardsRef, generateFreshCards };
}
