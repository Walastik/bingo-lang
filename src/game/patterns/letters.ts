import { WinPattern } from '@/game/types';
import {
  buildColumnCells,
  buildPrimaryDiagonalCells,
  buildRowCells,
  buildSecondaryDiagonalCells,
  dedupeCells,
} from './primitives';

/** Both diagonals crossing through the center free space. */
export const buildXPattern = (): WinPattern => ({
  id: 'x',
  label: 'X',
  cells: dedupeCells([
    ...buildPrimaryDiagonalCells(),
    ...buildSecondaryDiagonalCells(),
  ]),
});

const buildTPattern = (): WinPattern => ({
  id: 't',
  label: 'T',
  cells: [
    ...buildRowCells(0),
    ...buildColumnCells(2).filter((cell) => cell.row > 0),
  ],
});

const buildZPattern = (): WinPattern => ({
  id: 'z',
  label: 'Z',
  cells: [
    ...buildRowCells(0),
    { row: 1, col: 3 },
    { row: 2, col: 2 },
    { row: 3, col: 1 },
    ...buildRowCells(4),
  ],
});

/** Top row plus a T or Z path down/across the card. */
export const buildTOrZPatterns = (): WinPattern[] => [
  buildTPattern(),
  buildZPattern(),
];

/** First and last columns plus the middle row. */
export const buildHPattern = (): WinPattern => ({
  id: 'h',
  label: 'H',
  cells: dedupeCells([
    ...buildColumnCells(0),
    ...buildColumnCells(4),
    ...buildRowCells(2),
  ]),
});
