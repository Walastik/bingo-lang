export interface CellCoord {
  row: number;
  col: number;
}

/** A set of cells that wins when every one of them is marked. */
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

/**
 * `grid` is row-major: index `row * 5 + col`, with 'FREE' at the center.
 * Daub state is not stored here; it lives in the `userDaubs` set keyed by
 * `cardIndex-row-col` so one card object can be shared across renders.
 */
export interface BingoCard {
  id: string;
  grid: (number | 'FREE')[];
}

export interface WinningCardResult {
  card: BingoCard;
  cardIndex: number;
  winningCells: CellCoord[];
}

export type GameState =
  | 'lobby'
  | 'playing'
  | 'roundWon'
  | 'gameWon'
  | 'npcWon'
  | 'invalidBingo';

export type WinResult = WinningCardResult & { isNpc: boolean };
