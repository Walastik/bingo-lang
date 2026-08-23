import { BALLS_PER_COLUMN, COLUMN_LETTERS } from '@/game/constants';

export type ColumnLetter = (typeof COLUMN_LETTERS)[number];

const LETTER_COLORS: Record<ColumnLetter, string> = {
  B: '#007AFF',
  I: '#34C759',
  N: '#FF3B30',
  G: '#FF9500',
  O: '#AF52DE',
};

const FALLBACK_COLOR = '#E0E0E0';

export function getColumnLetter(ball: number): ColumnLetter {
  const index = Math.floor((ball - 1) / BALLS_PER_COLUMN);
  const clamped = Math.min(Math.max(index, 0), COLUMN_LETTERS.length - 1);

  return COLUMN_LETTERS[clamped];
}

/** e.g. 9 -> "B-9". A null ball renders the pre-game placeholder. */
export const getBallString = (ball: number | null): string => {
  if (!ball) {
    return 'Ready...';
  }

  return `${getColumnLetter(ball)}-${ball}`;
};

/** Accepts a ball number or a column letter; unknown values get a neutral grey. */
export function getBallColor(value?: number | string): string {
  if (typeof value === 'number') {
    return LETTER_COLORS[getColumnLetter(value)];
  }

  if (typeof value !== 'string') {
    return FALLBACK_COLOR;
  }

  return LETTER_COLORS[value.toUpperCase() as ColumnLetter] ?? FALLBACK_COLOR;
}
