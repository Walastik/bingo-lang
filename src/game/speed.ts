export const GAME_SPEED_OPTIONS = [0.25, 0.5, 1, 2, 3] as const;

export type GameSpeed = (typeof GAME_SPEED_OPTIONS)[number];

const BALL_DRAW_INTERVAL_MS = 5000;

/** Fraction of the draw interval after which the next ball is revealed. */
const UPCOMING_BALL_REVEAL_RATIO = 0.25;

export const getBallDrawIntervalMs = (speed: GameSpeed): number =>
  BALL_DRAW_INTERVAL_MS / speed;

export const getUpcomingBallRevealDelayMs = (speed: GameSpeed): number =>
  getBallDrawIntervalMs(speed) * UPCOMING_BALL_REVEAL_RATIO;
