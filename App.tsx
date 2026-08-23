import React, { useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useBingoGame from '@/hooks/useBingoGame';
import BingoCardCarousel from '@/components/BingoCardCarousel';
import Announcer from '@/components/Announcer';
import CalledBallsBoard from '@/components/CalledBallsBoard';
import DeclareWinnerModal from '@/components/DeclareWinnerModal';
import GameSettingsModal from '@/components/GameSettingsModal';
import WinnerOverlay from '@/components/WinnerOverlay';
import { buildPreviewPatterns } from '@/game/patterns/previewPatterns';
import { ROUND_SEQUENCE, getRoundConfig } from '@/game/patterns/roundConfigs';
import { GameSpeed } from '@/game/speed';
import { useTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    roundInfoName: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginTop: 2,
    },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    },
    settingsIcon: {
      fontSize: 24,
      color: colors.text,
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
      color: colors.text,
      marginBottom: 24,
    },
    subtitle: {
      fontSize: 18,
      color: colors.textSecondary,
      marginBottom: 14,
      alignSelf: 'flex-start',
      width: '100%',
      maxWidth: 360,
    },
    modeContainer: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
      maxWidth: 360,
      marginBottom: 28,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
    },
    modeButtonActive: {
      backgroundColor: '#007AFF',
    },
    modeButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    modeButtonTextActive: {
      color: '#fff',
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
      backgroundColor: colors.surfaceMuted,
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
      color: colors.textMuted,
      marginBottom: 12,
      alignSelf: 'flex-start',
      width: '100%',
      maxWidth: 360,
    },
    roundLineup: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 8,
      marginBottom: 28,
      shadowColor: colors.shadow,
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
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
      backgroundColor: colors.surface,
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
      color: colors.text,
      marginBottom: 4,
    },
    roundLineupLabelOff: {
      color: colors.textSecondary,
    },
    roundLineupDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    roundLineupDescriptionOff: {
      color: colors.textMuted,
    },
    appearanceSection: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 28,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    appearanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    appearanceLabel: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    appearanceHint: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
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
    callerBoardContainer: {
      paddingBottom: 10,
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
}

export default function App() {
  const { colors, isDarkMode, setDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selectedCardCount, setSelectedCardCount] = useState<number>(1);
  const [isCallerOnly, setIsCallerOnly] = useState(false);
  const [selectedRounds, setSelectedRounds] = useState<boolean[]>(() =>
    ROUND_SEQUENCE.map(() => true),
  );
  const [showCalledBallsBoard, setShowCalledBallsBoard] = useState(false);
  const [showDeclareWinnerModal, setShowDeclareWinnerModal] = useState(false);
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
    callNextBall,
    declareWinner,
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
    isCallerOnly,
  });

  const handleOpenSettings = () => {
    if (!isCallerOnly) {
      pauseGame();
    }
    setShowSettingsMenu(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsMenu(false);
    if (!isCallerOnly) {
      resumeGame();
    }
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

  const handleConfirmWinner = () => {
    setShowDeclareWinnerModal(false);
    declareWinner();
  };

  const showOverlay =
    !isCallerOnly &&
    (gameState === 'roundWon' ||
      gameState === 'gameWon' ||
      gameState === 'npcWon' ||
      gameState === 'invalidBingo');

  const hasMoreRounds = currentRoundNumber < totalRounds;
  const previewPatterns = useMemo(
    () => buildPreviewPatterns(currentRound),
    [currentRound.type],
  );

  // --- RENDER: LOBBY ---
  if (gameState === 'lobby') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={colors.statusBarStyle} />
        <ScrollView
          contentContainerStyle={styles.lobbyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Bingo Lang!</Text>

          <Text style={styles.subtitle}>Mode</Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeButton, !isCallerOnly && styles.modeButtonActive]}
              onPress={() => setIsCallerOnly(false)}
              accessibilityRole="button"
              accessibilityState={{ selected: !isCallerOnly }}
            >
              <Text
                style={[styles.modeButtonText, !isCallerOnly && styles.modeButtonTextActive]}
              >
                Play Bingo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, isCallerOnly && styles.modeButtonActive]}
              onPress={() => setIsCallerOnly(true)}
              accessibilityRole="button"
              accessibilityState={{ selected: isCallerOnly }}
            >
              <Text
                style={[styles.modeButtonText, isCallerOnly && styles.modeButtonTextActive]}
              >
                Caller Only
              </Text>
            </TouchableOpacity>
          </View>

          {!isCallerOnly && (
            <>
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
            </>
          )}

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

          <Text style={styles.subtitle}>Appearance</Text>
          <View style={styles.appearanceSection}>
            <View style={styles.appearanceRow}>
              <View>
                <Text style={styles.appearanceLabel}>Dark Mode</Text>
                <Text style={styles.appearanceHint}>
                  {isDarkMode ? 'On' : 'Off'}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: colors.surfaceMuted, true: '#007AFF' }}
                thumbColor="#ffffff"
                accessibilityLabel="Toggle dark mode"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.startButton, rounds.length === 0 && styles.startButtonDisabled]}
            onPress={startGame}
            disabled={rounds.length === 0}
          >
            <Text style={styles.startButtonText}>
              {isCallerOnly ? 'Start Calling' : 'Start Game'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- RENDER: PLAYING / WIN ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colors.statusBarStyle} />

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

      <DeclareWinnerModal
        visible={showDeclareWinnerModal}
        onConfirm={handleConfirmWinner}
        onCancel={() => setShowDeclareWinnerModal(false)}
      />

      <Announcer
        currentBall={currentBall}
        upcomingBall={upcomingBall}
        recentBalls={drawnBalls}
        isPaused={isPaused}
        showPauseControl={gameState === 'playing' && !isCallerOnly}
        onTogglePause={togglePause}
        showNextControl={gameState === 'playing' && isCallerOnly}
        canCallNextBall={drawnBalls.length < 75}
        onNextBall={callNextBall}
        isAutoMode={isAutoMode}
        showAutoControl={gameState === 'playing' && !isCallerOnly}
        onToggleAutoMode={toggleAutoMode}
        showDeclareWinnerControl={gameState === 'playing' && isCallerOnly}
        onDeclareWinner={() => setShowDeclareWinnerModal(true)}
        onRecentPress={isCallerOnly ? undefined : () => setShowCalledBallsBoard(true)}
      />

      {!isCallerOnly && (
        <CalledBallsBoard
          calledBalls={drawnBalls}
          visible={showCalledBallsBoard}
          onClose={() => setShowCalledBallsBoard(false)}
        />
      )}

      <View
        style={[
          styles.cardsContainer,
          isCallerOnly && styles.callerBoardContainer,
        ]}
      >
        {isCallerOnly ? (
          <CalledBallsBoard calledBalls={drawnBalls} inline />
        ) : (
          userCards && userCards.length > 0 && (
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
          )
        )}
      </View>

      {!isCallerOnly && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.bingoButton}
            onPress={callBingo}
            activeOpacity={0.8}
          >
            <Text style={styles.bingoButtonText}>BINGO!</Text>
          </TouchableOpacity>
        </View>
      )}

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
