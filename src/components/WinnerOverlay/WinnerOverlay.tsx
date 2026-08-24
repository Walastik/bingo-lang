import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import WinningCardView from '@/components/WinningCardView';
import { WinResult } from '@/game/types';
import { useTheme } from '@/theme/ThemeContext';
import { createStyles } from './WinnerOverlay.styles';

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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

export default WinnerOverlay;
