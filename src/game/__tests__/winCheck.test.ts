import { getRoundConfig } from '@/game/patterns/roundConfigs';
import { checkWin, findWinningCard } from '@/game/winCheck';
import {
  ballsFor,
  cellDaubs,
  columnCells,
  createTestCard,
  rowCells,
} from './cardFixture';

const singleLine = getRoundConfig('singleLine');
const doubleLine = getRoundConfig('doubleLine');
const noDaubs = undefined;

describe('checkWin for NPC cards', () => {
  it('wins as soon as a full line is called, with no daubing', () => {
    const card = createTestCard();
    const drawn = new Set(ballsFor(card, rowCells(0)));

    expect(checkWin(card, drawn, false, noDaubs, singleLine)).toBe(true);
  });

  it('does not win on a partial line', () => {
    const card = createTestCard();
    const drawn = new Set(ballsFor(card, rowCells(0)).slice(0, 4));

    expect(checkWin(card, drawn, false, noDaubs, singleLine)).toBe(false);
  });

  it('counts the free space, so the center column needs only four balls', () => {
    const card = createTestCard();
    const balls = ballsFor(card, columnCells(2));

    expect(balls).toHaveLength(4);
    expect(checkWin(card, new Set(balls), false, noDaubs, singleLine)).toBe(true);
  });
});

describe('checkWin for the user', () => {
  it('requires the space to be daubed even once the ball is called', () => {
    const card = createTestCard();
    const drawn = new Set(ballsFor(card, rowCells(0)));

    expect(checkWin(card, drawn, true, new Set(), singleLine)).toBe(false);
    expect(checkWin(card, drawn, true, cellDaubs(rowCells(0)), singleLine)).toBe(
      true,
    );
  });

  it('ignores daubs on numbers that have not been called', () => {
    const card = createTestCard();

    expect(
      checkWin(card, new Set(), true, cellDaubs(rowCells(0)), singleLine),
    ).toBe(false);
  });
});

describe('double bingo', () => {
  it('needs two complete lines, not one', () => {
    const card = createTestCard();
    const oneRow = new Set(ballsFor(card, rowCells(0)));
    const twoRows = new Set([
      ...ballsFor(card, rowCells(0)),
      ...ballsFor(card, rowCells(1)),
    ]);

    expect(checkWin(card, oneRow, false, noDaubs, doubleLine)).toBe(false);
    expect(checkWin(card, twoRows, false, noDaubs, doubleLine)).toBe(true);
  });
});

describe('findWinningCard', () => {
  const neverDaubed = () => undefined;

  it('returns the first winning card and the cells that completed it', () => {
    const losing = createTestCard({ offset: 5, id: 'losing' });
    const winning = createTestCard({ offset: 0, id: 'winning' });
    const drawn = new Set(ballsFor(winning, rowCells(0)));

    const result = findWinningCard(
      [losing, winning],
      drawn,
      false,
      neverDaubed,
      singleLine,
    );

    expect(result?.cardIndex).toBe(1);
    expect(result?.card.id).toBe('winning');
    expect(result?.winningCells).toHaveLength(5);
    expect(result?.winningCells.every((cell) => cell.row === 0)).toBe(true);
  });

  it('returns null when nobody has won', () => {
    const card = createTestCard();

    expect(
      findWinningCard([card], new Set([1]), false, neverDaubed, singleLine),
    ).toBeNull();
  });

  it('merges both lines for a two-line round', () => {
    const card = createTestCard();
    const drawn = new Set([
      ...ballsFor(card, rowCells(0)),
      ...ballsFor(card, rowCells(1)),
    ]);

    const result = findWinningCard(
      [card],
      drawn,
      false,
      neverDaubed,
      doubleLine,
    );

    expect(result?.winningCells).toHaveLength(10);
  });

  it('checks each card against its own daubs', () => {
    const first = createTestCard({ offset: 0, id: 'first' });
    const second = createTestCard({ offset: 5, id: 'second' });
    const drawn = new Set([
      ...ballsFor(first, rowCells(0)),
      ...ballsFor(second, rowCells(0)),
    ]);
    // Only the second card's spaces were actually daubed.
    const daubsByCard = [new Set<string>(), cellDaubs(rowCells(0))];

    const result = findWinningCard(
      [first, second],
      drawn,
      true,
      (cardIndex) => daubsByCard[cardIndex],
      singleLine,
    );

    expect(result?.cardIndex).toBe(1);
  });
});
