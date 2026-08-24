import React, { useMemo, useState } from 'react';
import {
  Alert,
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
import { TOTAL_BALLS, fromFlatIndex } from '@/game/constants';
import { buildPreviewPatterns } from '@/game/patterns/previewPatterns';
import { ROUND_SEQUENCE, getRoundConfig } from '@/game/patterns/roundConfigs';
import { GameSpeed } from '@/game/speed';
import { createStyles as createGameStyles } from '@/screens/GameScreen/GameScreen.styles';
import { createStyles as createLobbyStyles } from '@/screens/LobbyScreen/LobbyScreen.styles';
import { useTheme } from '@/theme/ThemeContext';
import { createScreenStyles } from '@/theme/screenStyles';

export default function App() {
  const { colors, isDarkMode, setDarkMode } = useTheme();
  const screenStyles = useMemo(() => createScreenStyles(colors), [colors]);
  const lobbyStyles = useMemo(() => createLobbyStyles(colors), [colors]);
  const gameStyles = useMemo(() => createGameStyles(colors), [colors]);

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
      <SafeAreaView style={screenStyles.container}>
        <StatusBar barStyle={colors.statusBarStyle} />
        <ScrollView
          contentContainerStyle={lobbyStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={lobbyStyles.title}>Bingo Lang!</Text>

          <Text style={lobbyStyles.subtitle}>Mode</Text>
          <View style={lobbyStyles.modeContainer}>
            <TouchableOpacity
              style={[
                lobbyStyles.modeButton,
                !isCallerOnly && lobbyStyles.modeButtonActive,
              ]}
              onPress={() => setIsCallerOnly(false)}
              accessibilityRole="button"
              accessibilityState={{ selected: !isCallerOnly }}
            >
              <Text
                style={[
                  lobbyStyles.modeButtonText,
                  !isCallerOnly && lobbyStyles.modeButtonTextActive,
                ]}
              >
                Play Bingo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                lobbyStyles.modeButton,
                isCallerOnly && lobbyStyles.modeButtonActive,
              ]}
              onPress={() => setIsCallerOnly(true)}
              accessibilityRole="button"
              accessibilityState={{ selected: isCallerOnly }}
            >
              <Text
                style={[
                  lobbyStyles.modeButtonText,
                  isCallerOnly && lobbyStyles.modeButtonTextActive,
                ]}
              >
                Caller Only
              </Text>
            </TouchableOpacity>
          </View>

          {!isCallerOnly && (
            <>
              <Text style={lobbyStyles.subtitle}>Cards</Text>
              <View style={lobbyStyles.selectionContainer}>
                {[1, 2, 3, 4].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      lobbyStyles.selectionButton,
                      selectedCardCount === num && lobbyStyles.selectionButtonActive,
                    ]}
                    onPress={() => setSelectedCardCount(num)}
                  >
                    <Text style={lobbyStyles.selectionText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={lobbyStyles.subtitle}>Round lineup</Text>
          <Text style={lobbyStyles.roundLineupHint}>
            Tap a game to include or exclude it.
          </Text>
          <View style={lobbyStyles.roundLineup}>
            {ROUND_SEQUENCE.map((roundType, index) => {
              const round = getRoundConfig(roundType);
              const isSelected = selectedRounds[index];

              return (
                <TouchableOpacity
                  key={roundType}
                  style={[
                    lobbyStyles.roundLineupRow,
                    !isSelected && lobbyStyles.roundLineupRowOff,
                  ]}
                  onPress={() => toggleRoundSelection(index)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`${round.label}, ${isSelected ? 'included' : 'excluded'}`}
                >
                  <View
                    style={[
                      lobbyStyles.roundCheckbox,
                      isSelected && lobbyStyles.roundCheckboxSelected,
                    ]}
                  >
                    {isSelected && (
                      <Text style={lobbyStyles.roundCheckboxMark}>✓</Text>
                    )}
                  </View>
                  <View style={lobbyStyles.roundLineupText}>
                    <Text
                      style={[
                        lobbyStyles.roundLineupLabel,
                        !isSelected && lobbyStyles.roundLineupLabelOff,
                      ]}
                    >
                      {round.label}
                    </Text>
                    <Text
                      style={[
                        lobbyStyles.roundLineupDescription,
                        !isSelected && lobbyStyles.roundLineupDescriptionOff,
                      ]}
                    >
                      {round.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={lobbyStyles.subtitle}>Appearance</Text>
          <View style={lobbyStyles.appearanceSection}>
            <View style={lobbyStyles.appearanceRow}>
              <View>
                <Text style={lobbyStyles.appearanceLabel}>Dark Mode</Text>
                <Text style={lobbyStyles.appearanceHint}>
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
            style={[
              lobbyStyles.startButton,
              rounds.length === 0 && lobbyStyles.startButtonDisabled,
            ]}
            onPress={startGame}
            disabled={rounds.length === 0}
          >
            <Text style={lobbyStyles.startButtonText}>
              {isCallerOnly ? 'Start Calling' : 'Start Game'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- RENDER: PLAYING / WIN ---
  return (
    <SafeAreaView style={screenStyles.container}>
      <StatusBar barStyle={colors.statusBarStyle} />

      {gameState === 'playing' && (
        <View style={gameStyles.header}>
          <View style={gameStyles.roundInfo}>
            <Text style={gameStyles.roundInfoLabel}>
              Round {currentRoundNumber}/{totalRounds}
            </Text>
            <Text style={gameStyles.roundInfoName}>{currentRound.label}</Text>
          </View>
          <TouchableOpacity
            style={gameStyles.settingsButton}
            onPress={handleOpenSettings}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Open game settings"
          >
            <Text style={gameStyles.settingsIcon}>⚙️</Text>
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
        canCallNextBall={drawnBalls.length < TOTAL_BALLS}
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
          gameStyles.cardsContainer,
          isCallerOnly && gameStyles.callerBoardContainer,
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
                const { row, col } = fromFlatIndex(flatIndex);
                daubSpace(cardOrder[displayIndex], row, col);
              }}
              onHeaderPress={(displayIndex, col) => {
                autoDaubColumn(cardOrder[displayIndex], col);
              }}
            />
          )
        )}
      </View>

      {!isCallerOnly && (
        <View style={gameStyles.floatingButtonContainer}>
          <TouchableOpacity
            style={gameStyles.bingoButton}
            onPress={callBingo}
            activeOpacity={0.8}
          >
            <Text style={gameStyles.bingoButtonText}>BINGO!</Text>
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
