import React, { useCallback, useMemo } from 'react';
import { View, FlatList, ListRenderItem } from 'react-native';
import BingoCardView from '@/components/BingoCardView';
import { BingoCard, WinPattern } from '@/game/types';
import { useTheme } from '@/theme/ThemeContext';
import { createStyles } from './BingoCardCarousel.styles';
import CarouselControls from './CarouselControls';
import { useCarouselPaging } from './useCarouselPaging';

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
  const cardCount = cards.length;

  const {
    listRef,
    pageWidth,
    activeIndex,
    onLayout,
    goToIndex,
    handleMomentumScrollEnd,
  } = useCarouselPaging(cardCount);

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

  // A lone card needs no paging, and the FlatList would add a scroll view for nothing.
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

  return (
    <View style={styles.container} onLayout={onLayout}>
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

      <CarouselControls
        activeIndex={activeIndex}
        cardCount={cardCount}
        onGoToIndex={goToIndex}
        styles={styles}
      />
    </View>
  );
};

export default BingoCardCarousel;
