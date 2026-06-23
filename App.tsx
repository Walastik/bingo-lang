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
import WinnerOverlay from './src/components/WinnerOverlay';
import { ROUND_SEQUENCE, buildPreviewPatterns, getRoundConfig } from './src/utils/winPatterns';

export default function App() {
  const [selectedCardCount, setSelectedCardCount] = useState<number>(1);
  const [selectedRounds, setSelectedRounds] = useState<boolean[]>(() =>
    ROUND_SEQUENCE.map(() => true),
  );
  const [showCalledBallsBoard, setShowCalledBallsBoard] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const selectedRoundIndices = useMemo(
    () =>
      selectedRounds
        .map((isSelected, index) => (isSelected ? index : -1))
        .filter(index => index >= 0),
    [selectedRounds],
  );

  const toggleRoundSelection = (index: number) => {
    setSelectedRounds(prev => {
      const selectedCount = prev.filter(Boolean).length;
      if (prev[index] && selectedCount <= 1) {
        return prev;
      }

      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

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
    winResult,
    currentRound,
    currentRoundNumber,
    totalRounds,
    rounds,
  } = useBingoGame({
    userCardCount: selectedCardCount,
    selectedRoundIndices,
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

          <Text style={styles.subtitle}>Round lineup</Text>
          <Text style={styles.roundLineupHint}>Tap a game to include or exclude it.</Text>
          <View style={styles.roundLineup}>
            {ROUND_SEQUENCE.map((roundType, index) => {
              const round = getRoundConfig(roundType);
              const isSelected = selectedRounds[index];

              return (
                <TouchableOpacity
                  key={roundType}
                  style={[styles.roundLineupRow, !isSelected && styles.roundLineupRowOff]}
                  onPress={() => toggleRoundSelection(index)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`${round.label}, ${isSelected ? 'included' : 'excluded'}`}
                >
                  <View
                    style={[
                      styles.roundCheckbox,
                      isSelected && styles.roundCheckboxSelected,
                    ]}
                  >
                    {isSelected && <Text style={styles.roundCheckboxMark}>✓</Text>}
                  </View>
                  <View style={styles.roundLineupText}>
                    <Text
                      style={[
                        styles.roundLineupLabel,
                        !isSelected && styles.roundLineupLabelOff,
                      ]}
                    >
                      {round.label}
                    </Text>
                    <Text
                      style={[
                        styles.roundLineupDescription,
                        !isSelected && styles.roundLineupDescriptionOff,
                      ]}
                    >
                      {round.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.startButton, rounds.length === 0 && styles.startButtonDisabled]}
            onPress={startGame}
            disabled={rounds.length === 0}
          >
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
        <WinnerOverlay
          gameState={gameState}
          winResult={winResult}
          currentRoundNumber={currentRoundNumber}
          totalRounds={totalRounds}
          currentRoundLabel={currentRound.label}
          hasMoreRounds={hasMoreRounds}
          userDaubs={userDaubs}
          drawnBalls={drawnBalls}
          onContinue={continueGame}
          onNextRound={startNextRound}
          onPlayAgain={resetGame}
        />
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
  selectionButtonActive: {
    backgroundColor: '#007AFF',
  },
  selectionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  roundLineupHint: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 360,
  },
  roundLineup: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  roundLineupRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  roundLineupRowOff: {
    opacity: 0.55,
  },
  roundCheckbox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#c5c5c5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    backgroundColor: '#fff',
  },
  roundCheckboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roundCheckboxMark: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 17,
  },
  roundLineupText: {
    flex: 1,
  },
  roundLineupLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  roundLineupLabelOff: {
    color: '#666',
  },
  roundLineupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  roundLineupDescriptionOff: {
    color: '#999',
  },
  startButton: {
    backgroundColor: '#34C759',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  startButtonDisabled: {
    backgroundColor: '#a8ddb4',
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
});
