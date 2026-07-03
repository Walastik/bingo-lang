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
  | 'fourCorners'
  | 'x'
  | 'tOrZ'
  | 'h'
  | 'kite'
  | 'arrowhead'
  | 'outsideFrame'
  | 'insideFrame'
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

const dedupeCells = (cells: CellCoord[]): CellCoord[] => {
  const cellMap = new Map<string, CellCoord>();
  for (const cell of cells) {
    cellMap.set(`${cell.row}-${cell.col}`, cell);
  }
  return Array.from(cellMap.values());
};

const buildRowCells = (size: number, row: number): CellCoord[] =>
  Array.from({ length: size }, (_, col) => ({ row, col }));

const buildColumnCells = (size: number, col: number): CellCoord[] =>
  Array.from({ length: size }, (_, row) => ({ row, col }));

/** Four outermost corners of the card. */
export const buildFourCornersPattern = (): WinPattern => ({
  id: 'four-corners',
  label: 'Four corners',
  cells: [
    { row: 0, col: 0 },
    { row: 0, col: 4 },
    { row: 4, col: 0 },
    { row: 4, col: 4 },
  ],
});

/** Both diagonals crossing through the center free space. */
export const buildXPattern = (): WinPattern => ({
  id: 'x',
  label: 'X',
  cells: dedupeCells([
    ...buildPrimaryDiagonalPattern(5).cells,
    ...buildSecondaryDiagonalPattern(5).cells,
  ]),
});

const buildTPattern = (): WinPattern => ({
  id: 't',
  label: 'T',
  cells: [...buildRowCells(5, 0), ...buildColumnCells(5, 2).filter(cell => cell.row > 0)],
});

const buildZPattern = (): WinPattern => ({
  id: 'z',
  label: 'Z',
  cells: [
    ...buildRowCells(5, 0),
    { row: 1, col: 3 },
    { row: 2, col: 2 },
    { row: 3, col: 1 },
    ...buildRowCells(5, 4),
  ],
});

/** Top row plus a T or Z path down/across the card. */
export const buildTOrZPatterns = (): WinPattern[] => [buildTPattern(), buildZPattern()];

/** First and last columns plus the middle row. */
export const buildHPattern = (): WinPattern => ({
  id: 'h',
  label: 'H',
  cells: dedupeCells([
    ...buildColumnCells(5, 0),
    ...buildColumnCells(5, 4),
    ...buildRowCells(5, 2),
  ]),
});

const buildTopLeftKitePattern = (): WinPattern => ({
  id: 'kite-tl',
  label: 'Top-left kite',
  cells: [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 2 },
    { row: 3, col: 3 },
    { row: 4, col: 4 },
  ],
});

const buildTopRightKitePattern = (): WinPattern => ({
  id: 'kite-tr',
  label: 'Top-right kite',
  cells: [
    { row: 0, col: 3 },
    { row: 0, col: 4 },
    { row: 1, col: 3 },
    { row: 1, col: 4 },
    { row: 2, col: 2 },
    { row: 3, col: 1 },
    { row: 4, col: 0 },
  ],
});

/** 2×2 corner block plus a diagonal tail to the opposite corner. */
export const buildKitePatterns = (): WinPattern[] => [
  buildTopLeftKitePattern(),
  buildTopRightKitePattern(),
];

const buildArrowhead = (id: string, label: string, cells: CellCoord[]): WinPattern => ({
  id,
  label,
  cells,
});

/** Corner stamp with spaces stepping toward the center. */
export const buildArrowheadPatterns = (): WinPattern[] => [
  buildArrowhead('arrow-tl', 'Top-left arrowhead', [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 2 },
  ]),
  buildArrowhead('arrow-tr', 'Top-right arrowhead', [
    { row: 0, col: 3 },
    { row: 0, col: 4 },
    { row: 1, col: 3 },
    { row: 1, col: 4 },
    { row: 2, col: 2 },
  ]),
  buildArrowhead('arrow-bl', 'Bottom-left arrowhead', [
    { row: 3, col: 0 },
    { row: 3, col: 1 },
    { row: 4, col: 0 },
    { row: 4, col: 1 },
    { row: 2, col: 2 },
  ]),
  buildArrowhead('arrow-br', 'Bottom-right arrowhead', [
    { row: 3, col: 3 },
    { row: 3, col: 4 },
    { row: 4, col: 3 },
    { row: 4, col: 4 },
    { row: 2, col: 2 },
  ]),
];

/** Every square along the outer edge of the card. */
export const buildOutsideFramePattern = (): WinPattern => ({
  id: 'outside-frame',
  label: 'Outside frame',
  cells: dedupeCells([
    ...buildRowCells(5, 0),
    ...buildRowCells(5, 4),
    ...buildColumnCells(5, 0).filter(cell => cell.row > 0 && cell.row < 4),
    ...buildColumnCells(5, 4).filter(cell => cell.row > 0 && cell.row < 4),
  ]),
});

/** Inner 3×3 block with the outer border left empty. */
export const buildInsideFramePattern = (): WinPattern => ({
  id: 'inside-frame',
  label: 'Inside frame',
  cells: Array.from({ length: 9 }, (_, i) => ({
    row: Math.floor(i / 3) + 1,
    col: (i % 3) + 1,
  })),
});

export const ROUND_SEQUENCE: RoundType[] = [
  'singleLine',
  'doubleLine',
  'postageStamp',
  'sixPack',
  'pyramid',
  'fourCorners',
  'x',
  'tOrZ',
  'h',
  'kite',
  'arrowhead',
  'outsideFrame',
  'insideFrame',
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
  fourCorners: () => ({
    type: 'fourCorners',
    label: 'Four Corners',
    description: 'Cover the four outermost corners of the card.',
    patterns: [buildFourCornersPattern()],
    minPatternsRequired: 1,
  }),
  x: () => ({
    type: 'x',
    label: 'X',
    description: 'Complete both diagonals crossing through the center.',
    patterns: [buildXPattern()],
    minPatternsRequired: 1,
  }),
  tOrZ: () => ({
    type: 'tOrZ',
    label: 'T or Z',
    description: 'Complete the top row plus a T or Z path down/across.',
    patterns: buildTOrZPatterns(),
    minPatternsRequired: 1,
  }),
  h: () => ({
    type: 'h',
    label: 'H',
    description: 'Fill the B and O columns plus the middle row.',
    patterns: [buildHPattern()],
    minPatternsRequired: 1,
  }),
  kite: () => ({
    type: 'kite',
    label: 'Kite',
    description: 'Complete a 2×2 top-corner block plus a diagonal tail.',
    patterns: buildKitePatterns(),
    minPatternsRequired: 1,
  }),
  arrowhead: () => ({
    type: 'arrowhead',
    label: 'Arrowhead',
    description: 'Complete a corner stamp pointing toward the center.',
    patterns: buildArrowheadPatterns(),
    minPatternsRequired: 1,
  }),
  outsideFrame: () => ({
    type: 'outsideFrame',
    label: 'Outside Frame',
    description: 'Cover every square along the outer edge of the card.',
    patterns: [buildOutsideFramePattern()],
    minPatternsRequired: 1,
  }),
  insideFrame: () => ({
    type: 'insideFrame',
    label: 'Inside Frame',
    description: 'Fill the inner 3×3 block, leaving the border empty.',
    patterns: [buildInsideFramePattern()],
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

/** All round slots selected. */
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
