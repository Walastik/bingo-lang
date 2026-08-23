import { RoundConfig, WinPattern } from '@/game/types';
import { getPatternGroups, mergeCells } from './primitives';

/**
 * Win layouts shown by the card preview toggle. Multi-pattern rounds (e.g.
 * double bingo) preview each valid combination as a single merged layout;
 * single-pattern rounds preview their patterns unchanged so the cycling
 * label keeps its original name.
 */
export const buildPreviewPatterns = (roundConfig: RoundConfig): WinPattern[] => {
  if (roundConfig.minPatternsRequired <= 1) {
    return roundConfig.patterns;
  }

  return getPatternGroups(roundConfig).map((group) => ({
    id: `preview-${group.map((pattern) => pattern.id).join('-')}`,
    label: group.map((pattern) => pattern.label).join(' + '),
    cells: mergeCells(group),
  }));
};
