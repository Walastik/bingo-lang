import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ListRenderItem,
} from 'react-native';
import { BingoCard } from '../utils/bingoUtils';
import BingoCardView from './BingoCardView';

interface BingoCardCarouselProps {
  cards: BingoCard[];
  userDaubs: Set<string>;
  onCellPress: (cardIndex: number, flatIndex: number) => void;
  onHeaderPress: (cardIndex: number, col: number) => void;
}

const BingoCardCarousel: React.FC<BingoCardCarouselProps> = ({
  cards,
  userDaubs,
  onCellPress,
  onHeaderPress,
}) => {
  const listRef = useRef<FlatList<BingoCard>>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardCount = cards.length;
  const showCarouselControls = cardCount > 1;

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
          cardIndex={index}
          userDaubs={userDaubs}
          onCellPress={(flatIndex) => onCellPress(index, flatIndex)}
          onHeaderPress={(col) => onHeaderPress(index, col)}
        />
      </View>
    ),
    [onCellPress, onHeaderPress, pageWidth, userDaubs],
  );

  if (cardCount === 0) {
    return null;
  }

  if (cardCount === 1) {
    return (
      <View style={styles.singleCardContainer}>
        <BingoCardView
          card={cards[0]}
          cardIndex={0}
          userDaubs={userDaubs}
          onCellPress={(flatIndex) => onCellPress(0, flatIndex)}
          onHeaderPress={(col) => onHeaderPress(0, col)}
        />
      </View>
    );
  }

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
          keyExtractor={(_, index) => `card-${index}`}
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
          style={[styles.arrowButton, activeIndex === 0 && styles.arrowButtonDisabled]}
          onPress={() => goToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Previous card"
        >
          <Text style={[styles.arrowText, activeIndex === 0 && styles.arrowTextDisabled]}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          Card {activeIndex + 1} of {cardCount}
        </Text>

        <TouchableOpacity
          style={[
            styles.arrowButton,
            activeIndex === cardCount - 1 && styles.arrowButtonDisabled,
          ]}
          onPress={() => goToIndex(activeIndex + 1)}
          disabled={activeIndex === cardCount - 1}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Next card"
        >
          <Text
            style={[
              styles.arrowText,
              activeIndex === cardCount - 1 && styles.arrowTextDisabled,
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  singleCardContainer: {
    flex: 1,
    width: '100%',
  },
  list: {
    flex: 1,
  },
  page: {
    width: '100%',
    paddingBottom: 6,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
    paddingTop: 4,
    paddingBottom: 4,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  arrowButtonDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e8e8e8',
    shadowOpacity: 0,
    elevation: 0,
  },
  arrowText: {
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: -1,
  },
  arrowTextDisabled: {
    color: '#bbb',
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    minWidth: 100,
    textAlign: 'center',
  },
});

export default BingoCardCarousel;
