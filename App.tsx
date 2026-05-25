import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useBingoGame from './src/hooks/useBingoGame';
import BingoCardView from './src/components/BingoCardView';
import Announcer from './src/components/Announcer';

export default function App() {
  const [selectedCardCount, setSelectedCardCount] = useState<number>(1);
  
  const {
    gameState,
    userCards,
    currentBall,
    drawnBalls,
    userDaubs,
    startGame,
    daubSpace,
    callBingo,
    resetGame,
  } = useBingoGame({ userCardCount: selectedCardCount });

  // --- RENDER: LOBBY ---
  if (gameState === 'lobby') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.lobbyContent}>
          <Text style={styles.title}>Bingo Lang!</Text>
          <Text style={styles.subtitle}>Select your cards</Text>

          <View style={styles.selectionContainer}>
            {[1, 2, 3, 4].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.selectionButton,
                  selectedCardCount === num && styles.selectionButtonActive,
                ]}
                onPress={() => setSelectedCardCount(num)}
              >
                <Text style={styles.selectionText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- RENDER: PLAYING / WIN ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Use our real Announcer component */}
      <Announcer currentBall={currentBall} recentBalls={drawnBalls} />

      {/* Render the actual user cards using our real BingoCardView */}
      <ScrollView 
        style={styles.cardsContainer} 
        contentContainerStyle={styles.cardsContent}
        showsVerticalScrollIndicator={false}
      >
        {userCards?.map((card, index) => (
          <View key={`card-${index}`} style={styles.cardWrapper}>
            <BingoCardView 
              card={card}
              cardIndex={index}
              userDaubs={userDaubs}
              onCellPress={(flatIndex) => {
                const row = Math.floor(flatIndex / 5);
                const col = flatIndex % 5;
                daubSpace(index, row, col);
              }}
            />
          </View>
        ))}
      </ScrollView>

      {/* Floating Bingo Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.bingoButton}
          onPress={callBingo}
          activeOpacity={0.8}
        >
          <Text style={styles.bingoButtonText}>BINGO!</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay for Win/Loss */}
      {(gameState === 'userWon' || gameState === 'npcWon') && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayTitle}>
              {gameState === 'userWon' ? '🎉 YOU WIN! 🎉' : '😢 NPC Won!'}
            </Text>
            <Text style={styles.overlayMessage}>
              {gameState === 'userWon' 
                ? 'Great job calling bingo!' 
                : 'Better luck next time!'}
            </Text>
            <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
              <Text style={styles.playAgainButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Keeping Qwen's excellent styling!
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  lobbyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  selectionContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 40,
  },
  selectionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionButtonActive: {
    backgroundColor: '#007AFF',
  },
  selectionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#34C759',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardsContainer: {
    flex: 1,
    padding: 10,
  },
  cardsContent: {
    alignItems: 'center',
    paddingBottom: 100, 
  },
  cardWrapper: {
    marginBottom: 20,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bingoButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 50,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  bingoButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  overlayMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    minWidth: 150,
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});