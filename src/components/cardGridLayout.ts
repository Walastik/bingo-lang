import { GRID_SIZE } from '@/game/constants';

/** Gap between cells. Shared by the play grid and the winning-card grid. */
export const GRID_GAP = 4;

/** Largest square cell that fits `width`, or 0 before layout has measured. */
export const getCellSize = (width: number): number =>
  width <= 0 ? 0 : Math.floor((width - GRID_GAP * (GRID_SIZE - 1)) / GRID_SIZE);
