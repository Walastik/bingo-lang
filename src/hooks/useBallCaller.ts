import { useCallback, useRef, useState } from 'react';
import { generateDeck } from '@/game/card';
import {
  GameSpeed,
  getBallDrawIntervalMs,
  getUpcomingBallRevealDelayMs,
} from '@/game/speed';
import { useLatestRef } from './useLatestRef';
import { PausableTimeout, usePausableTimeout } from './usePausableTimeout';

/** Whether the draw loop should keep running after a ball is called. */
type DrawVerdict = 'continue' | 'stop';

/**
 * 'empty' is distinct from 'stop': an exhausted deck still schedules a tick, so
 * the loop reports back that the game is over instead of falling silent.
 */
type DrawOutcome = DrawVerdict | 'empty';

interface UseBallCallerParams {
  /**
   * Runs on every draw, before the next one is scheduled. Returning 'stop'
   * halts the loop, which is how a win ends a round — this hook itself knows
   * nothing about winning.
   */
  onBallDrawn: (ball: number, drawnBalls: Set<number>) => DrawVerdict;
  isPlaying: () => boolean;
  onDeckExhausted: () => void;
}

/**
 * Owns the deck and the draw loop. Pausing keeps the time left on both pending
 * timers, so resuming does not hand out a full extra interval.
 */
export function useBallCaller({
  onBallDrawn,
  isPlaying,
  onDeckExhausted,
}: UseBallCallerParams) {
  const [drawnBalls, setDrawnBalls] = useState<number[]>([]);
  const [currentBall, setCurrentBall] = useState<number | null>(null);
  const [upcomingBall, setUpcomingBall] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeedState] = useState<GameSpeed>(1);

  const deckRef = useRef<number[]>([]);
  const drawnBallsRef = useRef<Set<number>>(new Set());
  const isPausedRef = useRef(false);
  const gameSpeedRef = useRef<GameSpeed>(1);

  // Read through a ref so the timer callbacks never need rebuilding.
  const callbacksRef = useLatestRef({ onBallDrawn, isPlaying, onDeckExhausted });

  const revealTimer = usePausableTimeout(() => {
    if (deckRef.current.length > 0) {
      setUpcomingBall(deckRef.current[deckRef.current.length - 1]);
    }
  });

  /** Shows the ball that is coming next, partway through the interval. */
  const scheduleReveal = useCallback(
    (delayMs?: number) => {
      revealTimer.clear();
      setUpcomingBall(null);

      if (deckRef.current.length === 0) {
        return;
      }

      revealTimer.schedule(
        delayMs ?? getUpcomingBallRevealDelayMs(gameSpeedRef.current),
      );
    },
    [revealTimer],
  );

  const drawTimer: PausableTimeout = usePausableTimeout(() => {
    if (isPausedRef.current || !callbacksRef.current.isPlaying()) {
      return;
    }

    if (deckRef.current.length === 0) {
      callbacksRef.current.onDeckExhausted();
      return;
    }

    if (drawNextBall() === 'continue' && deckRef.current.length > 0) {
      drawTimer.schedule(getBallDrawIntervalMs(gameSpeedRef.current));
    }
  });

  const stopDrawing = useCallback(() => {
    drawTimer.clear();
    drawTimer.discardRemaining();
    revealTimer.clear();
    revealTimer.discardRemaining();
    isPausedRef.current = false;
    setIsPaused(false);
    setUpcomingBall(null);
  }, [drawTimer, revealTimer]);

  const drawNextBall = useCallback((): DrawOutcome => {
    revealTimer.clear();
    setUpcomingBall(null);

    if (deckRef.current.length === 0) {
      return 'empty';
    }

    const ball = deckRef.current.pop()!;
    drawnBallsRef.current.add(ball);
    setDrawnBalls((prev) => [...prev, ball]);
    setCurrentBall(ball);

    if (callbacksRef.current.onBallDrawn(ball, drawnBallsRef.current) === 'stop') {
      stopDrawing();
      return 'stop';
    }

    if (deckRef.current.length > 0) {
      scheduleReveal();
    }

    return 'continue';
  }, [callbacksRef, revealTimer, scheduleReveal, stopDrawing]);

  const startDrawLoop = useCallback(() => {
    // Only a win stops the loop outright; an empty deck ends it on the next tick.
    if (drawNextBall() !== 'stop') {
      drawTimer.schedule(getBallDrawIntervalMs(gameSpeedRef.current));
    }
  }, [drawNextBall, drawTimer]);

  const resetBoard = useCallback(() => {
    deckRef.current = generateDeck();
    drawnBallsRef.current = new Set();
    setDrawnBalls([]);
    setCurrentBall(null);
    setUpcomingBall(null);
  }, []);

  const pause = useCallback(() => {
    if (!callbacksRef.current.isPlaying() || isPausedRef.current) {
      return;
    }

    isPausedRef.current = true;
    setIsPaused(true);
    drawTimer.hold();
    revealTimer.hold();
  }, [callbacksRef, drawTimer, revealTimer]);

  const resume = useCallback(() => {
    if (!callbacksRef.current.isPlaying() || !isPausedRef.current) {
      return;
    }

    isPausedRef.current = false;
    setIsPaused(false);

    const pendingRevealMs = revealTimer.takeRemaining();
    if (pendingRevealMs !== null && deckRef.current.length > 0) {
      scheduleReveal(pendingRevealMs);
    }

    drawTimer.schedule(
      drawTimer.takeRemaining() ?? getBallDrawIntervalMs(gameSpeedRef.current),
    );
  }, [callbacksRef, drawTimer, revealTimer, scheduleReveal]);

  const togglePause = useCallback(() => {
    if (isPausedRef.current) {
      resume();
    } else {
      pause();
    }
  }, [pause, resume]);

  const setGameSpeed = useCallback(
    (speed: GameSpeed) => {
      const oldSpeed = gameSpeedRef.current;
      if (oldSpeed === speed) {
        return;
      }

      gameSpeedRef.current = speed;
      setGameSpeedState(speed);

      // Rescale what is left of the held timers; resuming applies it.
      if (isPausedRef.current && callbacksRef.current.isPlaying()) {
        const ratio = oldSpeed / speed;
        drawTimer.scaleRemaining(ratio);
        revealTimer.scaleRemaining(ratio);
      }
    },
    [callbacksRef, drawTimer, revealTimer],
  );

  return {
    drawnBalls,
    currentBall,
    upcomingBall,
    isPaused,
    gameSpeed,
    drawnBallsRef,
    drawNextBall,
    startDrawLoop,
    stopDrawing,
    resetBoard,
    pause,
    resume,
    togglePause,
    setGameSpeed,
  };
}
