export interface CellCoord {
  row: number;
  col: number;
}

export interface WinPattern {
  id: string;
  label: string;
  cells: CellCoord[];
}

export type RoundType =
  | 'singleLine'
  | 'doubleLine'
  | 'postageStamp'
  | 'sixPack'
  | 'pyramid'
  | 'blackout';

export interface RoundConfig {
  type: RoundType;
  label: string;
  description: string;
  patterns: WinPattern[];
  /** How many patterns must be complete simultaneously (e.g. 2 for double bingo). */
  minPatternsRequired: number;
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
 * Classic bingo win conditions:
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

const buildCornerStamp = (id: string, label: string, topRow: number, leftCol: number): WinPattern => ({
  id,
  label,
  cells: [
    { row: topRow, col: leftCol },
    { row: topRow, col: leftCol + 1 },
    { row: topRow + 1, col: leftCol },
    { row: topRow + 1, col: leftCol + 1 },
  ],
});

/** 2×2 block in any corner of the card. */
export const buildPostageStampPatterns = (): WinPattern[] => [
  buildCornerStamp('stamp-tl', 'Top-left stamp', 0, 0),
  buildCornerStamp('stamp-tr', 'Top-right stamp', 0, 3),
  buildCornerStamp('stamp-bl', 'Bottom-left stamp', 3, 0),
  buildCornerStamp('stamp-br', 'Bottom-right stamp', 3, 3),
];

/** Two adjacent columns with three consecutive rows fully marked. */
export const buildSixPackPatterns = (): WinPattern[] => {
  const patterns: WinPattern[] = [];

  for (let leftCol = 0; leftCol < 4; leftCol++) {
    for (let topRow = 0; topRow < 3; topRow++) {
      const cells: CellCoord[] = [];
      for (let row = topRow; row < topRow + 3; row++) {
        for (let col = leftCol; col < leftCol + 2; col++) {
          cells.push({ row, col });
        }
      }
      patterns.push({
        id: `sixpack-c${leftCol}-r${topRow}`,
        label: `6-pack cols ${leftCol + 1}-${leftCol + 2}`,
        cells,
      });
    }
  }

  return patterns;
};

const buildTopPyramidPattern = (): WinPattern => ({
  id: 'pyramid-top',
  label: 'Top pyramid',
  cells: [
    { row: 0, col: 2 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
    { row: 1, col: 3 },
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
    { row: 2, col: 3 },
    { row: 2, col: 4 },
  ],
});

const buildBottomPyramidPattern = (): WinPattern => ({
  id: 'pyramid-bottom',
  label: 'Bottom pyramid',
  cells: [
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
    { row: 2, col: 3 },
    { row: 2, col: 4 },
    { row: 3, col: 1 },
    { row: 3, col: 2 },
    { row: 3, col: 3 },
    { row: 4, col: 2 },
  ],
});

export const buildPyramidPatterns = (): WinPattern[] => [
  buildTopPyramidPattern(),
  buildBottomPyramidPattern(),
];

export const buildBlackoutPattern = (): WinPattern => ({
  id: 'blackout',
  label: 'Blackout',
  cells: Array.from({ length: 25 }, (_, i) => ({
    row: Math.floor(i / 5),
    col: i % 5,
  })),
});

export const ROUND_SEQUENCE: RoundType[] = [
  'singleLine',
  'doubleLine',
  'postageStamp',
  'sixPack',
  'pyramid',
  'blackout',
];

export const MAX_ROUNDS = ROUND_SEQUENCE.length;

const roundConfigBuilders: Record<RoundType, () => RoundConfig> = {
  singleLine: () => ({
    type: 'singleLine',
    label: 'Regular Bingo',
    description: 'Complete any row, column, or diagonal.',
    patterns: buildSingleLineWinPatterns(),
    minPatternsRequired: 1,
  }),
  doubleLine: () => ({
    type: 'doubleLine',
    label: 'Double Bingo',
    description: 'Complete any two lines (rows, columns, or diagonals).',
    patterns: buildSingleLineWinPatterns(),
    minPatternsRequired: 2,
  }),
  postageStamp: () => ({
    type: 'postageStamp',
    label: 'Postage Stamp',
    description: 'Complete a 2×2 block in any corner.',
    patterns: buildPostageStampPatterns(),
    minPatternsRequired: 1,
  }),
  sixPack: () => ({
    type: 'sixPack',
    label: '6 Pack',
    description: 'Complete two adjacent columns across three consecutive rows.',
    patterns: buildSixPackPatterns(),
    minPatternsRequired: 1,
  }),
  pyramid: () => ({
    type: 'pyramid',
    label: 'Pyramid',
    description: 'Complete the top or bottom pyramid pattern.',
    patterns: buildPyramidPatterns(),
    minPatternsRequired: 1,
  }),
  blackout: () => ({
    type: 'blackout',
    label: 'Blackout',
    description: 'Daub every space on the card.',
    patterns: [buildBlackoutPattern()],
    minPatternsRequired: 1,
  }),
};

export const getRoundConfig = (roundType: RoundType): RoundConfig =>
  roundConfigBuilders[roundType]();

export const getRoundsForGame = (selectedIndices: number[]): RoundConfig[] =>
  selectedIndices
    .slice()
    .sort((a, b) => a - b)
    .map(index => getRoundConfig(ROUND_SEQUENCE[index]));

/** All round slots selected (games 1–6). */
export const DEFAULT_ROUND_SELECTION = ROUND_SEQUENCE.map((_, index) => index);

const mergePatterns = (patterns: WinPattern[], id: string, label: string): WinPattern => {
  const cellMap = new Map<string, CellCoord>();

  for (const pattern of patterns) {
    for (const cell of pattern.cells) {
      cellMap.set(`${cell.row}-${cell.col}`, cell);
    }
  }

  return {
    id,
    label,
    cells: Array.from(cellMap.values()),
  };
};

/**
 * Win layouts shown by the card preview toggle.
 * For multi-pattern rounds (e.g. double bingo), returns merged combinations.
 */
export const buildPreviewPatterns = (roundConfig: RoundConfig): WinPattern[] => {
  const { patterns, minPatternsRequired } = roundConfig;

  if (minPatternsRequired <= 1) {
    return patterns;
  }

  const previews: WinPattern[] = [];

  for (let i = 0; i < patterns.length; i++) {
    for (let j = i + 1; j < patterns.length; j++) {
      const first = patterns[i];
      const second = patterns[j];
      previews.push(
        mergePatterns(
          [first, second],
          `preview-${first.id}-${second.id}`,
          `${first.label} + ${second.label}`,
        ),
      );
    }
  }

  return previews;
};

/** @deprecated Use getRoundConfig for the active round instead. */
export const ACTIVE_WIN_PATTERNS: WinPattern[] = buildSingleLineWinPatterns();
