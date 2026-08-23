import { GRID_SIZE, cellKey } from '@/game/constants';
import { CellCoord, RoundConfig, WinPattern } from '@/game/types';

export const buildRowCells = (row: number, size = GRID_SIZE): CellCoord[] =>
  Array.from({ length: size }, (_, col) => ({ row, col }));

export const buildColumnCells = (col: number, size = GRID_SIZE): CellCoord[] =>
  Array.from({ length: size }, (_, row) => ({ row, col }));

export const buildPrimaryDiagonalCells = (size = GRID_SIZE): CellCoord[] =>
  Array.from({ length: size }, (_, i) => ({ row: i, col: i }));

export const buildSecondaryDiagonalCells = (size = GRID_SIZE): CellCoord[] =>
  Array.from({ length: size }, (_, i) => ({ row: i, col: size - 1 - i }));

export const dedupeCells = (cells: CellCoord[]): CellCoord[] => {
  const byKey = new Map<string, CellCoord>();

  for (const cell of cells) {
    byKey.set(cellKey(cell.row, cell.col), cell);
  }

  return Array.from(byKey.values());
};

/** Union of every cell across `patterns`. */
export const mergeCells = (patterns: WinPattern[]): CellCoord[] =>
  dedupeCells(patterns.flatMap((pattern) => pattern.cells));

/**
 * The pattern combinations that would satisfy a round: each pattern on its own
 * normally, or every unordered pair when the round needs two at once (double
 * bingo). Used both to detect a win and to measure distance from one.
 */
export const getPatternGroups = (roundConfig: RoundConfig): WinPattern[][] => {
  const { patterns, minPatternsRequired } = roundConfig;

  if (minPatternsRequired <= 1) {
    return patterns.map((pattern) => [pattern]);
  }

  const groups: WinPattern[][] = [];

  for (let i = 0; i < patterns.length; i++) {
    for (let j = i + 1; j < patterns.length; j++) {
      groups.push([patterns[i], patterns[j]]);
    }
  }

  return groups;
};
