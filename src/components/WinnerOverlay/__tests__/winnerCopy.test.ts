import { WinResult } from '@/game/types';
import {
  WinnerCopyParams,
  getOwnerLabel,
  getWinnerMessage,
  getWinnerTitle,
} from '../winnerCopy';

const params = (overrides: Partial<WinnerCopyParams> = {}): WinnerCopyParams => ({
  gameState: 'roundWon',
  currentRoundNumber: 1,
  totalRounds: 3,
  currentRoundLabel: 'Single Bingo',
  hasMoreRounds: true,
  ...overrides,
});

const winResult = (overrides: Partial<WinResult> = {}): WinResult => ({
  card: { id: 'card-1', grid: [] },
  cardIndex: 0,
  winningCells: [],
  isNpc: false,
  ...overrides,
});

describe('getWinnerTitle', () => {
  it('numbers the completed round', () => {
    expect(getWinnerTitle(params({ currentRoundNumber: 2 }))).toContain('Round 2');
  });

  it('returns a distinct title per outcome', () => {
    const titles = (
      ['roundWon', 'gameWon', 'npcWon', 'invalidBingo'] as const
    ).map((gameState) => getWinnerTitle(params({ gameState })));

    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe('getWinnerMessage', () => {
  it('pluralizes the remaining round count', () => {
    expect(
      getWinnerMessage(params({ currentRoundNumber: 1, totalRounds: 3 })),
    ).toContain('2 rounds remaining');
  });

  it('uses the singular form for exactly one round left', () => {
    expect(
      getWinnerMessage(params({ currentRoundNumber: 2, totalRounds: 3 })),
    ).toContain('1 round remaining');
  });

  it('says the game is over when the last round is won', () => {
    expect(getWinnerMessage(params({ gameState: 'gameWon', totalRounds: 5 }))).toBe(
      'You completed all 5 rounds. Great job!',
    );
  });

  it('distinguishes an NPC win mid-game from one on the final round', () => {
    const midGame = getWinnerMessage(
      params({ gameState: 'npcWon', hasMoreRounds: true }),
    );
    const finalRound = getWinnerMessage(
      params({ gameState: 'npcWon', hasMoreRounds: false }),
    );

    expect(midGame).toContain("Here's their card!");
    expect(finalRound).toContain('Better luck next time!');
  });

  it('names the round the user failed to complete', () => {
    expect(
      getWinnerMessage(
        params({ gameState: 'invalidBingo', currentRoundLabel: 'Four Corners' }),
      ),
    ).toContain('Four Corners');
  });
});

describe('getOwnerLabel', () => {
  it('labels the user card with a 1-based number', () => {
    expect(getOwnerLabel(winResult({ cardIndex: 2 }))).toBe('Your card #3');
  });

  it('labels an NPC card without a number', () => {
    expect(getOwnerLabel(winResult({ isNpc: true }))).toBe('NPC winning card');
  });

  it('is empty when there is no win yet', () => {
    expect(getOwnerLabel(null)).toBe('');
  });
});
