import React from 'react';
import { Animated, View } from 'react-native';
import BingoBall from '@/components/BingoBall';
import { AnnouncerStyles } from './Announcer.styles';
import { IS_ANDROID, MAX_RECENT_BALLS, SHRINK_PHASE_END, SLOT_WIDTH } from './announcerLayout';

interface RecentBallsRowProps {
  balls: number[];
  /** Non-null only while a full row is shifting to make space. */
  shiftProgress: Animated.Value | null;
  isShifting: boolean;
  styles: AnnouncerStyles;
}

const RecentBallsRow = ({
  balls,
  shiftProgress,
  isShifting,
  styles,
}: RecentBallsRowProps) => {
  if (balls.length === 0) {
    return <View style={styles.recentPlaceholder} />;
  }

  const shiftX =
    shiftProgress?.interpolate({
      inputRange: [0, SHRINK_PHASE_END, 1],
      outputRange: [0, 0, SLOT_WIDTH],
    }) ?? 0;

  const rightmostFade =
    shiftProgress?.interpolate({
      inputRange: [0, SHRINK_PHASE_END, 1],
      outputRange: [1, 1, 0],
    }) ?? 1;

  return (
    <>
      {balls.map((ball, index) => {
        const isRightmost = index === balls.length - 1;
        const shouldShift = isShifting && balls.length >= MAX_RECENT_BALLS;

        return (
          <View key={`recent-${ball}-${index}`} style={styles.recentSlot}>
            <Animated.View
              style={
                shouldShift
                  ? {
                      transform: [{ translateX: shiftX }],
                      opacity: isRightmost ? rightmostFade : 1,
                    }
                  : undefined
              }
            >
              <BingoBall value={ball} size="small" flat={IS_ANDROID} />
            </Animated.View>
          </View>
        );
      })}
    </>
  );
};

export default RecentBallsRow;
