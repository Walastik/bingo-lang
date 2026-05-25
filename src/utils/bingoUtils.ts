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
  // Winning patterns: 5 in a row horizontally, vertically, or diagonally
  const winningPatterns = [
    // Rows
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    // Columns
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    // Diagonals
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ];

  // Function to check if a space is considered "marked"
  const isSpaceMarked = (index: number): boolean => {
    // Center space (index 12) is always marked as FREE
    if (index === 12) return true;
    
    // Handle NPCs vs user daubing
    if (isUser && userDaubedSpaces) {
      // For users, check if the space was manually daubed
      // Determine row and column for this index
      const row = Math.floor(index / 5);
      const col = index % 5;
      const spaceKey = `${row}-${col}`;
      return userDaubedSpaces.has(spaceKey);
    } else {
      // For NPCs, check if the number has been drawn
      const cell = card.grid[index];
      return typeof cell === 'number' && drawnBalls.has(cell);
    }
  };

  // Check each winning pattern
  for (const pattern of winningPatterns) {
    const isPatternFull = pattern.every(index => isSpaceMarked(index));
    if (isPatternFull) return true;
  }

  return false;
}