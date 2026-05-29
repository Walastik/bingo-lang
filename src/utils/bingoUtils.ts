import { ACTIVE_WIN_PATTERNS } from './winPatterns';

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

/**
 * Check if a Bingo card has won based on drawn balls or user daubed spaces
 * @param card The Bingo card to check
 * @param drawnBalls Set of numbers drawn (for NPCs)
 * @param isUser If true, uses userDaubedSpaces instead of drawnBalls
 * @param userDaubedSpaces Set of space identifiers in format "row-col" (e.g., "0-2" for row 0, col 2)
 * @returns true if the card has a winning line, false otherwise
 */
export function checkWin(
  card: BingoCard,
  drawnBalls: Set<number>,
  isUser: boolean,
  userDaubedSpaces?: Set<string>
): boolean {
  const isCellMarked = (row: number, col: number): boolean => {
    if (row === 2 && col === 2) return true;

    const index = row * 5 + col;
    const cell = card.grid[index];

    if (isUser && userDaubedSpaces) {
      // User mode: must have called number AND daubed it
      if (typeof cell === 'number' && drawnBalls.has(cell)) {
        return userDaubedSpaces.has(`${row}-${col}`);
      }
      return false;
    } else {
      // NPC mode: only need the number to be drawn
      return typeof cell === 'number' && drawnBalls.has(cell);
    }
  };

  return ACTIVE_WIN_PATTERNS.some(pattern =>
    pattern.cells.every(({ row, col }) => isCellMarked(row, col))
  );
}

/**
 * Minimum number of uncalled balls still needed to complete any winning line.
 * Called-but-not-daubed cells count as 0 additional balls (manual) or as complete (auto).
 */
export function getBallsNeededForBingo(
  card: BingoCard,
  drawnBalls: Set<number>,
  cardIndex: number,
  userDaubs: Set<string>,
  isAutoMode: boolean,
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

  for (const pattern of ACTIVE_WIN_PATTERNS) {
    let needed = 0;

    for (const { row, col } of pattern.cells) {
      if (isCellMarked(row, col)) {
        continue;
      }

      const index = row * 5 + col;
      const cell = card.grid[index];

      if (typeof cell === 'number' && !drawnBalls.has(cell)) {
        needed += 1;
      }
    }

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
      );
      const neededB = getBallsNeededForBingo(
        cards[b],
        drawnBalls,
        b,
        userDaubs,
        isAutoMode,
      );

      if (neededA !== neededB) {
        return neededA - neededB;
      }

      return a - b;
    });
}