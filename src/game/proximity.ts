import { CELL_COUNT, daubKey, isFreeSpace, toFlatIndex } from '@/game/constants';
import { getPatternGroups, mergeCells } from '@/game/patterns/primitives';
import { BingoCard, CellCoord, RoundConfig } from '@/game/types';
import { CellMarkedChecker } from '@/game/winCheck';

/**
 * Distance-to-bingo treats an undaubed-but-called space as already marked when
 * auto-daub is on, so ordering reflects how close a card really is rather than
 * how attentive the player has been.
 */
function createProximityChecker(
  card: BingoCard,
  drawnBalls: Set<number>,
  cardIndex: number,
  userDaubs: Set<string>,
  isAutoMode: boolean,
): CellMarkedChecker {
  return (row, col) => {
    if (isFreeSpace(row, col)) {
      return true;
    }

    const cell = card.grid[toFlatIndex(row, col)];

    if (typeof cell !== 'number') {
      return true;
    }

    if (!drawnBalls.has(cell)) {
      return false;
    }

    return isAutoMode || userDaubs.has(daubKey(cardIndex, row, col));
  };
}

/** Cells still needing a ball that has not been called yet. */
function countUncalledBallsNeeded(
  card: BingoCard,
  drawnBalls: Set<number>,
  cells: CellCoord[],
  isCellMarked: CellMarkedChecker,
): number {
  let needed = 0;

  for (const { row, col } of cells) {
    if (isCellMarked(row, col)) {
      continue;
    }

    const cell = card.grid[toFlatIndex(row, col)];

    if (typeof cell === 'number' && !drawnBalls.has(cell)) {
      needed += 1;
    }
  }

  return needed;
}

/** Fewest uncalled balls still needed to complete the round on this card. */
export function getBallsNeededForBingo(
  card: BingoCard,
  drawnBalls: Set<number>,
  cardIndex: number,
  userDaubs: Set<string>,
  isAutoMode: boolean,
  roundConfig: RoundConfig,
): number {
  const isCellMarked = createProximityChecker(
    card,
    drawnBalls,
    cardIndex,
    userDaubs,
    isAutoMode,
  );

  let minNeeded = CELL_COUNT;

  for (const group of getPatternGroups(roundConfig)) {
    const needed = countUncalledBallsNeeded(
      card,
      drawnBalls,
      mergeCells(group),
      isCellMarked,
    );

    minNeeded = Math.min(minNeeded, needed);
  }

  return minNeeded;
}

/** Display order for user cards: closest to bingo first, ties by card index. */
export function sortCardIndicesByProximity(
  cards: BingoCard[],
  drawnBalls: Set<number>,
  userDaubs: Set<string>,
  isAutoMode: boolean,
  roundConfig: RoundConfig,
): number[] {
  const ballsNeeded = cards.map((card, index) =>
    getBallsNeededForBingo(
      card,
      drawnBalls,
      index,
      userDaubs,
      isAutoMode,
      roundConfig,
    ),
  );

  return cards
    .map((_, index) => index)
    .sort((a, b) => ballsNeeded[a] - ballsNeeded[b] || a - b);
}
