import { CellCoord, RoundConfig, WinPattern, getRoundConfig } from './winPatterns';

// src/types.ts

export interface BingoCard {
  id: string;
  grid: (number | 'FREE')[];
  daubed: boolean[]; // Array of 25 booleans indicating which cells are daubed
  columns: {
    B: number[];
    I: number[];
    N: number[];
    G: number[];
    O: number[];
  };
}

// src/bingoUtils.ts

/**
 * Generates a valid, randomized Bingo card
 */
export function generateCard(): BingoCard {
  // Helper function to generate unique random numbers in a range
  const getRandomNumbers = (min: number, max: number, count: number): number[] => {
    const numbers = new Set<number>();
    while (numbers.size < count) {
      numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return Array.from(numbers);
  };

  // Generate numbers for each column
  const bNumbers = getRandomNumbers(1, 15, 5);
  const iNumbers = getRandomNumbers(16, 30, 5);
  const nNumbers = getRandomNumbers(31, 45, 5);
  const gNumbers = getRandomNumbers(46, 60, 5);
  const oNumbers = getRandomNumbers(61, 75, 5);

  // Create the 5x5 grid (row-major order: rows 0-4, each with columns B-I-N-G-O)
  const grid: (number | 'FREE')[] = new Array(25);
  
  // Fill in columns
  for (let row = 0; row < 5; row++) {
    grid[row * 5 + 0] = bNumbers[row];
    grid[row * 5 + 1] = iNumbers[row];
    grid[row * 5 + 2] = row === 2 ? 'FREE' : nNumbers[row];
    grid[row * 5 + 3] = gNumbers[row];
    grid[row * 5 + 4] = oNumbers[row];
  }

  // Initialize daubed array (all false, except center which is always daubed)
  const daubed = new Array(25).fill(false);
  daubed[12] = true; // Center cell is always daubed (FREE)

  // Generate a unique ID for this card
  const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  return {
    id,
    grid,
    daubed,
    columns: {
      B: bNumbers,
      I: iNumbers,
      N: nNumbers,
      G: gNumbers,
      O: oNumbers,
    },
  };
}

/**
 * Generates a deck of numbers 1-75 in random order
 */
export function generateDeck(): number[] {
  const deck = Array.from({ length: 75 }, (_, i) => i + 1);
  
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

/**
 * Helper function to get the letter that matches the number param 
 * @param num The ball number (9)
 * @returns A string containing the letter and number like B-9
 */
export const getBallString = (num: number | null): string => {
  if (!num) return 'Ready...';
  if (num <= 15) return `B-${num}`;
  if (num <= 30) return `I-${num}`;
  if (num <= 45) return `N-${num}`;
  if (num <= 60) return `G-${num}`;
  return `O-${num}`;
};

/**
 * Helper function mapping a ball number or letter to a color
 * @param value The ball number (9) or letter
 * @returns A string which is a hex color like #FF3B30
 */
export function getBallColor(value?: number | string): string {
  if (typeof value === 'number') {
    if (value <= 15) {
      return '#007AFF'; // B
    } else if (value <= 30) {
      return '#34C759'; // I
    } else if (value <= 45) {
      return '#FF3B30'; // N
    } else if (value <= 60) {
      return '#FF9500'; // G
    } else {
      return '#AF52DE'; // O
    }
  }
  
  const letter = typeof value === 'string' ? value.toUpperCase() : null;
  switch (letter) {
    case 'B': return '#007AFF';
    case 'I': return '#34C759';
    case 'N': return '#FF3B30';
    case 'G': return '#FF9500';
    case 'O': return '#AF52DE';
    default: return '#E0E0E0';
  }
}

function createCellMarkedChecker(
  card: BingoCard,
  drawnBalls: Set<number>,
  isUser: boolean,
  userDaubedSpaces?: Set<string>,
) {
  return (row: number, col: number): boolean => {
    if (row === 2 && col === 2) return true;

    const index = row * 5 + col;
    const cell = card.grid[index];

    if (isUser && userDaubedSpaces) {
      if (typeof cell === 'number' && drawnBalls.has(cell)) {
        return userDaubedSpaces.has(`${row}-${col}`);
      }
      return false;
    }

    return typeof cell === 'number' && drawnBalls.has(cell);
  };
}

function isPatternComplete(
  pattern: RoundConfig['patterns'][number],
  isCellMarked: (row: number, col: number) => boolean,
): boolean {
  return pattern.cells.every(({ row, col }) => isCellMarked(row, col));
}

/**
 * Check if a Bingo card has won based on drawn balls or user daubed spaces.
 */
export function checkWin(
  card: BingoCard,
  drawnBalls: Set<number>,
  isUser: boolean,
  userDaubedSpaces?: Set<string>,
  roundConfig: RoundConfig = getRoundConfig('singleLine'),
): boolean {
  const isCellMarked = createCellMarkedChecker(card, drawnBalls, isUser, userDaubedSpaces);
  const completedPatterns = roundConfig.patterns.filter(pattern =>
    isPatternComplete(pattern, isCellMarked),
  );

  return completedPatterns.length >= roundConfig.minPatternsRequired;
}

export interface WinningCardResult {
  card: BingoCard;
  cardIndex: number;
  winningCells: CellCoord[];
}

function mergePatternCells(patterns: WinPattern[]): CellCoord[] {
  const cellMap = new Map<string, CellCoord>();

  for (const pattern of patterns) {
    for (const cell of pattern.cells) {
      cellMap.set(`${cell.row}-${cell.col}`, cell);
    }
  }

  return Array.from(cellMap.values());
}

function getCompletedPatterns(
  card: BingoCard,
  drawnBalls: Set<number>,
  isUser: boolean,
  userDaubedSpaces: Set<string> | undefined,
  roundConfig: RoundConfig,
): WinPattern[] {
  const isCellMarked = createCellMarkedChecker(card, drawnBalls, isUser, userDaubedSpaces);
  return roundConfig.patterns.filter(pattern => isPatternComplete(pattern, isCellMarked));
}

/**
 * Returns the first winning card and the cells that complete the active round pattern.
 */
export function findWinningCard(
  cards: BingoCard[],
  drawnBalls: Set<number>,
  isUser: boolean,
  getUserDaubsForCard: (cardIndex: number) => Set<string> | undefined,
  roundConfig: RoundConfig = getRoundConfig('singleLine'),
): WinningCardResult | null {
  for (let cardIndex = 0; cardIndex < cards.length; cardIndex++) {
    const card = cards[cardIndex];
    const userDaubedSpaces = isUser ? getUserDaubsForCard(cardIndex) : undefined;
    const completedPatterns = getCompletedPatterns(
      card,
      drawnBalls,
      isUser,
      userDaubedSpaces,
      roundConfig,
    );

    if (completedPatterns.length < roundConfig.minPatternsRequired) {
      continue;
    }

    const winningPatternGroup = completedPatterns.slice(0, roundConfig.minPatternsRequired);
    return {
      card,
      cardIndex,
      winningCells: mergePatternCells(winningPatternGroup),
    };
  }

  return null;
}

function getUncalledBallsNeededForCells(
  card: BingoCard,
  drawnBalls: Set<number>,
  cells: Array<{ row: number; col: number }>,
  isCellMarked: (row: number, col: number) => boolean,
): number {
  let needed = 0;

  for (const { row, col } of cells) {
    if (isCellMarked(row, col)) {
      continue;
    }

    const index = row * 5 + col;
    const cell = card.grid[index];

    if (typeof cell === 'number' && !drawnBalls.has(cell)) {
      needed += 1;
    }
  }

  return needed;
}

function getPatternGroups(roundConfig: RoundConfig): RoundConfig['patterns'][] {
  const { patterns, minPatternsRequired } = roundConfig;

  if (minPatternsRequired <= 1) {
    return patterns.map(pattern => [pattern]);
  }

  const groups: RoundConfig['patterns'][] = [];

  for (let i = 0; i < patterns.length; i++) {
    for (let j = i + 1; j < patterns.length; j++) {
      groups.push([patterns[i], patterns[j]]);
    }
  }

  return groups;
}

/**
 * Minimum number of uncalled balls still needed to complete the active round pattern.
 */
export function getBallsNeededForBingo(
  card: BingoCard,
  drawnBalls: Set<number>,
  cardIndex: number,
  userDaubs: Set<string>,
  isAutoMode: boolean,
  roundConfig: RoundConfig = getRoundConfig('singleLine'),
): number {
  const isCellMarked = (row: number, col: number): boolean => {
    if (row === 2 && col === 2) {
      return true;
    }

    const index = row * 5 + col;
    const cell = card.grid[index];

    if (typeof cell !== 'number') {
      return true;
    }

    if (!drawnBalls.has(cell)) {
      return false;
    }

    if (isAutoMode) {
      return true;
    }

    return userDaubs.has(`${cardIndex}-${row}-${col}`);
  };

  let minNeeded = 25;

  for (const patternGroup of getPatternGroups(roundConfig)) {
    const uniqueCells = new Map<string, { row: number; col: number }>();

    for (const pattern of patternGroup) {
      for (const cell of pattern.cells) {
        uniqueCells.set(`${cell.row}-${cell.col}`, cell);
      }
    }

    const needed = getUncalledBallsNeededForCells(
      card,
      drawnBalls,
      Array.from(uniqueCells.values()),
      isCellMarked,
    );

    minNeeded = Math.min(minNeeded, needed);
  }

  return minNeeded;
}

/**
 * Display order for user cards: closest to bingo first.
 */
export function sortCardIndicesByProximity(
  cards: BingoCard[],
  drawnBalls: Set<number>,
  userDaubs: Set<string>,
  isAutoMode: boolean,
  roundConfig: RoundConfig = getRoundConfig('singleLine'),
): number[] {
  return cards
    .map((_, index) => index)
    .sort((a, b) => {
      const neededA = getBallsNeededForBingo(
        cards[a],
        drawnBalls,
        a,
        userDaubs,
        isAutoMode,
        roundConfig,
      );
      const neededB = getBallsNeededForBingo(
        cards[b],
        drawnBalls,
        b,
        userDaubs,
        isAutoMode,
        roundConfig,
      );

      if (neededA !== neededB) {
        return neededA - neededB;
      }

      return a - b;
    });
}