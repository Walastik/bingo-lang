import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  BingoCard,
  generateCard,
  generateDeck,
  checkWin,
  sortCardIndicesByProximity,
} from '../utils/bingoUtils';

type GameState = 'lobby' | 'playing' | 'userWon' | 'npcWon' | 'invalidBingo';

export const GAME_SPEED_OPTIONS = [0.25, 0.5, 1, 2, 3] as const;
export type GameSpeed = (typeof GAME_SPEED_OPTIONS)[number];

const BALL_DRAW_INTERVAL_MS = 5000;
const UPCOMING_BALL_REVEAL_RATIO = 0.25;

const getBallDrawIntervalMs = (speed: GameSpeed) => BALL_DRAW_INTERVAL_MS / speed;
const getUpcomingBallRevealDelayMs = (speed: GameSpeed) =>
  getBallDrawIntervalMs(speed) * UPCOMING_BALL_REVEAL_RATIO;

interface UseBingoGameParams {
  userCardCount: number;
}

const useBingoGame = ({ userCardCount }: UseBingoGameParams) => {
  const [userCards, setUserCards] = useState<BingoCard[]>([]);
  const [npcCards, setNpcCards] = useState<BingoCard[]>([]);
  const npcCardsRef = useRef<BingoCard[]>([]);
  const [drawnBalls, setDrawnBalls] = useState<number[]>([]);
  const [currentBall, setCurrentBall] = useState<number | null>(null);
  const [upcomingBall, setUpcomingBall] = useState<number | null>(null);
  const [userDaubs, setUserDaubs] = useState<Set<string>>(new Set());
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [gameSpeed, setGameSpeedState] = useState<GameSpeed>(1);
  
  const deckRef = useRef<number[]>([]);
  const userCardsRef = useRef<BingoCard[]>([]);
  const drawnBallsSetRef = useRef<Set<number>>(new Set());
  const drawTimerRef = useRef<number | null>(null);
  const upcomingBallTimeoutRef = useRef<number | null>(null);
  const nextDrawAtRef = useRef<number | null>(null);
  const upcomingRevealAtRef = useRef<number | null>(null);
  const remainingDrawMsRef = useRef<number | null>(null);
  const remainingUpcomingRevealMsRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const isAutoModeRef = useRef(false);
  const gameSpeedRef = useRef<GameSpeed>(1);
  const gameStateRef = useRef<GameState>('lobby');

  const clearDrawTimer = useCallback(() => {
    if (drawTimerRef.current) {
      clearTimeout(drawTimerRef.current);
      drawTimerRef.current = null;
    }
    nextDrawAtRef.current = null;
  }, []);

  const clearUpcomingBallTimeout = useCallback(() => {
    if (upcomingBallTimeoutRef.current) {
      clearTimeout(upcomingBallTimeoutRef.current);
      upcomingBallTimeoutRef.current = null;
    }
    upcomingRevealAtRef.current = null;
  }, []);

  const scheduleUpcomingBallReveal = useCallback((delayMs?: number) => {
    const delay = delayMs ?? getUpcomingBallRevealDelayMs(gameSpeedRef.current);
    clearUpcomingBallTimeout();
    setUpcomingBall(null);

    if (deckRef.current.length === 0) {
      return;
    }

    upcomingRevealAtRef.current = Date.now() + delay;
    upcomingBallTimeoutRef.current = window.setTimeout(() => {
      upcomingBallTimeoutRef.current = null;
      upcomingRevealAtRef.current = null;
      if (deckRef.current.length > 0) {
        setUpcomingBall(deckRef.current[deckRef.current.length - 1]);
      }
    }, delay);
  }, [clearUpcomingBallTimeout]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const newNPCCards: BingoCard[] = [];
    for (let i = 0; i < 10; i++) {
      newNPCCards.push(generateCard());
    }
    setNpcCards(newNPCCards);
    
    const newUserCards: BingoCard[] = [];
    for (let i = 0; i < userCardCount; i++) {
      newUserCards.push(generateCard());
    }
    setUserCards(newUserCards);
    
    deckRef.current = generateDeck();
    drawnBallsSetRef.current = new Set();
    setDrawnBalls([]);
    setCurrentBall(null);
    setUpcomingBall(null);
    setUserDaubs(new Set());
    setIsAutoMode(false);
    isAutoModeRef.current = false;
    setGameState('lobby');
  }, [userCardCount]);

  useEffect(() => {
    npcCardsRef.current = npcCards;
  }, [npcCards]);

  useEffect(() => {
    userCardsRef.current = userCards;
  }, [userCards]);

  const applyAutoDaubsForDrawnBalls = useCallback(() => {
    if (!isAutoModeRef.current) {
      return;
    }

    setUserDaubs(prev => {
      const next = new Set(prev);

      userCardsRef.current.forEach((card, cardIndex) => {
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            const flatIndex = row * 5 + col;
            const cell = card.grid[flatIndex];

            if (typeof cell === 'number' && drawnBallsSetRef.current.has(cell)) {
              next.add(`${cardIndex}-${row}-${col}`);
            }
          }
        }
      });

      return next;
    });
  }, []);

  useEffect(() => {
    isAutoModeRef.current = isAutoMode;

    if (isAutoMode) {
      applyAutoDaubsForDrawnBalls();
    }
  }, [isAutoMode, applyAutoDaubsForDrawnBalls]);

  const cardOrder = useMemo(
    () =>
      sortCardIndicesByProximity(
        userCards,
        new Set(drawnBalls),
        userDaubs,
        isAutoMode,
      ),
    [userCards, drawnBalls, userDaubs, isAutoMode],
  );

  const drawNextBall = useCallback(() => {
    clearUpcomingBallTimeout();
    setUpcomingBall(null);

    if (deckRef.current.length === 0) return;
    
    const nextBall = deckRef.current.pop()!;
    drawnBallsSetRef.current.add(nextBall);
    setDrawnBalls(prev => [...prev, nextBall]);
    setCurrentBall(nextBall);
    
    const hasNPCWon = npcCardsRef.current.some(card =>
      checkWin(card, drawnBallsSetRef.current, false)
    );
    
    if (hasNPCWon) {
      clearDrawTimer();
      clearUpcomingBallTimeout();
      isPausedRef.current = false;
      setIsPaused(false);
      setGameState('npcWon');
      setUpcomingBall(null);
      return;
    }

    applyAutoDaubsForDrawnBalls();

    if (deckRef.current.length > 0) {
      scheduleUpcomingBallReveal();
    }
  }, [
    applyAutoDaubsForDrawnBalls,
    clearDrawTimer,
    clearUpcomingBallTimeout,
    scheduleUpcomingBallReveal,
  ]);

  const scheduleNextBallDraw = useCallback((delayMs?: number) => {
    const delay = delayMs ?? getBallDrawIntervalMs(gameSpeedRef.current);
    clearDrawTimer();
    nextDrawAtRef.current = Date.now() + delay;

    drawTimerRef.current = window.setTimeout(() => {
      drawTimerRef.current = null;
      nextDrawAtRef.current = null;

      if (isPausedRef.current || gameStateRef.current !== 'playing') {
        return;
      }

      if (deckRef.current.length === 0) {
        setGameState('lobby');
        return;
      }

      drawNextBall();

      if (gameStateRef.current === 'playing' && deckRef.current.length > 0) {
        scheduleNextBallDraw();
      }
    }, delay);
  }, [clearDrawTimer, drawNextBall]);
  
  const startGame = useCallback(() => {
    if (gameState !== 'lobby') return;
    
    isPausedRef.current = false;
    setIsPaused(false);
    setGameState('playing');
    
    drawNextBall();
    scheduleNextBallDraw();
  }, [gameState, drawNextBall, scheduleNextBallDraw]);

  const pauseGame = useCallback(() => {
    if (gameStateRef.current !== 'playing' || isPausedRef.current) {
      return;
    }

    isPausedRef.current = true;
    setIsPaused(true);

    if (drawTimerRef.current && nextDrawAtRef.current !== null) {
      remainingDrawMsRef.current = Math.max(0, nextDrawAtRef.current - Date.now());
      clearDrawTimer();
    }

    if (upcomingBallTimeoutRef.current && upcomingRevealAtRef.current !== null) {
      remainingUpcomingRevealMsRef.current = Math.max(
        0,
        upcomingRevealAtRef.current - Date.now()
      );
      clearUpcomingBallTimeout();
    } else {
      remainingUpcomingRevealMsRef.current = null;
    }
  }, [clearDrawTimer, clearUpcomingBallTimeout]);

  const resumeGame = useCallback(() => {
    if (gameStateRef.current !== 'playing' || !isPausedRef.current) {
      return;
    }

    isPausedRef.current = false;
    setIsPaused(false);

    const pendingUpcomingMs = remainingUpcomingRevealMsRef.current;
    remainingUpcomingRevealMsRef.current = null;

    if (pendingUpcomingMs !== null && deckRef.current.length > 0) {
      scheduleUpcomingBallReveal(pendingUpcomingMs);
    }

    const drawDelay =
      remainingDrawMsRef.current ?? getBallDrawIntervalMs(gameSpeedRef.current);
    remainingDrawMsRef.current = null;
    scheduleNextBallDraw(drawDelay);
  }, [scheduleNextBallDraw, scheduleUpcomingBallReveal]);

  const setGameSpeed = useCallback((speed: GameSpeed) => {
    const oldSpeed = gameSpeedRef.current;
    if (oldSpeed === speed) {
      return;
    }

    gameSpeedRef.current = speed;
    setGameSpeedState(speed);

    if (isPausedRef.current && gameStateRef.current === 'playing') {
      if (remainingDrawMsRef.current !== null) {
        remainingDrawMsRef.current = remainingDrawMsRef.current * (oldSpeed / speed);
      }

      if (remainingUpcomingRevealMsRef.current !== null) {
        remainingUpcomingRevealMsRef.current =
          remainingUpcomingRevealMsRef.current * (oldSpeed / speed);
      }
    }
  }, []);

  const togglePause = useCallback(() => {
    if (isPausedRef.current) {
      resumeGame();
    } else {
      pauseGame();
    }
  }, [pauseGame, resumeGame]);

  const toggleAutoMode = useCallback(() => {
    setIsAutoMode(prev => !prev);
  }, []);

  const daubSpace = useCallback((cardIndex: number, row: number, col: number) => {
    const key = `${cardIndex}-${row}-${col}`;
    setUserDaubs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const autoDaubColumn = useCallback((cardIndex: number, col: number) => {
    const card = userCards[cardIndex];
    if (!card || col < 0 || col > 4) {
      return;
    }

    setUserDaubs(prev => {
      const next = new Set(prev);

      for (let row = 0; row < 5; row++) {
        const key = `${cardIndex}-${row}-${col}`;
        const flatIndex = row * 5 + col;
        const cell = card.grid[flatIndex];

        if (typeof cell === 'number' && drawnBallsSetRef.current.has(cell)) {
          next.add(key);
        } else {
          next.delete(key);
        }
      }

      return next;
    });
  }, [userCards]);

  const callBingo = useCallback(() => {
    let hasWon = false;
    
    for (let i = 0; i < userCards.length; i++) {
      const cardDaubs = new Set<string>();
      userDaubs.forEach(key => {
        if (key.startsWith(`${i}-`)) {
          cardDaubs.add(key.slice(`${i}-`.length));
        }
      });

      if (checkWin(userCards[i], drawnBallsSetRef.current, true, cardDaubs)) {
        hasWon = true;
        break;
      }
    }
    
    clearDrawTimer();
    clearUpcomingBallTimeout();
    isPausedRef.current = false;
    setIsPaused(false);
    setUpcomingBall(null);
    
    if (hasWon) {
      setGameState('userWon');
    } else {
      setGameState('invalidBingo');
    }
  }, [clearDrawTimer, clearUpcomingBallTimeout, userCards, userDaubs]);

  const continueGame = useCallback(() => {
    if (gameState === 'invalidBingo') {
      isPausedRef.current = false;
      setIsPaused(false);
      setGameState('playing');
      
      drawNextBall();
      scheduleNextBallDraw();
    }
  }, [gameState, drawNextBall, scheduleNextBallDraw]);

  useEffect(() => {
    return () => {
      clearDrawTimer();
      clearUpcomingBallTimeout();
    };
  }, [clearDrawTimer, clearUpcomingBallTimeout]);

  const resetGame = useCallback(() => {
    clearDrawTimer();
    clearUpcomingBallTimeout();
    isPausedRef.current = false;
    setIsPaused(false);
    remainingDrawMsRef.current = null;
    remainingUpcomingRevealMsRef.current = null;

    const newNPCCards: BingoCard[] = [];
    for (let i = 0; i < 10; i++) {
      newNPCCards.push(generateCard());
    }
    setNpcCards(newNPCCards);
    
    const newUserCards: BingoCard[] = [];
    for (let i = 0; i < userCardCount; i++) {
      newUserCards.push(generateCard());
    }
    setUserCards(newUserCards);
    
    deckRef.current = generateDeck();
    drawnBallsSetRef.current = new Set();
    setDrawnBalls([]);
    setCurrentBall(null);
    setUpcomingBall(null);
    setUserDaubs(new Set());
    setIsAutoMode(false);
    isAutoModeRef.current = false;
    setGameState('lobby');
  }, [clearDrawTimer, clearUpcomingBallTimeout, userCardCount]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    npcCardsRef.current = npcCards;
  }, [npcCards]);

  return {
    userCards,
    npcCards,
    drawnBalls,
    currentBall,
    upcomingBall,
    userDaubs,
    gameState,
    isPaused,
    isAutoMode,
    gameSpeed,
    cardOrder,
    startGame,
    pauseGame,
    resumeGame,
    togglePause,
    toggleAutoMode,
    setGameSpeed,
    daubSpace,
    autoDaubColumn,
    callBingo,
    continueGame,
    resetGame
  };
};

export default useBingoGame;