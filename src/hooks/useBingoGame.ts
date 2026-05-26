import { useState, useEffect, useCallback, useRef } from 'react';
import { BingoCard, generateCard, generateDeck, checkWin } from '../utils/bingoUtils';

type GameState = 'lobby' | 'playing' | 'userWon' | 'npcWon';

interface UseBingoGameParams {
  userCardCount: number;
}

const useBingoGame = ({ userCardCount }: UseBingoGameParams) => {
  const [userCards, setUserCards] = useState<BingoCard[]>([]);
  const [npcCards, setNpcCards] = useState<BingoCard[]>([]);
  const npcCardsRef = useRef<BingoCard[]>([]);
  const [drawnBalls, setDrawnBalls] = useState<number[]>([]);
  const [currentBall, setCurrentBall] = useState<number | null>(null);
  const [userDaubs, setUserDaubs] = useState<Set<string>>(new Set());
  const [gameState, setGameState] = useState<GameState>('lobby');
  
  const deckRef = useRef<number[]>([]);
  const drawnBallsSetRef = useRef<Set<number>>(new Set());
  const intervalRef = useRef<number | null>(null);

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
    setUserDaubs(new Set());
    setGameState('lobby');
  }, [userCardCount]);

  useEffect(() => {
    npcCardsRef.current = npcCards;
  }, [npcCards]);

    const drawNextBall = useCallback(() => {
    if (deckRef.current.length === 0) return;
    
    const nextBall = deckRef.current.pop()!;
    drawnBallsSetRef.current.add(nextBall);
    setDrawnBalls(prev => [...prev, nextBall]);
    setCurrentBall(nextBall);
    
    const hasNPCWon = npcCardsRef.current.some(card =>
      checkWin(card, drawnBallsSetRef.current, false)
    );
    
    if (hasNPCWon) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setGameState('npcWon');
    }
  }, []);
  
  const startGame = useCallback(() => {
    if (gameState !== 'lobby') return;
    
    setGameState('playing');
    
    drawNextBall();
    
    intervalRef.current = window.setInterval(() => {
      if (deckRef.current.length > 0) {
        drawNextBall();
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setGameState('lobby');
      }
    }, 6500);
  }, [gameState, drawNextBall]);

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
    for (let i = 0; i < userCards.length; i++) {
      const cardDaubs = new Set<string>();
      userDaubs.forEach(key => {
        if (key.startsWith(`${i}-`)) {
          cardDaubs.add(key.slice(`${i}-`.length));
        }
      });

      if (checkWin(userCards[i], drawnBallsSetRef.current, true, cardDaubs)) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setGameState('userWon');
        return;
      }
    }
  }, [userCards, userDaubs]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const resetGame = useCallback(() => {
    // Clear any running timers just in case
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

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
    setUserDaubs(new Set());
    setGameState('lobby');
  }, [userCardCount]);

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
    userDaubs,
    gameState,
    startGame,
    daubSpace,
    callBingo,
    resetGame
  };
};

export default useBingoGame;