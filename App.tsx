import React, { useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useBingoGame, { GameSpeed } from './src/hooks/useBingoGame';
import BingoCardCarousel from './src/components/BingoCardCarousel';
import Announcer from './src/components/Announcer';
import CalledBallsBoard from './src/components/CalledBallsBoard';
import GameSettingsModal from './src/components/GameSettingsModal';
import { MAX_ROUNDS, buildPreviewPatterns } from './src/utils/winPatterns';

export default function App() {
  const [selectedCardCount, setSelectedCardCount] = useState<number>(1);
  const [selectedRoundCount, setSelectedRoundCount] = useState<number>(6);
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
    startNextRound,
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
    currentRound,
    currentRoundNumber,
    totalRounds,
    rounds,
  } = useBingoGame({
    userCardCount: selectedCardCount,
    roundCount: selectedRoundCount,
  });

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

  const showOverlay =
    gameState === 'roundWon' ||
    gameState === 'gameWon' ||
    gameState === 'npcWon' ||
    gameState === 'invalidBingo';

  const hasMoreRounds = currentRoundNumber < totalRounds;
  const previewPatterns = useMemo(
    () => buildPreviewPatterns(currentRound),
    [currentRound.type],
  );

  // --- RENDER: LOBBY ---
  if (gameState === 'lobby') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={styles.lobbyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Bingo Lang!</Text>

          <Text style={styles.subtitle}>Cards</Text>
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

          <Text style={styles.subtitle}>Rounds</Text>
          <View style={styles.selectionContainer}>
            {Array.from({ length: MAX_ROUNDS }, (_, i) => i + 1).map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.selectionButton,
                  styles.roundButton,
                  selectedRoundCount === num && styles.selectionButtonActive,
                ]}
                onPress={() => setSelectedRoundCount(num)}
              >
                <Text style={styles.selectionText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.roundPreview}>
            <Text style={styles.roundPreviewTitle}>Round lineup</Text>
            {rounds.map((round, index) => (
              <Text key={round.type} style={styles.roundPreviewItem}>
                {index + 1}. {round.label}
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- RENDER: PLAYING / WIN ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {gameState === 'playing' && (
        <View style={styles.gameHeader}>
          <View style={styles.roundInfo}>
            <Text style={styles.roundInfoLabel}>
              Round {currentRoundNumber}/{totalRounds}
            </Text>
            <Text style={styles.roundInfoName}>{currentRound.label}</Text>
          </View>
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
            winPatterns={previewPatterns}
            previewKey={currentRound.type}
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

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.bingoButton}
          onPress={callBingo}
          activeOpacity={0.8}
        >
          <Text style={styles.bingoButtonText}>BINGO!</Text>
        </TouchableOpacity>
      </View>

      {showOverlay && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayTitle}>
              {gameState === 'roundWon' && `🎉 Round ${currentRoundNumber} Complete! 🎉`}
              {gameState === 'gameWon' && '🏆 YOU WIN THE GAME! 🏆'}
              {gameState === 'npcWon' && '😢 NPC Won!'}
              {gameState === 'invalidBingo' && '❌ Invalid Bingo!'}
            </Text>
            <Text style={styles.overlayMessage}>
              {gameState === 'roundWon' &&
                `You won ${currentRound.label}. ${totalRounds - currentRoundNumber} round${totalRounds - currentRoundNumber === 1 ? '' : 's'} remaining.`}
              {gameState === 'gameWon' &&
                `You completed all ${totalRounds} rounds. Great job!`}
              {gameState === 'npcWon' && hasMoreRounds &&
                `An NPC won round ${currentRoundNumber} (${currentRound.label}). Try again in the next round!`}
              {gameState === 'npcWon' && !hasMoreRounds &&
                `An NPC won the final round (${currentRound.label}). Better luck next time!`}
              {gameState === 'invalidBingo' &&
                `You don't have a valid ${currentRound.label} yet. Review your daubs.`}
            </Text>
            {gameState === 'invalidBingo' ? (
              <TouchableOpacity style={styles.continueButton} onPress={continueGame}>
                <Text style={styles.continueButtonText}>Continue Game</Text>
              </TouchableOpacity>
            ) : (gameState === 'roundWon' || (gameState === 'npcWon' && hasMoreRounds)) ? (
              <TouchableOpacity style={styles.playAgainButton} onPress={startNextRound}>
                <Text style={styles.playAgainButtonText}>Next Round</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  roundInfo: {
    flex: 1,
    paddingRight: 8,
  },
  roundInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  roundInfoName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginTop: 2,
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
  lobbyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 14,
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 360,
  },
  selectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 360,
  },
  selectionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  selectionButtonActive: {
    backgroundColor: '#007AFF',
  },
  selectionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  roundPreview: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  roundPreviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  roundPreviewItem: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
    lineHeight: 22,
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
