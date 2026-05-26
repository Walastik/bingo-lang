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
  // Helper to check if a cell at (row, col) is marked
  const isCellMarked = (row: number, col: number): boolean => {
    // Center free space is always marked
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

  // Check all rows
  for (let row = 0; row < 5; row++) {
    let rowFull = true;
    for (let col = 0; col < 5; col++) {
      if (!isCellMarked(row, col)) {
        rowFull = false;
        break;
      }
    }
    if (rowFull) return true;
  }

  // Check all columns
  for (let col = 0; col < 5; col++) {
    let colFull = true;
    for (let row = 0; row < 5; row++) {
      if (!isCellMarked(row, col)) {
        colFull = false;
        break;
      }
    }
    if (colFull) return true;
  }

  // Check diagonals
  // Top-left to bottom-right
  let diagonal1 = true;
  for (let i = 0; i < 5; i++) {
    if (!isCellMarked(i, i)) {
      diagonal1 = false;
      break;
    }
  }
  if (diagonal1) return true;

  // Top-right to bottom-left
  let diagonal2 = true;
  for (let i = 0; i < 5; i++) {
    if (!isCellMarked(i, 4 - i)) {
      diagonal2 = false;
      break;
    }
  }
  if (diagonal2) return true;

  return false;
}