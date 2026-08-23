import { GRID_SIZE } from '@/game/constants';
import { WinPattern } from '@/game/types';
import {
  buildColumnCells,
  buildPrimaryDiagonalCells,
  buildRowCells,
  buildSecondaryDiagonalCells,
} from './primitives';

export const buildRowPattern = (row: number, size = GRID_SIZE): WinPattern => ({
  id: `row-${row + 1}`,
  label: `Row ${row + 1}`,
  cells: buildRowCells(row, size),
});

export const buildColumnPattern = (col: number, size = GRID_SIZE): WinPattern => ({
  id: `col-${col + 1}`,
  label: `Column ${col + 1}`,
  cells: buildColumnCells(col, size),
});

export const buildPrimaryDiagonalPattern = (size = GRID_SIZE): WinPattern => ({
  id: 'diag-primary',
  label: 'Primary diagonal',
  cells: buildPrimaryDiagonalCells(size),
});

export const buildSecondaryDiagonalPattern = (size = GRID_SIZE): WinPattern => ({
  id: 'diag-secondary',
  label: 'Secondary diagonal',
  cells: buildSecondaryDiagonalCells(size),
});

/**
 * Classic bingo win conditions: any full row, any full column, either diagonal.
 */
export const buildSingleLineWinPatterns = (size = GRID_SIZE): WinPattern[] => [
  ...Array.from({ length: size }, (_, row) => buildRowPattern(row, size)),
  ...Array.from({ length: size }, (_, col) => buildColumnPattern(col, size)),
  buildPrimaryDiagonalPattern(size),
  buildSecondaryDiagonalPattern(size),
];
