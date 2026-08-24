import { WinResult } from '@/game/types';

export type WinnerGameState = 'roundWon' | 'gameWon' | 'npcWon' | 'invalidBingo';

export interface WinnerCopyParams {
  gameState: WinnerGameState;
  currentRoundNumber: number;
  totalRounds: number;
  currentRoundLabel: string;
  hasMoreRounds: boolean;
}

export function getWinnerTitle({
  gameState,
  currentRoundNumber,
}: WinnerCopyParams): string {
  switch (gameState) {
    case 'roundWon':
      return `🎉 Round ${currentRoundNumber} Complete! 🎉`;
    case 'gameWon':
      return '🏆 YOU WIN THE GAME! 🏆';
    case 'npcWon':
      return '😢 NPC Won!';
    case 'invalidBingo':
      return '❌ Invalid Bingo!';
  }
}

export function getWinnerMessage({
  gameState,
  currentRoundNumber,
  totalRounds,
  currentRoundLabel,
  hasMoreRounds,
}: WinnerCopyParams): string {
  switch (gameState) {
    case 'roundWon': {
      const remaining = totalRounds - currentRoundNumber;
      const plural = remaining === 1 ? '' : 's';
      return `You won ${currentRoundLabel}. ${remaining} round${plural} remaining.`;
    }
    case 'gameWon':
      return `You completed all ${totalRounds} rounds. Great job!`;
    case 'npcWon':
      return hasMoreRounds
        ? `An NPC won round ${currentRoundNumber} (${currentRoundLabel}). Here's their card!`
        : `An NPC won the final round (${currentRoundLabel}). Better luck next time!`;
    case 'invalidBingo':
      return `You don't have a valid ${currentRoundLabel} yet. Review your daubs.`;
  }
}

export function getOwnerLabel(winResult: WinResult | null): string {
  if (!winResult) {
    return '';
  }

  return winResult.isNpc
    ? 'NPC winning card'
    : `Your card #${winResult.cardIndex + 1}`;
}
