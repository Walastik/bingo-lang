import React from 'react';
import { Animated, Text, View } from 'react-native';
import BingoBall from '@/components/BingoBall';
import { AnnouncerStyles } from './Announcer.styles';
import { IS_ANDROID } from './announcerLayout';

interface CurrentBallStageProps {
  currentBall: number | null;
  isTransitioning: boolean;
  currentOpacity: Animated.Value;
  /** The outgoing ball, mid-flight toward the recents row. */
  slideValue: number | null;
  slideScale: Animated.AnimatedInterpolation<number>;
  slideTranslateX: Animated.AnimatedInterpolation<number>;
  styles: AnnouncerStyles;
}

const CurrentBallStage = ({
  currentBall,
  isTransitioning,
  currentOpacity,
  slideValue,
  slideScale,
  slideTranslateX,
  styles,
}: CurrentBallStageProps) => (
  <View style={styles.centerColumn}>
    <Text style={styles.label}>Current Ball</Text>
    <View
      style={styles.currentSlot}
      collapsable={false}
      renderToHardwareTextureAndroid={IS_ANDROID}
    >
      {!isTransitioning && currentBall !== null && (
        <Animated.View style={{ opacity: currentOpacity }}>
          <BingoBall value={currentBall} size="large" flat={IS_ANDROID} />
        </Animated.View>
      )}

      {slideValue !== null && (
        <Animated.View
          pointerEvents="none"
          collapsable={false}
          renderToHardwareTextureAndroid={IS_ANDROID}
          style={[
            styles.slideClip,
            {
              transform: [{ scale: slideScale }, { translateX: slideTranslateX }],
            },
          ]}
        >
          <BingoBall value={slideValue} size="large" flat />
        </Animated.View>
      )}
    </View>
  </View>
);

export default CurrentBallStage;
