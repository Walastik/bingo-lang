import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WinResult } from '../hooks/useBingoGame';
import WinningCardView from './WinningCardView';

type WinnerGameState = 'roundWon' | 'gameWon' | 'npcWon' | 'invalidBingo';

interface WinnerOverlayProps {
  gameState: WinnerGameState;
  winResult: WinResult | null;
  currentRoundNumber: number;
  totalRounds: number;
  currentRoundLabel: string;
  hasMoreRounds: boolean;
  userDaubs: Set<string>;
  drawnBalls: number[];
  onContinue: () => void;
  onNextRound: () => void;
  onPlayAgain: () => void;
}

const WinnerOverlay: React.FC<WinnerOverlayProps> = ({
  gameState,
  winResult,
  currentRoundNumber,
  totalRounds,
  currentRoundLabel,
  hasMoreRounds,
  userDaubs,
  drawnBalls,
  onContinue,
  onNextRound,
  onPlayAgain,
}) => {
  const showWinningCard =
    winResult &&
    (gameState === 'roundWon' || gameState === 'gameWon' || gameState === 'npcWon');

  const title =
    gameState === 'roundWon'
      ? `🎉 Round ${currentRoundNumber} Complete! 🎉`
      : gameState === 'gameWon'
        ? '🏆 YOU WIN THE GAME! 🏆'
        : gameState === 'npcWon'
          ? '😢 NPC Won!'
          : '❌ Invalid Bingo!';

  const message =
    gameState === 'roundWon'
      ? `You won ${currentRoundLabel}. ${totalRounds - currentRoundNumber} round${totalRounds - currentRoundNumber === 1 ? '' : 's'} remaining.`
      : gameState === 'gameWon'
        ? `You completed all ${totalRounds} rounds. Great job!`
        : gameState === 'npcWon' && hasMoreRounds
          ? `An NPC won round ${currentRoundNumber} (${currentRoundLabel}). Here's their card!`
          : gameState === 'npcWon'
            ? `An NPC won the final round (${currentRoundLabel}). Better luck next time!`
            : `You don't have a valid ${currentRoundLabel} yet. Review your daubs.`;

  const ownerLabel = winResult?.isNpc
    ? 'NPC winning card'
    : winResult
      ? `Your card #${winResult.cardIndex + 1}`
      : '';

  return (
    <View style={styles.overlay}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {showWinningCard && (
            <View style={styles.cardSection}>
              <WinningCardView
                card={winResult.card}
                drawnBalls={drawnBalls}
                winningCells={winResult.winningCells}
                isNpcCard={winResult.isNpc}
                userDaubs={userDaubs}
                cardIndex={winResult.cardIndex}
                ownerLabel={ownerLabel}
              />

              {gameState === 'roundWon' || (gameState === 'npcWon' && hasMoreRounds) ? (
                <TouchableOpacity style={styles.primaryButton} onPress={onNextRound}>
                  <Text style={styles.primaryButtonText}>Next Round</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.primaryButton} onPress={onPlayAgain}>
                  <Text style={styles.primaryButtonText}>Play Again</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {gameState === 'invalidBingo' && (
            <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
              <Text style={styles.continueButtonText}>Continue Game</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 100,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 32,
  },
  content: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardSection: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
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
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WinnerOverlay;
