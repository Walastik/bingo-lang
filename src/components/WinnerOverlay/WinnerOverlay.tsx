import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import WinningCardView from '@/components/WinningCardView';
import { WinResult } from '@/game/types';
import { useTheme } from '@/theme/ThemeContext';
import { createStyles } from './WinnerOverlay.styles';
import {
  WinnerGameState,
  getOwnerLabel,
  getWinnerMessage,
  getWinnerTitle,
} from './winnerCopy';

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

  const copyParams = {
    gameState,
    currentRoundNumber,
    totalRounds,
    currentRoundLabel,
    hasMoreRounds,
  };

  const showWinningCard =
    winResult &&
    (gameState === 'roundWon' || gameState === 'gameWon' || gameState === 'npcWon');

  // An NPC win with rounds left continues the game, so it advances rather than restarts.
  const advancesToNextRound =
    gameState === 'roundWon' || (gameState === 'npcWon' && hasMoreRounds);

  return (
    <View style={styles.overlay}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{getWinnerTitle(copyParams)}</Text>
          <Text style={styles.message}>{getWinnerMessage(copyParams)}</Text>

          {showWinningCard && (
            <View style={styles.cardSection}>
              <WinningCardView
                card={winResult.card}
                drawnBalls={drawnBalls}
                winningCells={winResult.winningCells}
                isNpcCard={winResult.isNpc}
                userDaubs={userDaubs}
                cardIndex={winResult.cardIndex}
                ownerLabel={getOwnerLabel(winResult)}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={advancesToNextRound ? onNextRound : onPlayAgain}
              >
                <Text style={styles.primaryButtonText}>
                  {advancesToNextRound ? 'Next Round' : 'Play Again'}
                </Text>
              </TouchableOpacity>
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
