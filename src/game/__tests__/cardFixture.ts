import {
  BALLS_PER_COLUMN,
  CELL_COUNT,
  FREE_INDEX,
  GRID_SIZE,
  cellKey,
  daubKey,
  toFlatIndex,
} from '@/game/constants';
import { BingoCard, CellCoord } from '@/game/types';

/**
 * A card with predictable numbers so tests can reason about specific balls:
 * cell (row, col) holds `col * 15 + row + 1`, with the center left FREE.
 * `offset` shifts every column's numbers within its own range, which yields
 * cards that share no numbers — useful for comparing two cards.
 */
export function createTestCard(
  options: { offset?: number; id?: string } = {},
): BingoCard {
  const { offset = 0, id = 'test-card' } = options;
  const grid: (number | 'FREE')[] = new Array(CELL_COUNT);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const withinColumn = (row + offset) % BALLS_PER_COLUMN;
      grid[toFlatIndex(row, col)] = col * BALLS_PER_COLUMN + withinColumn + 1;
    }
  }

  grid[FREE_INDEX] = 'FREE';

  return { id, grid };
}

export const rowCells = (row: number): CellCoord[] =>
  Array.from({ length: GRID_SIZE }, (_, col) => ({ row, col }));

export const columnCells = (col: number): CellCoord[] =>
  Array.from({ length: GRID_SIZE }, (_, row) => ({ row, col }));

/** The balls covering `cells`, skipping the free space. */
export function ballsFor(card: BingoCard, cells: CellCoord[]): number[] {
  return cells
    .map(({ row, col }) => card.grid[toFlatIndex(row, col)])
    .filter((cell): cell is number => typeof cell === 'number');
}

/** Daub keys for a single card, as the win check expects them. */
export const cellDaubs = (cells: CellCoord[]): Set<string> =>
  new Set(cells.map(({ row, col }) => cellKey(row, col)));

/** Daub keys as the game state stores them, prefixed with the card index. */
export const cardDaubs = (cardIndex: number, cells: CellCoord[]): Set<string> =>
  new Set(cells.map(({ row, col }) => daubKey(cardIndex, row, col)));
