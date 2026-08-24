import { CellCoord } from './types';

export const GRID_SIZE = 5;
export const CELL_COUNT = GRID_SIZE * GRID_SIZE;

export const FREE_ROW = 2;
export const FREE_COL = 2;
export const FREE_INDEX = FREE_ROW * GRID_SIZE + FREE_COL;

export const COLUMN_LETTERS = ['B', 'I', 'N', 'G', 'O'] as const;
export const BALLS_PER_COLUMN = 15;
export const TOTAL_BALLS = COLUMN_LETTERS.length * BALLS_PER_COLUMN;

/** `grid` is row-major, so a cell's array index is derived from its coordinates. */
export const toFlatIndex = (row: number, col: number): number => row * GRID_SIZE + col;

export const fromFlatIndex = (index: number): CellCoord => ({
  row: Math.floor(index / GRID_SIZE),
  col: index % GRID_SIZE,
});

export const isFreeSpace = (row: number, col: number): boolean =>
  row === FREE_ROW && col === FREE_COL;

/**
 * Keys for cell and daub lookup sets. Centralized because the daub set is
 * written and read in different modules, and the two formats must not drift.
 */
export const cellKey = (row: number, col: number): string => `${row}-${col}`;

export const daubKey = (cardIndex: number, row: number, col: number): string =>
  `${cardIndex}-${row}-${col}`;

export const daubKeyPrefix = (cardIndex: number): string => `${cardIndex}-`;
