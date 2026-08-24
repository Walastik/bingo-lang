import React, { createContext, useContext } from 'react';
import useBingoGame from '@/hooks/useBingoGame';
import { useLobbyConfig } from '@/hooks/useLobbyConfig';

/**
 * Derived from the hooks rather than restated, so adding a field to either one
 * reaches the screens without a second declaration to keep in step.
 */
type GameContextValue = ReturnType<typeof useLobbyConfig> &
  ReturnType<typeof useBingoGame>;

const GameContext = createContext<GameContextValue | null>(null);

/**
 * Holds the lobby configuration and the game it feeds, so the two screens read
 * one value instead of App passing twenty-odd props down.
 *
 * The value is deliberately not memoized: every field on it is state owned by
 * this component, so a re-render here always means the value changed. Modal
 * state lives in `GameScreen` for the same reason — opening a modal should not
 * re-render the provider.
 */
export function GameProvider({ children }: { children: React.ReactNode }) {
  const lobby = useLobbyConfig();
  const game = useBingoGame({
    userCardCount: lobby.selectedCardCount,
    selectedRoundIndices: lobby.selectedRoundIndices,
    isCallerOnly: lobby.isCallerOnly,
  });

  return (
    <GameContext.Provider value={{ ...lobby, ...game }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
