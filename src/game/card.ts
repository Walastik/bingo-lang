import {
  BALLS_PER_COLUMN,
  CELL_COUNT,
  FREE_INDEX,
  GRID_SIZE,
  TOTAL_BALLS,
  toFlatIndex,
} from '@/game/constants';
import { BingoCard } from '@/game/types';

/** `count` unique integers drawn from the inclusive range [min, max]. */
function pickUniqueNumbers(min: number, max: number, count: number): number[] {
  const numbers = new Set<number>();

  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  return Array.from(numbers);
}

function createCardId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Standard 75-ball card: each column draws from its own 15-number range
 * (B 1-15, I 16-30, N 31-45, G 46-60, O 61-75) with a free center space.
 */
export function generateCard(): BingoCard {
  const grid: (number | 'FREE')[] = new Array(CELL_COUNT);

  for (let col = 0; col < GRID_SIZE; col++) {
    const min = col * BALLS_PER_COLUMN + 1;
    const columnNumbers = pickUniqueNumbers(
      min,
      min + BALLS_PER_COLUMN - 1,
      GRID_SIZE,
    );

    for (let row = 0; row < GRID_SIZE; row++) {
      grid[toFlatIndex(row, col)] = columnNumbers[row];
    }
  }

  grid[FREE_INDEX] = 'FREE';

  return { id: createCardId(), grid };
}

/** All 75 balls in random draw order. */
export function generateDeck(): number[] {
  const deck = Array.from({ length: TOTAL_BALLS }, (_, index) => index + 1);

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}
