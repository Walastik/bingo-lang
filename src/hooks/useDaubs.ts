import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  GRID_SIZE,
  daubKey,
  daubKeyPrefix,
  fromFlatIndex,
  toFlatIndex,
} from '@/game/constants';
import { BingoCard } from '@/game/types';

interface UseDaubsParams {
  userCards: BingoCard[];
  userCardsRef: RefObject<BingoCard[]>;
}

/**
 * Owns which spaces the player has marked, across every card.
 *
 * The called balls arrive as an argument rather than being read from the ball
 * caller, so this hook has no dependency on it.
 */
export function useDaubs({ userCards, userCardsRef }: UseDaubsParams) {
  const [userDaubs, setUserDaubs] = useState<Set<string>>(new Set());
  const [isAutoMode, setIsAutoMode] = useState(false);
  const isAutoModeRef = useRef(false);

  useEffect(() => {
    isAutoModeRef.current = isAutoMode;
  }, [isAutoMode]);

  const clearDaubs = useCallback(() => {
    setUserDaubs(new Set());
  }, []);

  /** No-ops unless auto mode is on, so the draw loop can call it blindly. */
  const applyAutoDaubs = useCallback(
    (drawnBalls: Set<number>) => {
      if (!isAutoModeRef.current) {
        return;
      }

      setUserDaubs((prev) => {
        const next = new Set(prev);

        userCardsRef.current.forEach((card, cardIndex) => {
          card.grid.forEach((cell, flatIndex) => {
            if (typeof cell === 'number' && drawnBalls.has(cell)) {
              const { row, col } = fromFlatIndex(flatIndex);
              next.add(daubKey(cardIndex, row, col));
            }
          });
        });

        return next;
      });
    },
    [userCardsRef],
  );

  const daubSpace = useCallback((cardIndex: number, row: number, col: number) => {
    const key = daubKey(cardIndex, row, col);

    setUserDaubs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  /** Tapping a column header daubs its called numbers and clears the rest. */
  const autoDaubColumn = useCallback(
    (cardIndex: number, col: number, drawnBalls: Set<number>) => {
      const card = userCards[cardIndex];
      if (!card || col < 0 || col >= GRID_SIZE) {
        return;
      }

      setUserDaubs((prev) => {
        const next = new Set(prev);

        for (let row = 0; row < GRID_SIZE; row++) {
          const key = daubKey(cardIndex, row, col);
          const cell = card.grid[toFlatIndex(row, col)];

          if (typeof cell === 'number' && drawnBalls.has(cell)) {
            next.add(key);
          } else {
            next.delete(key);
          }
        }

        return next;
      });
    },
    [userCards],
  );

  /** Daubs for one card, re-keyed to `row-col` for the win checker. */
  const getUserDaubsForCard = useCallback(
    (cardIndex: number) => {
      const prefix = daubKeyPrefix(cardIndex);
      const cardDaubs = new Set<string>();

      userDaubs.forEach((key) => {
        if (key.startsWith(prefix)) {
          cardDaubs.add(key.slice(prefix.length));
        }
      });

      return cardDaubs;
    },
    [userDaubs],
  );

  const toggleAutoMode = useCallback(() => {
    setIsAutoMode((prev) => !prev);
  }, []);

  const resetAutoMode = useCallback(() => {
    isAutoModeRef.current = false;
    setIsAutoMode(false);
  }, []);

  return {
    userDaubs,
    isAutoMode,
    applyAutoDaubs,
    clearDaubs,
    daubSpace,
    autoDaubColumn,
    getUserDaubsForCard,
    toggleAutoMode,
    resetAutoMode,
  };
}
