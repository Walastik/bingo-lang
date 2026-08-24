import { RefObject, useCallback } from 'react';
import { GameState } from '@/game/types';

interface UseGameFlowParams {
  isCallerOnly: boolean;
  gameState: GameState;
  gameStateRef: RefObject<GameState>;
  setGameState: (state: GameState) => void;
  isPlaying: () => boolean;
  drawnBallsRef: RefObject<Set<number>>;
  caller: {
    startDrawLoop: () => void;
    stopDrawing: () => void;
    drawNextBall: () => unknown;
    resetBoard: () => void;
  };
  cards: {
    generateFreshCards: () => void;
  };
  daubs: {
    clearDaubs: () => void;
    resetAutoMode: () => void;
  };
  win: {
    clearWinResult: () => void;
    recordUserWin: (drawnBalls: Set<number>) => void;
    userHasBingo: (drawnBalls: Set<number>) => boolean;
  };
  rounds: {
    advanceRound: () => void;
    resetRounds: () => void;
    isFinalRound: () => boolean;
  };
}

/**
 * The state machine: every transition between lobby, play, and the win states.
 *
 * Each transition stops the draw loop first, so no timer outlives the state it
 * belonged to.
 */
export function useGameFlow({
  isCallerOnly,
  gameState,
  gameStateRef,
  setGameState,
  isPlaying,
  drawnBallsRef,
  caller,
  cards,
  daubs,
  win,
  rounds,
}: UseGameFlowParams) {
  const { startDrawLoop, stopDrawing, drawNextBall, resetBoard } = caller;
  const { generateFreshCards } = cards;
  const { clearDaubs, resetAutoMode } = daubs;
  const { clearWinResult, recordUserWin, userHasBingo } = win;
  const { advanceRound, resetRounds, isFinalRound } = rounds;

  /** Deal a fresh board and begin playing, without touching the round number. */
  const openRound = useCallback(() => {
    stopDrawing();
    clearWinResult();
    generateFreshCards();
    resetBoard();
    clearDaubs();
    setGameState('playing');
  }, [
    clearDaubs,
    clearWinResult,
    generateFreshCards,
    resetBoard,
    setGameState,
    stopDrawing,
  ]);

  const startGame = useCallback(() => {
    if (gameState !== 'lobby') {
      return;
    }

    stopDrawing();
    setGameState('playing');

    // A caller draws by hand, so no timer is started.
    if (!isCallerOnly) {
      startDrawLoop();
    }
  }, [gameState, isCallerOnly, setGameState, startDrawLoop, stopDrawing]);

  const callNextBall = useCallback(() => {
    if (isCallerOnly && isPlaying()) {
      drawNextBall();
    }
  }, [drawNextBall, isCallerOnly, isPlaying]);

  const callBingo = useCallback(() => {
    // Checked before stopping, so the verdict uses the board as the player saw it.
    const hasWon = userHasBingo(drawnBallsRef.current);
    stopDrawing();

    if (!hasWon) {
      clearWinResult();
      setGameState('invalidBingo');
      return;
    }

    recordUserWin(drawnBallsRef.current);
    setGameState(isFinalRound() ? 'gameWon' : 'roundWon');
  }, [
    clearWinResult,
    drawnBallsRef,
    isFinalRound,
    recordUserWin,
    setGameState,
    stopDrawing,
    userHasBingo,
  ]);

  const continueGame = useCallback(() => {
    if (gameState !== 'invalidBingo') {
      return;
    }

    clearWinResult();
    stopDrawing();
    setGameState('playing');
    startDrawLoop();
  }, [clearWinResult, gameState, setGameState, startDrawLoop, stopDrawing]);

  const startNextRound = useCallback(() => {
    const state = gameStateRef.current;
    if (state !== 'roundWon' && state !== 'npcWon') {
      return;
    }

    advanceRound();
    openRound();
    startDrawLoop();
  }, [advanceRound, gameStateRef, openRound, startDrawLoop]);

  const resetGame = useCallback(() => {
    stopDrawing();
    clearWinResult();
    resetRounds();
    generateFreshCards();
    resetBoard();
    clearDaubs();
    resetAutoMode();
    setGameState('lobby');
  }, [
    clearDaubs,
    clearWinResult,
    generateFreshCards,
    resetAutoMode,
    resetBoard,
    resetRounds,
    setGameState,
    stopDrawing,
  ]);

  /** Caller-only: the win happened in the room, so just move the lineup along. */
  const declareWinner = useCallback(() => {
    if (!isCallerOnly || !isPlaying()) {
      return;
    }

    if (isFinalRound()) {
      resetGame();
      return;
    }

    advanceRound();
    openRound();
  }, [advanceRound, isCallerOnly, isFinalRound, isPlaying, openRound, resetGame]);

  return {
    startGame,
    callNextBall,
    callBingo,
    continueGame,
    startNextRound,
    resetGame,
    declareWinner,
  };
}
