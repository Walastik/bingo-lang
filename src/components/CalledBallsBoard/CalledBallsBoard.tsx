import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBallColor } from '@/game/ballFormat';
import { BALLS_PER_COLUMN, COLUMN_LETTERS, TOTAL_BALLS } from '@/game/constants';
import { useTheme } from '@/theme/ThemeContext';
import { createStyles } from './CalledBallsBoard.styles';

const COLUMN_STARTS = COLUMN_LETTERS.map(
  (_, index) => index * BALLS_PER_COLUMN + 1,
);

interface CalledBallsBoardProps {
  calledBalls: number[];
  visible?: boolean;
  onClose?: () => void;
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
  const calledCount = calledBalls.length;

  const board = (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Called Balls</Text>
          <Text style={styles.subtitle}>
            {calledCount} of {TOTAL_BALLS} called
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
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {COLUMN_LETTERS.map((letter) => (
              <View key={letter} style={styles.headerCell}>
                <Text style={[styles.headerLetter, { color: getBallColor(letter) }]}>
                  {letter}
                </Text>
              </View>
            ))}
          </View>

          {Array.from({ length: BALLS_PER_COLUMN }, (_, rowIndex) => (
            <View key={rowIndex} style={styles.dataRow}>
              {COLUMN_STARTS.map((start, colIndex) => {
                const ball = start + rowIndex;
                const isCalled = calledSet.has(ball);

                return (
                  <View
                    key={`${COLUMN_LETTERS[colIndex]}-${ball}`}
                    style={[
                      styles.ballCell,
                      isCalled
                        ? { backgroundColor: getBallColor(ball) }
                        : styles.ballCellUncalled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ballNumber,
                        isCalled ? styles.ballNumberCalled : styles.ballNumberUncalled,
                      ]}
                    >
                      {ball}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
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
