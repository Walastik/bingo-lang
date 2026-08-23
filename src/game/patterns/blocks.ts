import { WinPattern } from '@/game/types';
import { buildColumnCells, buildRowCells, dedupeCells } from './primitives';

const buildCornerStamp = (
  id: string,
  label: string,
  topRow: number,
  leftCol: number,
): WinPattern => ({
  id,
  label,
  cells: [
    { row: topRow, col: leftCol },
    { row: topRow, col: leftCol + 1 },
    { row: topRow + 1, col: leftCol },
    { row: topRow + 1, col: leftCol + 1 },
  ],
});

/** 2x2 block in any corner of the card. */
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
      const cells = [];

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

/** Every square along the outer edge of the card. */
export const buildOutsideFramePattern = (): WinPattern => ({
  id: 'outside-frame',
  label: 'Outside frame',
  cells: dedupeCells([
    ...buildRowCells(0),
    ...buildRowCells(4),
    ...buildColumnCells(0).filter((cell) => cell.row > 0 && cell.row < 4),
    ...buildColumnCells(4).filter((cell) => cell.row > 0 && cell.row < 4),
  ]),
});

/** Inner 3x3 block with the outer border left empty. */
export const buildInsideFramePattern = (): WinPattern => ({
  id: 'inside-frame',
  label: 'Inside frame',
  cells: Array.from({ length: 9 }, (_, i) => ({
    row: Math.floor(i / 3) + 1,
    col: (i % 3) + 1,
  })),
});
