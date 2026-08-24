import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRoundsForGame } from '@/game/patterns/roundConfigs';
import { sortCardIndicesByProximity } from '@/game/proximity';
import { GameState } from '@/game/types';
import { useBallCaller } from './useBallCaller';
import { useCardSet } from './useCardSet';
import { useDaubs } from './useDaubs';
import { useGameFlow } from './useGameFlow';
import { useLatestRef } from './useLatestRef';
import { useRoundProgression } from './useRoundProgression';
import { useWinDetection } from './useWinDetection';

interface UseBingoGameParams {
  userCardCount: number;
  selectedRoundIndices: number[];
  isCallerOnly: boolean;
}

/**
 * Composes the game from six hooks. It owns only `gameState`, the one thing all
 * of them have to agree on, and wires the effects that cross their boundaries.
 */
const useBingoGame = ({
  userCardCount,
  selectedRoundIndices,
  isCallerOnly,
}: UseBingoGameParams) => {
  const [gameState, setGameState] = useState<GameState>('lobby');
  const gameStateRef = useLatestRef(gameState);

  const isPlaying = useCallback(
    () => gameStateRef.current === 'playing',
    [gameStateRef],
  );

  const rounds = useMemo(
    () => getRoundsForGame(selectedRoundIndices),
    [selectedRoundIndices],
  );

  const roundProgression = useRoundProgression(rounds);
  const cardSet = useCardSet({ userCardCount, isCallerOnly });
  const daubs = useDaubs({
    userCards: cardSet.userCards,
    userCardsRef: cardSet.userCardsRef,
  });
  const win = useWinDetection({
    userCardsRef: cardSet.userCardsRef,
    npcCardsRef: cardSet.npcCardsRef,
    currentRoundRef: roundProgression.currentRoundRef,
    getUserDaubsForCard: daubs.getUserDaubsForCard,
  });

  const { applyAutoDaubs } = daubs;
  const { npcHasWon, recordNpcWin } = win;

  /** The draw loop's only opinion about the game: keep going, or a win ended it. */
  const handleBallDrawn = useCallback(
    (_ball: number, drawnBalls: Set<number>) => {
      if (!isCallerOnly && npcHasWon(drawnBalls)) {
        recordNpcWin(drawnBalls);
        setGameState('npcWon');
        return 'stop' as const;
      }

      applyAutoDaubs(drawnBalls);
      return 'continue' as const;
    },
    [applyAutoDaubs, isCallerOnly, npcHasWon, recordNpcWin],
  );

  const handleDeckExhausted = useCallback(() => {
    setGameState('lobby');
  }, []);

  const caller = useBallCaller({
    onBallDrawn: handleBallDrawn,
    isPlaying,
    onDeckExhausted: handleDeckExhausted,
  });

  const flow = useGameFlow({
    isCallerOnly,
    gameState,
    gameStateRef,
    setGameState,
    isPlaying,
    drawnBallsRef: caller.drawnBallsRef,
    caller,
    cards: cardSet,
    daubs,
    win,
    rounds: roundProgression,
  });

  const { generateFreshCards } = cardSet;
  const { clearDaubs, resetAutoMode, isAutoMode, autoDaubColumn } = daubs;
  const { resetRounds } = roundProgression;
  const { resetBoard, drawnBallsRef } = caller;

  /** Deal a new board whenever the lobby configuration changes. */
  useEffect(() => {
    generateFreshCards();
    resetBoard();
    clearDaubs();
    resetRounds();
    resetAutoMode();
    setGameState('lobby');
  }, [
    clearDaubs,
    generateFreshCards,
    resetAutoMode,
    resetBoard,
    resetRounds,
    selectedRoundIndices,
  ]);

  // Switching auto mode on back-fills the balls already called.
  useEffect(() => {
    if (isAutoMode) {
      applyAutoDaubs(drawnBallsRef.current);
    }
  }, [applyAutoDaubs, drawnBallsRef, isAutoMode]);

  const handleAutoDaubColumn = useCallback(
    (cardIndex: number, col: number) => {
      autoDaubColumn(cardIndex, col, drawnBallsRef.current);
    },
    [autoDaubColumn, drawnBallsRef],
  );

  const cardOrder = useMemo(
    () =>
      sortCardIndicesByProximity(
        cardSet.userCards,
        new Set(caller.drawnBalls),
        daubs.userDaubs,
        daubs.isAutoMode,
        roundProgression.currentRound,
      ),
    [
      cardSet.userCards,
      caller.drawnBalls,
      daubs.userDaubs,
      daubs.isAutoMode,
      roundProgression.currentRound,
    ],
  );

  return {
    userCards: cardSet.userCards,
    drawnBalls: caller.drawnBalls,
    currentBall: caller.currentBall,
    upcomingBall: caller.upcomingBall,
    userDaubs: daubs.userDaubs,
    gameState,
    currentRound: roundProgression.currentRound,
    currentRoundNumber: roundProgression.currentRoundIndex + 1,
    totalRounds: roundProgression.totalRounds,
    rounds,
    isPaused: caller.isPaused,
    isAutoMode: daubs.isAutoMode,
    gameSpeed: caller.gameSpeed,
    cardOrder,
    winResult: win.winResult,
    pauseGame: caller.pause,
    resumeGame: caller.resume,
    togglePause: caller.togglePause,
    toggleAutoMode: daubs.toggleAutoMode,
    setGameSpeed: caller.setGameSpeed,
    daubSpace: daubs.daubSpace,
    autoDaubColumn: handleAutoDaubColumn,
    ...flow,
  };
};

export default useBingoGame;
