import { CELL_COUNT, GRID_SIZE } from '@/game/constants';
import { WinPattern } from '@/game/types';

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

/** 2x2 corner block plus a diagonal tail to the opposite corner. */
export const buildKitePatterns = (): WinPattern[] => [
  {
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
  },
  {
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
  },
];

/** Corner stamp with a space stepping toward the center. */
export const buildArrowheadPatterns = (): WinPattern[] => [
  {
    id: 'arrow-tl',
    label: 'Top-left arrowhead',
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 2, col: 2 },
    ],
  },
  {
    id: 'arrow-tr',
    label: 'Top-right arrowhead',
    cells: [
      { row: 0, col: 3 },
      { row: 0, col: 4 },
      { row: 1, col: 3 },
      { row: 1, col: 4 },
      { row: 2, col: 2 },
    ],
  },
  {
    id: 'arrow-bl',
    label: 'Bottom-left arrowhead',
    cells: [
      { row: 3, col: 0 },
      { row: 3, col: 1 },
      { row: 4, col: 0 },
      { row: 4, col: 1 },
      { row: 2, col: 2 },
    ],
  },
  {
    id: 'arrow-br',
    label: 'Bottom-right arrowhead',
    cells: [
      { row: 3, col: 3 },
      { row: 3, col: 4 },
      { row: 4, col: 3 },
      { row: 4, col: 4 },
      { row: 2, col: 2 },
    ],
  },
];

/** Every space on the card. */
export const buildBlackoutPattern = (): WinPattern => ({
  id: 'blackout',
  label: 'Blackout',
  cells: Array.from({ length: CELL_COUNT }, (_, i) => ({
    row: Math.floor(i / GRID_SIZE),
    col: i % GRID_SIZE,
  })),
});
