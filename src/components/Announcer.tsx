import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BingoBall from './BingoBall';

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
      <BingoBall value={currentBall || 0} size="large" />
      
      {displayBalls.length > 0 && (
        <View style={styles.recentBallsContainer}>
          <Text style={styles.recentTitle}>Recent Balls</Text>
          <View style={styles.recentBallsRow}>
            {displayBalls.map((ball, index) => (
              <BingoBall key={index} value={ball} size="small" />
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
    gap: 8, // Add spacing between recent balls
  },
});

export default Announcer;