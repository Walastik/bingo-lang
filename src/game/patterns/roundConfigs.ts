import { RoundConfig, RoundType } from '@/game/types';
import {
  buildInsideFramePattern,
  buildOutsideFramePattern,
  buildPostageStampPatterns,
  buildSixPackPatterns,
} from './blocks';
import {
  buildArrowheadPatterns,
  buildBlackoutPattern,
  buildFourCornersPattern,
  buildKitePatterns,
  buildPyramidPatterns,
} from './figures';
import { buildHPattern, buildTOrZPatterns, buildXPattern } from './letters';
import { buildSingleLineWinPatterns } from './lines';

/** Play order of the rounds offered in the lobby. */
export const ROUND_SEQUENCE: RoundType[] = [
  'singleLine',
  'doubleLine',
  'postageStamp',
  'sixPack',
  'pyramid',
  'fourCorners',
  'x',
  'tOrZ',
  'h',
  'kite',
  'arrowhead',
  'outsideFrame',
  'insideFrame',
  'blackout',
];

const roundConfigBuilders: Record<RoundType, () => RoundConfig> = {
  singleLine: () => ({
    type: 'singleLine',
    label: 'Regular Bingo',
    description: 'Complete any row, column, or diagonal.',
    patterns: buildSingleLineWinPatterns(),
    minPatternsRequired: 1,
  }),
  doubleLine: () => ({
    type: 'doubleLine',
    label: 'Double Bingo',
    description: 'Complete any two lines (rows, columns, or diagonals).',
    patterns: buildSingleLineWinPatterns(),
    minPatternsRequired: 2,
  }),
  postageStamp: () => ({
    type: 'postageStamp',
    label: 'Postage Stamp',
    description: 'Complete a 2×2 block in any corner.',
    patterns: buildPostageStampPatterns(),
    minPatternsRequired: 1,
  }),
  sixPack: () => ({
    type: 'sixPack',
    label: '6 Pack',
    description: 'Complete two adjacent columns across three consecutive rows.',
    patterns: buildSixPackPatterns(),
    minPatternsRequired: 1,
  }),
  pyramid: () => ({
    type: 'pyramid',
    label: 'Pyramid',
    description: 'Complete the top or bottom pyramid pattern.',
    patterns: buildPyramidPatterns(),
    minPatternsRequired: 1,
  }),
  fourCorners: () => ({
    type: 'fourCorners',
    label: 'Four Corners',
    description: 'Cover the four outermost corners of the card.',
    patterns: [buildFourCornersPattern()],
    minPatternsRequired: 1,
  }),
  x: () => ({
    type: 'x',
    label: 'X',
    description: 'Complete both diagonals crossing through the center.',
    patterns: [buildXPattern()],
    minPatternsRequired: 1,
  }),
  tOrZ: () => ({
    type: 'tOrZ',
    label: 'T or Z',
    description: 'Complete the top row plus a T or Z path down/across.',
    patterns: buildTOrZPatterns(),
    minPatternsRequired: 1,
  }),
  h: () => ({
    type: 'h',
    label: 'H',
    description: 'Fill the B and O columns plus the middle row.',
    patterns: [buildHPattern()],
    minPatternsRequired: 1,
  }),
  kite: () => ({
    type: 'kite',
    label: 'Kite',
    description: 'Complete a 2×2 top-corner block plus a diagonal tail.',
    patterns: buildKitePatterns(),
    minPatternsRequired: 1,
  }),
  arrowhead: () => ({
    type: 'arrowhead',
    label: 'Arrowhead',
    description: 'Complete a corner stamp pointing toward the center.',
    patterns: buildArrowheadPatterns(),
    minPatternsRequired: 1,
  }),
  outsideFrame: () => ({
    type: 'outsideFrame',
    label: 'Outside Frame',
    description: 'Cover every square along the outer edge of the card.',
    patterns: [buildOutsideFramePattern()],
    minPatternsRequired: 1,
  }),
  insideFrame: () => ({
    type: 'insideFrame',
    label: 'Inside Frame',
    description: 'Fill the inner 3×3 block, leaving the border empty.',
    patterns: [buildInsideFramePattern()],
    minPatternsRequired: 1,
  }),
  blackout: () => ({
    type: 'blackout',
    label: 'Blackout',
    description: 'Daub every space on the card.',
    patterns: [buildBlackoutPattern()],
    minPatternsRequired: 1,
  }),
};

export const getRoundConfig = (roundType: RoundType): RoundConfig =>
  roundConfigBuilders[roundType]();

/** Rounds for a game, given the lobby's selected indices into ROUND_SEQUENCE. */
export const getRoundsForGame = (selectedIndices: number[]): RoundConfig[] =>
  selectedIndices
    .slice()
    .sort((a, b) => a - b)
    .map((index) => getRoundConfig(ROUND_SEQUENCE[index]));
