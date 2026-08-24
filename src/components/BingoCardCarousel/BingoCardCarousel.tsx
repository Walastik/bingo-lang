import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ListRenderItem,
} from 'react-native';
import BingoCardView from '@/components/BingoCardView';
import { BingoCard, WinPattern } from '@/game/types';
import { useTheme } from '@/theme/ThemeContext';
import { createStyles } from './BingoCardCarousel.styles';

interface BingoCardCarouselProps {
  cards: BingoCard[];
  /** Real card indices aligned with `cards` (for daub keys). Defaults to 0..n-1. */
  cardIndices?: number[];
  userDaubs: Set<string>;
  winPatterns: WinPattern[];
  previewKey: string;
  onCellPress: (displayIndex: number, flatIndex: number) => void;
  onHeaderPress: (displayIndex: number, col: number) => void;
}

const BingoCardCarousel: React.FC<BingoCardCarouselProps> = ({
  cards,
  cardIndices,
  userDaubs,
  winPatterns,
  previewKey,
  onCellPress,
  onHeaderPress,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const resolvedCardIndices = cardIndices ?? cards.map((_, index) => index);
  const listRef = useRef<FlatList<BingoCard>>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardCount = cards.length;

  useEffect(() => {
    setActiveIndex(0);
    if (pageWidth > 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [cardCount, pageWidth]);

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

  const renderItem: ListRenderItem<BingoCard> = useCallback(
    ({ item, index }) => (
      <View style={[styles.page, { width: pageWidth }]}>
        <BingoCardView
          card={item}
          cardIndex={resolvedCardIndices[index]}
          userDaubs={userDaubs}
          winPatterns={winPatterns}
          previewKey={previewKey}
          onCellPress={(flatIndex) => onCellPress(index, flatIndex)}
          onHeaderPress={(col) => onHeaderPress(index, col)}
        />
      </View>
    ),
    [
      onCellPress,
      onHeaderPress,
      pageWidth,
      previewKey,
      resolvedCardIndices,
      styles.page,
      userDaubs,
      winPatterns,
    ],
  );

  if (cardCount === 0) {
    return null;
  }

  if (cardCount === 1) {
    return (
      <View style={styles.singleCardContainer}>
        <BingoCardView
          card={cards[0]}
          cardIndex={resolvedCardIndices[0]}
          userDaubs={userDaubs}
          winPatterns={winPatterns}
          previewKey={previewKey}
          onCellPress={(flatIndex) => onCellPress(0, flatIndex)}
          onHeaderPress={(col) => onHeaderPress(0, col)}
        />
      </View>
    );
  }

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === cardCount - 1;

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        if (nextWidth !== pageWidth) {
          setPageWidth(nextWidth);
        }
      }}
    >
      {pageWidth > 0 && (
        <FlatList
          ref={listRef}
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          bounces={false}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: pageWidth,
            offset: pageWidth * index,
            index,
          })}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={styles.list}
        />
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.arrowButton, isFirst && styles.arrowButtonDisabled]}
          onPress={() => goToIndex(activeIndex - 1)}
          disabled={isFirst}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Previous card"
        >
          <Text style={[styles.arrowText, isFirst && styles.arrowTextDisabled]}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          Card {activeIndex + 1} of {cardCount}
        </Text>

        <TouchableOpacity
          style={[styles.arrowButton, isLast && styles.arrowButtonDisabled]}
          onPress={() => goToIndex(activeIndex + 1)}
          disabled={isLast}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Next card"
        >
          <Text style={[styles.arrowText, isLast && styles.arrowTextDisabled]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BingoCardCarousel;
