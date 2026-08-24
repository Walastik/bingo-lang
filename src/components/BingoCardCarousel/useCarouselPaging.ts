import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { BingoCard } from '@/game/types';

/**
 * Tracks which card is on screen. `pageWidth` comes from layout, so the list is
 * not rendered until it is known; paging offsets depend on it.
 */
export function useCarouselPaging(cardCount: number) {
  const listRef = useRef<FlatList<BingoCard>>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // A new round hands over a different set of cards; start from the first.
  useEffect(() => {
    setActiveIndex(0);
    if (pageWidth > 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [cardCount, pageWidth]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setPageWidth((prev) => (prev === nextWidth ? prev : nextWidth));
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      if (pageWidth <= 0) {
        return;
      }
      const clamped = Math.max(0, Math.min(index, cardCount - 1));
      listRef.current?.scrollToOffset({
        offset: clamped * pageWidth,
        animated: true,
      });
      setActiveIndex(clamped);
    },
    [cardCount, pageWidth],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth <= 0) {
        return;
      }
      const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      setActiveIndex(Math.max(0, Math.min(index, cardCount - 1)));
    },
    [cardCount, pageWidth],
  );

  return {
    listRef,
    pageWidth,
    activeIndex,
    onLayout,
    goToIndex,
    handleMomentumScrollEnd,
  };
}
