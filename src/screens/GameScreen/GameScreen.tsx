import React, { useMemo } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Announcer from '@/components/Announcer';
import BingoCardCarousel from '@/components/BingoCardCarousel';
import CalledBallsBoard from '@/components/CalledBallsBoard';
import DeclareWinnerModal from '@/components/DeclareWinnerModal';
import GameSettingsModal from '@/components/GameSettingsModal';
import WinnerOverlay from '@/components/WinnerOverlay';
import { TOTAL_BALLS, fromFlatIndex } from '@/game/constants';
import { buildPreviewPatterns } from '@/game/patterns/previewPatterns';
import { useGameContext } from '@/state/GameContext';
import { useTheme } from '@/theme/ThemeContext';
import { createScreenStyles } from '@/theme/screenStyles';
import BingoButton from './BingoButton';
import { createStyles } from './GameScreen.styles';
import GameHeader from './GameHeader';
import { useGameScreenModals } from './useGameScreenModals';

/** The board in play, plus every overlay that can sit on top of it. */
const GameScreen = () => {
  const { colors } = useTheme();
  const screenStyles = useMemo(() => createScreenStyles(colors), [colors]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const modals = useGameScreenModals();

  const {
    gameState,
    isCallerOnly,
    userCards,
    cardOrder,
    userDaubs,
    drawnBalls,
    currentBall,
    upcomingBall,
    isPaused,
    isAutoMode,
    gameSpeed,
    currentRound,
    currentRoundNumber,
    totalRounds,
    winResult,
    callNextBall,
    togglePause,
    toggleAutoMode,
    setGameSpeed,
    daubSpace,
    autoDaubColumn,
    callBingo,
    continueGame,
    startNextRound,
    resetGame,
  } = useGameContext();

  const isPlaying = gameState === 'playing';

  // Spelled out rather than a list lookup, so `gameState` narrows for the overlay.
  const showOverlay =
    !isCallerOnly &&
    (gameState === 'roundWon' ||
      gameState === 'gameWon' ||
      gameState === 'npcWon' ||
      gameState === 'invalidBingo');

  const previewPatterns = useMemo(
    () => buildPreviewPatterns(currentRound),
    [currentRound],
  );

  return (
    <SafeAreaView style={screenStyles.container}>
      <StatusBar barStyle={colors.statusBarStyle} />

      {isPlaying && (
        <GameHeader
          roundNumber={currentRoundNumber}
          totalRounds={totalRounds}
          roundLabel={currentRound.label}
          onOpenSettings={modals.openSettings}
          styles={styles}
        />
      )}

      <GameSettingsModal
        visible={modals.showSettings}
        gameSpeed={gameSpeed}
        onSelectSpeed={setGameSpeed}
        onQuit={modals.confirmQuit}
        onClose={modals.closeSettings}
      />

      <DeclareWinnerModal
        visible={modals.showDeclareWinner}
        onConfirm={modals.confirmWinner}
        onCancel={modals.cancelDeclareWinner}
      />

      <Announcer
        currentBall={currentBall}
        upcomingBall={upcomingBall}
        recentBalls={drawnBalls}
        isPaused={isPaused}
        showPauseControl={isPlaying && !isCallerOnly}
        onTogglePause={togglePause}
        showNextControl={isPlaying && isCallerOnly}
        canCallNextBall={drawnBalls.length < TOTAL_BALLS}
        onNextBall={callNextBall}
        isAutoMode={isAutoMode}
        showAutoControl={isPlaying && !isCallerOnly}
        onToggleAutoMode={toggleAutoMode}
        showDeclareWinnerControl={isPlaying && isCallerOnly}
        onDeclareWinner={modals.openDeclareWinner}
        onRecentPress={isCallerOnly ? undefined : modals.openCalledBalls}
      />

      {!isCallerOnly && (
        <CalledBallsBoard
          calledBalls={drawnBalls}
          visible={modals.showCalledBalls}
          onClose={modals.closeCalledBalls}
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
          userCards.length > 0 && (
            <BingoCardCarousel
              cards={cardOrder.map((index) => userCards[index])}
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

      {!isCallerOnly && <BingoButton onPress={callBingo} styles={styles} />}

      {showOverlay && (
        <WinnerOverlay
          gameState={gameState}
          winResult={winResult}
          currentRoundNumber={currentRoundNumber}
          totalRounds={totalRounds}
          currentRoundLabel={currentRound.label}
          hasMoreRounds={currentRoundNumber < totalRounds}
          userDaubs={userDaubs}
          drawnBalls={drawnBalls}
          onContinue={continueGame}
          onNextRound={startNextRound}
          onPlayAgain={resetGame}
        />
      )}
    </SafeAreaView>
  );
};

export default GameScreen;
