import { useEffect, useMemo, useRef, useState } from 'react';
import { cellKey } from '@/game/constants';
import { WinPattern } from '@/game/types';

const PREVIEW_CYCLE_MS = 750;

/**
 * Cycles through the round's win patterns while the preview is on.
 *
 * `previewKey` identifies the round, so cycling restarts when the round
 * changes but not when the pattern array is merely rebuilt.
 */
export function useWinPreview(winPatterns: WinPattern[], previewKey: string) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const winPatternsRef = useRef(winPatterns);
  winPatternsRef.current = winPatterns;

  useEffect(() => {
    setActiveIndex(0);
  }, [previewKey]);

  useEffect(() => {
    if (winPatterns.length === 0) {
      return;
    }

    setActiveIndex((prev) => prev % winPatterns.length);
  }, [previewKey, winPatterns.length]);

  useEffect(() => {
    if (!isEnabled || winPatterns.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % winPatternsRef.current.length);
    }, PREVIEW_CYCLE_MS);

    return () => {
      clearInterval(interval);
    };
  }, [isEnabled, previewKey, winPatterns.length]);

  // Guards the render against an index left over from a longer pattern list.
  const safeIndex = winPatterns.length === 0 ? 0 : activeIndex % winPatterns.length;
  const activePattern = winPatterns[safeIndex];

  const previewCells = useMemo(() => {
    if (!isEnabled || !activePattern) {
      return new Set<string>();
    }

    return new Set(activePattern.cells.map(({ row, col }) => cellKey(row, col)));
  }, [isEnabled, activePattern]);

  const toggle = () => {
    setIsEnabled((prev) => {
      const next = !prev;
      if (next) {
        setActiveIndex(0);
      }
      return next;
    });
  };

  return { isEnabled, activePattern, previewCells, toggle };
}
