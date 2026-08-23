import { generateCard, generateDeck } from '@/game/card';
import {
  BALLS_PER_COLUMN,
  CELL_COUNT,
  FREE_COL,
  FREE_INDEX,
  GRID_SIZE,
  TOTAL_BALLS,
  toFlatIndex,
} from '@/game/constants';

const SAMPLE_SIZE = 50;

describe('generateCard', () => {
  it('fills every cell and reserves exactly one free space at the center', () => {
    const card = generateCard();

    expect(card.grid).toHaveLength(CELL_COUNT);
    expect(card.grid[FREE_INDEX]).toBe('FREE');
    expect(card.grid.filter((cell) => cell === 'FREE')).toHaveLength(1);
  });

  it('gives each column unique numbers from its own range', () => {
    for (let sample = 0; sample < SAMPLE_SIZE; sample++) {
      const card = generateCard();

      for (let col = 0; col < GRID_SIZE; col++) {
        const min = col * BALLS_PER_COLUMN + 1;
        const max = min + BALLS_PER_COLUMN - 1;
        const numbers: number[] = [];

        for (let row = 0; row < GRID_SIZE; row++) {
          const cell = card.grid[toFlatIndex(row, col)];

          if (typeof cell === 'number') {
            numbers.push(cell);
          }
        }

        // The center column gives up one cell to the free space.
        expect(numbers).toHaveLength(
          col === FREE_COL ? GRID_SIZE - 1 : GRID_SIZE,
        );
        expect(new Set(numbers).size).toBe(numbers.length);
        expect(Math.min(...numbers)).toBeGreaterThanOrEqual(min);
        expect(Math.max(...numbers)).toBeLessThanOrEqual(max);
      }
    }
  });

  it('gives each card a distinct id', () => {
    const ids = new Set(
      Array.from({ length: SAMPLE_SIZE }, () => generateCard().id),
    );

    expect(ids.size).toBe(SAMPLE_SIZE);
  });
});

describe('generateDeck', () => {
  it('contains every ball exactly once', () => {
    const deck = generateDeck();

    expect(deck).toHaveLength(TOTAL_BALLS);
    expect([...deck].sort((a, b) => a - b)).toEqual(
      Array.from({ length: TOTAL_BALLS }, (_, index) => index + 1),
    );
  });

  it('shuffles the draw order', () => {
    expect(generateDeck()).not.toEqual(generateDeck());
  });
});
