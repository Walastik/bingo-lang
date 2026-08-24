import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BingoCardCarouselStyles } from './BingoCardCarousel.styles';

interface CarouselControlsProps {
  activeIndex: number;
  cardCount: number;
  onGoToIndex: (index: number) => void;
  styles: BingoCardCarouselStyles;
}

const CarouselControls = ({
  activeIndex,
  cardCount,
  onGoToIndex,
  styles,
}: CarouselControlsProps) => {
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === cardCount - 1;

  return (
    <View style={styles.controls}>
      <TouchableOpacity
        style={[styles.arrowButton, isFirst && styles.arrowButtonDisabled]}
        onPress={() => onGoToIndex(activeIndex - 1)}
        disabled={isFirst}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Previous card"
      >
        <Text style={[styles.arrowText, isFirst && styles.arrowTextDisabled]}>‹</Text>
      </TouchableOpacity>

      <Text style={styles.pageIndicator}>
        Card {activeIndex + 1} of {cardCount}
      </Text>

      <TouchableOpacity
        style={[styles.arrowButton, isLast && styles.arrowButtonDisabled]}
        onPress={() => onGoToIndex(activeIndex + 1)}
        disabled={isLast}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Next card"
      >
        <Text style={[styles.arrowText, isLast && styles.arrowTextDisabled]}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CarouselControls;
