import React from 'react';
import { Text, View } from 'react-native';
import { getBallColor } from '@/game/ballFormat';
import { BALLS_PER_COLUMN, COLUMN_LETTERS } from '@/game/constants';
import { CalledBallsBoardStyles } from './CalledBallsBoard.styles';

/** First ball in each column: B starts at 1, I at 16, and so on. */
const COLUMN_STARTS = COLUMN_LETTERS.map(
  (_, index) => index * BALLS_PER_COLUMN + 1,
);

interface BallGridProps {
  calledSet: Set<number>;
  styles: CalledBallsBoardStyles;
}

/** All 75 balls laid out in five columns, called ones filled with their color. */
const BallGrid = ({ calledSet, styles }: BallGridProps) => (
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
);

export default BallGrid;
