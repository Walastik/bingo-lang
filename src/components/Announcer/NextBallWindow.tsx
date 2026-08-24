import React from 'react';
import { Animated, Text, View } from 'react-native';
import BingoBall from '@/components/BingoBall';
import { AnnouncerStyles } from './Announcer.styles';
import { IS_ANDROID } from './announcerLayout';

interface NextBallWindowProps {
  upcomingBall: number | null;
  /** The ball that just left the window, fading out as it becomes current. */
  calledBall: number | null;
  calledOpacity: Animated.Value;
  styles: AnnouncerStyles;
}

const NextBallWindow = ({
  upcomingBall,
  calledBall,
  calledOpacity,
  styles,
}: NextBallWindowProps) => (
  <>
    <Text style={styles.label}>Next Ball</Text>
    <View style={styles.windowBox}>
      {upcomingBall !== null && (
        <BingoBall value={upcomingBall} size="small" flat={IS_ANDROID} />
      )}
      {upcomingBall === null && calledBall !== null && (
        <Animated.View style={{ opacity: calledOpacity }}>
          <BingoBall value={calledBall} size="small" flat={IS_ANDROID} />
        </Animated.View>
      )}
    </View>
  </>
);

export default NextBallWindow;
