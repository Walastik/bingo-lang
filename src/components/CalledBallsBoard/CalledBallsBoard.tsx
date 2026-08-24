import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TOTAL_BALLS } from '@/game/constants';
import { useTheme } from '@/theme/ThemeContext';
import BallGrid from './BallGrid';
import { createStyles } from './CalledBallsBoard.styles';

interface CalledBallsBoardProps {
  calledBalls: number[];
  visible?: boolean;
  onClose?: () => void;
  /** Caller-only mode shows the board as the main screen instead of a sheet. */
  inline?: boolean;
}

const CalledBallsBoard = ({
  calledBalls,
  visible = false,
  onClose,
  inline = false,
}: CalledBallsBoardProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const calledSet = useMemo(() => new Set(calledBalls), [calledBalls]);

  const board = (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Called Balls</Text>
          <Text style={styles.subtitle}>
            {calledBalls.length} of {TOTAL_BALLS} called
          </Text>
        </View>
        {onClose && (
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close called balls board"
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BallGrid calledSet={calledSet} styles={styles} />
      </ScrollView>
    </>
  );

  if (inline) {
    return <View style={styles.container}>{board}</View>;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {board}
      </SafeAreaView>
    </Modal>
  );
};

export default CalledBallsBoard;
