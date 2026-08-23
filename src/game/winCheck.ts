import { cellKey, isFreeSpace, toFlatIndex } from '@/game/constants';
import { mergeCells } from '@/game/patterns/primitives';
import {
  BingoCard,
  RoundConfig,
  WinPattern,
  WinningCardResult,
} from '@/game/types';

export type CellMarkedChecker = (row: number, col: number) => boolean;

/**
 * Whether a cell counts as marked. NPC cards mark themselves as soon as a ball
 * is called, but the user must also have daubed the space — daubing an uncalled
 * number never counts.
 */
export function createCellMarkedChecker(
  card: BingoCard,
  drawnBalls: Set<number>,
  isUser: boolean,
  userDaubedSpaces: Set<string> | undefined,
): CellMarkedChecker {
  return (row, col) => {
    if (isFreeSpace(row, col)) {
      return true;
    }

    const cell = card.grid[toFlatIndex(row, col)];
    const isCalled = typeof cell === 'number' && drawnBalls.has(cell);

    if (isUser && userDaubedSpaces) {
      return isCalled && userDaubedSpaces.has(cellKey(row, col));
    }

    return isCalled;
  };
}

const isPatternComplete = (
  pattern: WinPattern,
  isCellMarked: CellMarkedChecker,
): boolean => pattern.cells.every(({ row, col }) => isCellMarked(row, col));

export function getCompletedPatterns(
  card: BingoCard,
  drawnBalls: Set<number>,
  isUser: boolean,
  userDaubedSpaces: Set<string> | undefined,
  roundConfig: RoundConfig,
): WinPattern[] {
  const isCellMarked = createCellMarkedChecker(
    card,
    drawnBalls,
    isUser,
    userDaubedSpaces,
  );

  return roundConfig.patterns.filter((pattern) =>
    isPatternComplete(pattern, isCellMarked),
  );
}

/** Whether a card satisfies the round, which may require two patterns at once. */
export function checkWin(
  card: BingoCard,
  drawnBalls: Set<number>,
  isUser: boolean,
  userDaubedSpaces: Set<string> | undefined,
  roundConfig: RoundConfig,
): boolean {
  const completed = getCompletedPatterns(
    card,
    drawnBalls,
    isUser,
    userDaubedSpaces,
    roundConfig,
  );

  return completed.length >= roundConfig.minPatternsRequired;
}

/** The first winning card, plus the cells that completed the round's pattern. */
export function findWinningCard(
  cards: BingoCard[],
  drawnBalls: Set<number>,
  isUser: boolean,
  getUserDaubsForCard: (cardIndex: number) => Set<string> | undefined,
  roundConfig: RoundConfig,
): WinningCardResult | null {
  for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
    const card = cards[cardIndex];
    const completed = getCompletedPatterns(
      card,
      drawnBalls,
      isUser,
      isUser ? getUserDaubsForCard(cardIndex) : undefined,
      roundConfig,
    );

    if (completed.length < roundConfig.minPatternsRequired) {
      continue;
    }

    return {
      card,
      cardIndex,
      winningCells: mergeCells(
        completed.slice(0, roundConfig.minPatternsRequired),
      ),
    };
  }

  return null;
}
