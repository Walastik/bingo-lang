export interface CellCoord {
  row: number;
  col: number;
}

export interface WinPattern {
  id: string;
  label: string;
  cells: CellCoord[];
}

const buildRowPattern = (size: number, row: number): WinPattern => ({
  id: `row-${row + 1}`,
  label: `Row ${row + 1}`,
  cells: Array.from({ length: size }, (_, col) => ({ row, col })),
});

const buildColumnPattern = (size: number, col: number): WinPattern => ({
  id: `col-${col + 1}`,
  label: `Column ${col + 1}`,
  cells: Array.from({ length: size }, (_, row) => ({ row, col })),
});

const buildPrimaryDiagonalPattern = (size: number): WinPattern => ({
  id: 'diag-primary',
  label: 'Primary diagonal',
  cells: Array.from({ length: size }, (_, i) => ({ row: i, col: i })),
});

const buildSecondaryDiagonalPattern = (size: number): WinPattern => ({
  id: 'diag-secondary',
  label: 'Secondary diagonal',
  cells: Array.from({ length: size }, (_, i) => ({ row: i, col: size - 1 - i })),
});

/**
 * Current classic bingo win conditions:
 * - Any full row
 * - Any full column
 * - Either diagonal
 */
export const buildSingleLineWinPatterns = (size = 5): WinPattern[] => {
  const rows = Array.from({ length: size }, (_, row) => buildRowPattern(size, row));
  const cols = Array.from({ length: size }, (_, col) => buildColumnPattern(size, col));

  return [
    ...rows,
    ...cols,
    buildPrimaryDiagonalPattern(size),
    buildSecondaryDiagonalPattern(size),
  ];
};

/**
 * Reusable place to define which patterns are active in this game mode.
 * Future patterns (postage stamp, pyramids, etc.) can be appended here.
 */
export const ACTIVE_WIN_PATTERNS: WinPattern[] = buildSingleLineWinPatterns();
