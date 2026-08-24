import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLatestRef } from './useLatestRef';

export interface PausableTimeout {
  schedule: (delayMs: number) => void;
  clear: () => void;
  /**
   * Stores how long was left and clears the timer, so a later `takeRemaining`
   * can resume from that point. Returns whether it was running.
   */
  hold: () => boolean;
  /** Consumes the held remainder, or null if nothing is held. */
  takeRemaining: () => number | null;
  /** Rescales the held remainder, for a speed change made while paused. */
  scaleRemaining: (ratio: number) => void;
  discardRemaining: () => void;
}

/**
 * A timeout that can be paused without losing its place.
 *
 * `onFire` is read through a ref, so a rescheduling callback can close over
 * this timer without the timer having to be rebuilt.
 */
export function usePausableTimeout(onFire: () => void): PausableTimeout {
  const timerRef = useRef<number | null>(null);
  const fireAtRef = useRef<number | null>(null);
  const remainingRef = useRef<number | null>(null);
  const onFireRef = useLatestRef(onFire);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    fireAtRef.current = null;
  }, []);

  const schedule = useCallback(
    (delayMs: number) => {
      clear();
      fireAtRef.current = Date.now() + delayMs;

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        fireAtRef.current = null;
        onFireRef.current();
      }, delayMs);
    },
    [clear, onFireRef],
  );

  const hold = useCallback(() => {
    if (timerRef.current && fireAtRef.current !== null) {
      remainingRef.current = Math.max(0, fireAtRef.current - Date.now());
      clear();
      return true;
    }

    remainingRef.current = null;
    return false;
  }, [clear]);

  const takeRemaining = useCallback(() => {
    const remaining = remainingRef.current;
    remainingRef.current = null;
    return remaining;
  }, []);

  const scaleRemaining = useCallback((ratio: number) => {
    if (remainingRef.current !== null) {
      remainingRef.current *= ratio;
    }
  }, []);

  const discardRemaining = useCallback(() => {
    remainingRef.current = null;
  }, []);

  useEffect(() => clear, [clear]);

  return useMemo(
    () => ({ schedule, clear, hold, takeRemaining, scaleRemaining, discardRemaining }),
    [clear, discardRemaining, hold, schedule, scaleRemaining, takeRemaining],
  );
}
