import { GRID_SIZE } from '@/game/constants';
import { buildPreviewPatterns } from '@/game/patterns/previewPatterns';
import {
  ROUND_SEQUENCE,
  getRoundConfig,
  getRoundsForGame,
} from '@/game/patterns/roundConfigs';

describe('ROUND_SEQUENCE', () => {
  it('lists every round exactly once', () => {
    expect(new Set(ROUND_SEQUENCE).size).toBe(ROUND_SEQUENCE.length);
  });
});

describe('getRoundConfig', () => {
  it.each(ROUND_SEQUENCE)('builds a usable config for %s', (roundType) => {
    const round = getRoundConfig(roundType);

    expect(round.type).toBe(roundType);
    expect(round.label).not.toHaveLength(0);
    expect(round.description).not.toHaveLength(0);
    expect(round.patterns.length).toBeGreaterThan(0);
    expect(round.minPatternsRequired).toBeGreaterThanOrEqual(1);
    expect(round.patterns.length).toBeGreaterThanOrEqual(
      round.minPatternsRequired,
    );
  });

  it.each(ROUND_SEQUENCE)('keeps every %s cell on the card', (roundType) => {
    for (const pattern of getRoundConfig(roundType).patterns) {
      expect(pattern.cells.length).toBeGreaterThan(0);

      for (const { row, col } of pattern.cells) {
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThan(GRID_SIZE);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(GRID_SIZE);
      }
    }
  });

  it.each(ROUND_SEQUENCE)('gives %s patterns unique ids', (roundType) => {
    const { patterns } = getRoundConfig(roundType);
    const ids = new Set(patterns.map((pattern) => pattern.id));

    expect(ids.size).toBe(patterns.length);
  });

  it('asks for two patterns only in double bingo', () => {
    const multiPattern = ROUND_SEQUENCE.filter(
      (roundType) => getRoundConfig(roundType).minPatternsRequired > 1,
    );

    expect(multiPattern).toEqual(['doubleLine']);
    expect(getRoundConfig('doubleLine').minPatternsRequired).toBe(2);
  });

  it('offers rows, columns, and both diagonals for a single line', () => {
    expect(getRoundConfig('singleLine').patterns).toHaveLength(
      GRID_SIZE * 2 + 2,
    );
  });

  it('covers the whole card in a blackout', () => {
    const [pattern] = getRoundConfig('blackout').patterns;

    expect(pattern.cells).toHaveLength(GRID_SIZE * GRID_SIZE);
  });
});

describe('getRoundsForGame', () => {
  it('returns the selected rounds in play order regardless of input order', () => {
    const rounds = getRoundsForGame([3, 0, 1]);

    expect(rounds.map((round) => round.type)).toEqual([
      ROUND_SEQUENCE[0],
      ROUND_SEQUENCE[1],
      ROUND_SEQUENCE[3],
    ]);
  });

  it('does not mutate the caller’s selection', () => {
    const selection = [2, 1];
    getRoundsForGame(selection);

    expect(selection).toEqual([2, 1]);
  });

  it('returns nothing when no rounds are selected', () => {
    expect(getRoundsForGame([])).toEqual([]);
  });
});

describe('buildPreviewPatterns', () => {
  it('previews single-pattern rounds unchanged, keeping their labels', () => {
    const round = getRoundConfig('singleLine');

    expect(buildPreviewPatterns(round)).toBe(round.patterns);
  });

  it('previews every valid pair for double bingo', () => {
    const round = getRoundConfig('doubleLine');
    const patternCount = round.patterns.length;
    const previews = buildPreviewPatterns(round);

    expect(previews).toHaveLength((patternCount * (patternCount - 1)) / 2);
  });

  it('merges each pair into one layout without duplicate cells', () => {
    const previews = buildPreviewPatterns(getRoundConfig('doubleLine'));

    for (const preview of previews) {
      const keys = new Set(
        preview.cells.map(({ row, col }) => `${row}-${col}`),
      );

      expect(keys.size).toBe(preview.cells.length);
      expect(preview.label).toContain(' + ');
    }
  });
});
