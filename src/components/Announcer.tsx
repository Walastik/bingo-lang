import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getBallString } from '../utils/bingoUtils';

interface AnnouncerProps {
  currentBall: number | null;
  recentBalls: number[]; // Optional array of numbers
}

const Announcer = ({ currentBall, recentBalls }: AnnouncerProps) => {
  // Filter out the current ball so it doesn't show in the recent list simultaneously
  const previousBalls = recentBalls.filter(ball => ball !== currentBall);
  
  // Grab the last 3 balls from the array, reversed so the newest is on the left
  const displayBalls = previousBalls.slice(-3).reverse();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CURRENT BALL</Text>
      <View style={styles.currentBallContainer}>
        <Text style={styles.currentBallText}>
          {currentBall ? getBallString(currentBall) : '--'}
        </Text>
      </View>
      
      {displayBalls.length > 0 && (
        <View style={styles.recentBallsContainer}>
          <Text style={styles.recentTitle}>Recent Balls</Text>
          <View style={styles.recentBallsRow}>
            {displayBalls.slice(-3).map((ball, index) => (
              <Text key={index} style={styles.recentBallText}>
                {ball}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  currentBallContainer: {
    backgroundColor: '#fff',
    borderRadius: 50,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  currentBallText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  recentBallsContainer: {
    marginTop: 15,
  },
  recentTitle: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  recentBallsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  recentBallText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 8,
    padding: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
});

export default Announcer;