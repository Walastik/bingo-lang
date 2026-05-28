import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBallColor } from '../utils/bingoUtils';

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O'] as const;
const COLUMN_STARTS = [1, 16, 31, 46, 61];

interface CalledBallsBoardProps {
  calledBalls: number[];
  visible: boolean;
  onClose: () => void;
}

const CalledBallsBoard = ({ calledBalls, visible, onClose }: CalledBallsBoardProps) => {
  const calledSet = useMemo(() => new Set(calledBalls), [calledBalls]);
  const calledCount = calledBalls.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Called Balls</Text>
            <Text style={styles.subtitle}>
              {calledCount} of 75 called
            </Text>
          </View>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close called balls board"
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.table}>
            <View style={styles.headerRow}>
              {BINGO_LETTERS.map((letter) => (
                <View key={letter} style={styles.headerCell}>
                  <Text style={[styles.headerLetter, { color: getBallColor(letter) }]}>
                    {letter}
                  </Text>
                </View>
              ))}
            </View>

            {Array.from({ length: 15 }, (_, rowIndex) => (
              <View key={rowIndex} style={styles.dataRow}>
                {COLUMN_STARTS.map((start, colIndex) => {
                  const ball = start + rowIndex;
                  const isCalled = calledSet.has(ball);

                  return (
                    <View
                      key={`${BINGO_LETTERS[colIndex]}-${ball}`}
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
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  headerLetter: {
    fontSize: 26,
    fontWeight: '800',
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ballCell: {
    flex: 1,
    marginHorizontal: 2,
    aspectRatio: 1,
    maxHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballCellUncalled: {
    backgroundColor: '#ECECEC',
  },
  ballNumber: {
    fontSize: 15,
    fontWeight: '700',
  },
  ballNumberCalled: {
    color: '#fff',
  },
  ballNumberUncalled: {
    color: '#A8A8A8',
  },
});

export default CalledBallsBoard;
