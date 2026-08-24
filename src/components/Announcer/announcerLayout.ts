import { Platform } from 'react-native';
import { BALL_SIZES } from '@/components/BingoBall';

export const LARGE_BALL = BALL_SIZES.large;
export const SMALL_BALL = BALL_SIZES.small;
export const BALL_GAP = 10;

/** How many previously called balls the row shows. */
export const MAX_RECENT_BALLS = 3;

export const SLOT_WIDTH = SMALL_BALL + BALL_GAP;
export const RECENT_ROW_WIDTH =
  SMALL_BALL * MAX_RECENT_BALLS + BALL_GAP * (MAX_RECENT_BALLS - 1);

/** How far the outgoing ball travels from the current slot into the recents row. */
export const SLIDE_DISTANCE = LARGE_BALL / 2 + BALL_GAP + SMALL_BALL / 2;

export const TRANSITION_MS = 460;

/** Fraction of the transition spent shrinking before the slide starts. */
export const SHRINK_PHASE_END = 0.4;

export const FADE_IN_MS = 220;

export const IS_ANDROID = Platform.OS === 'android';
