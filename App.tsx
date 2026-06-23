import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useBingoGame, { GameSpeed } from './src/hooks/useBingoGame';
import BingoCardCarousel from './src/components/BingoCardCarousel';
import Announcer from './src/components/Announcer';
import CalledBallsBoard from './src/components/CalledBallsBoard';
import GameSettingsModal from './src/components/GameSettingsModal';

export default function App() {
  const [selectedCardCount, setSelectedCardCount] = useState<number>(1);
  const [showCalledBallsBoard, setShowCalledBallsBoard] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  
  const {
    gameState,
    userCards,
    currentBall,
    upcomingBall,
    drawnBalls,
    userDaubs,
    startGame,
    daubSpace,
    autoDaubColumn,
    callBingo,
    continueGame,
    resetGame,
    isPaused,
    pauseGame,
    resumeGame,
    togglePause,
    isAutoMode,
    toggleAutoMode,
    gameSpeed,
    setGameSpeed,
    cardOrder,
  } = useBingoGame({ userCardCount: selectedCardCount });

  const handleOpenSettings = () => {
    pauseGame();
    setShowSettingsMenu(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsMenu(false);
    resumeGame();
  };

  const handleQuitGame = () => {
    Alert.alert(
      'Are you sure?',
      'This will end the current game and return to the lobby.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            setShowSettingsMenu(false);
            resetGame();
          },
        },
      ],
    );
  };

  const handleSelectSpeed = (speed: GameSpeed) => {
    setGameSpeed(speed);
  };

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

      {gameState === 'playing' && (
        <View style={styles.gameHeader}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleOpenSettings}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Open game settings"
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      )}

      <GameSettingsModal
        visible={showSettingsMenu}
        gameSpeed={gameSpeed}
        onSelectSpeed={handleSelectSpeed}
        onQuit={handleQuitGame}
        onClose={handleCloseSettings}
      />
      
      {/* Use our real Announcer component */}
      <Announcer
        currentBall={currentBall}
        upcomingBall={upcomingBall}
        recentBalls={drawnBalls}
        isPaused={isPaused}
        showPauseControl={gameState === 'playing'}
        onTogglePause={togglePause}
        isAutoMode={isAutoMode}
        showAutoControl={gameState === 'playing'}
        onToggleAutoMode={toggleAutoMode}
        onRecentPress={() => setShowCalledBallsBoard(true)}
      />

      <CalledBallsBoard
        calledBalls={drawnBalls}
        visible={showCalledBallsBoard}
        onClose={() => setShowCalledBallsBoard(false)}
      />

      <View style={styles.cardsContainer}>
        {userCards && userCards.length > 0 && (
          <BingoCardCarousel
            cards={cardOrder.map(index => userCards[index])}
            cardIndices={cardOrder}
            userDaubs={userDaubs}
            onCellPress={(displayIndex, flatIndex) => {
              const cardIndex = cardOrder[displayIndex];
              const row = Math.floor(flatIndex / 5);
              const col = flatIndex % 5;
              daubSpace(cardIndex, row, col);
            }}
            onHeaderPress={(displayIndex, col) => {
              autoDaubColumn(cardOrder[displayIndex], col);
            }}
          />
        )}
      </View>

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

      {/* Overlay for Win/Loss/Invalid Bingo */}
      {(gameState === 'userWon' || gameState === 'npcWon' || gameState === 'invalidBingo') && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayTitle}>
              {gameState === 'userWon' ? '🎉 YOU WIN! 🎉' : 
                gameState === 'npcWon' ? '😢 NPC Won!' : '❌ Invalid Bingo!'}
            </Text>
            <Text style={styles.overlayMessage}>
              {gameState === 'userWon' 
                ? 'Great job calling bingo!' 
                : gameState === 'npcWon' 
                  ? 'Better luck next time!' 
                  : 'You don\'t have a bingo! Review your daubs.'}
            </Text>
            {gameState === 'invalidBingo' ? (
              <TouchableOpacity style={styles.continueButton} onPress={continueGame}>
                <Text style={styles.continueButtonText}>Continue Game</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
                <Text style={styles.playAgainButtonText}>Play Again</Text>
              </TouchableOpacity>
            )}
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
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsIcon: {
    fontSize: 24,
    color: '#333',
    lineHeight: 28,
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
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 100,
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
  continueButton: {
  backgroundColor: '#FF9500',
  paddingVertical: 15,
  paddingHorizontal: 30,
  borderRadius: 12,
  minWidth: 150,
  marginBottom: 15,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});