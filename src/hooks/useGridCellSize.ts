import { useCallback, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { getCellSize } from '@/components/cardGridLayout';

/**
 * Measures a card grid and derives its square cell size. `cellSize` is 0 until
 * the first layout pass, which callers use to skip rendering cells.
 */
export function useGridCellSize() {
  const [width, setWidth] = useState(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setWidth((prev) => (prev === nextWidth ? prev : nextWidth));
  }, []);

  return { cellSize: getCellSize(width), onLayout };
}
