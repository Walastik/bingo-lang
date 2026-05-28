import { useState, useEffect, useCallback, useRef } from 'react';
import { BingoCard, generateCard, generateDeck, checkWin } from '../utils/bingoUtils';

type GameState = 'lobby' | 'playing' | 'userWon' | 'npcWon' | 'invalidBingo';

const BALL_DRAW_INTERVAL_MS = 5000;
const UPCOMING_BALL_REVEAL_DELAY_MS = BALL_DRAW_INTERVAL_MS * 0.25;

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
  
  const deckRef = useRef<number[]>([]);
  const drawnBallsSetRef = useRef<Set<number>>(new Set());
  const drawTimerRef = useRef<number | null>(null);
  const upcomingBallTimeoutRef = useRef<number | null>(null);
  const nextDrawAtRef = useRef<number | null>(null);
  const upcomingRevealAtRef = useRef<number | null>(null);
  const remainingDrawMsRef = useRef<number | null>(null);
  const remainingUpcomingRevealMsRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
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

  const scheduleUpcomingBallReveal = useCallback((delayMs = UPCOMING_BALL_REVEAL_DELAY_MS) => {
    clearUpcomingBallTimeout();
    setUpcomingBall(null);

    if (deckRef.current.length === 0) {
      return;
    }

    upcomingRevealAtRef.current = Date.now() + delayMs;
    upcomingBallTimeoutRef.current = window.setTimeout(() => {
      upcomingBallTimeoutRef.current = null;
      upcomingRevealAtRef.current = null;
      if (deckRef.current.length > 0) {
        setUpcomingBall(deckRef.current[deckRef.current.length - 1]);
      }
    }, delayMs);
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
    setGameState('lobby');
  }, [userCardCount]);

  useEffect(() => {
    npcCardsRef.current = npcCards;
  }, [npcCards]);

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

    if (deckRef.current.length > 0) {
      scheduleUpcomingBallReveal();
    }
  }, [clearDrawTimer, clearUpcomingBallTimeout, scheduleUpcomingBallReveal]);

  const scheduleNextBallDraw = useCallback((delayMs = BALL_DRAW_INTERVAL_MS) => {
    clearDrawTimer();
    nextDrawAtRef.current = Date.now() + delayMs;

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
    }, delayMs);
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

    const drawDelay = remainingDrawMsRef.current ?? BALL_DRAW_INTERVAL_MS;
    remainingDrawMsRef.current = null;
    scheduleNextBallDraw(drawDelay);
  }, [scheduleNextBallDraw, scheduleUpcomingBallReveal]);

  const togglePause = useCallback(() => {
    if (isPausedRef.current) {
      resumeGame();
    } else {
      pauseGame();
    }
  }, [pauseGame, resumeGame]);

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
    startGame,
    pauseGame,
    resumeGame,
    togglePause,
    daubSpace,
    callBingo,
    continueGame,
    resetGame
  };
};

export default useBingoGame;