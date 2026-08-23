import { getRoundConfig } from '@/game/patterns/roundConfigs';
import {
  getBallsNeededForBingo,
  sortCardIndicesByProximity,
} from '@/game/proximity';
import { ballsFor, cardDaubs, createTestCard, rowCells } from './cardFixture';

const singleLine = getRoundConfig('singleLine');
const blackout = getRoundConfig('blackout');

describe('getBallsNeededForBingo', () => {
  it('needs four balls on a fresh card, because the best line crosses the free space', () => {
    const card = createTestCard();

    expect(
      getBallsNeededForBingo(card, new Set(), 0, new Set(), false, singleLine),
    ).toBe(4);
  });

  it('counts down as balls are called', () => {
    const card = createTestCard();
    const rowBalls = ballsFor(card, rowCells(0));
    const daubs = cardDaubs(0, rowCells(0));

    const afterFour = getBallsNeededForBingo(
      card,
      new Set(rowBalls.slice(0, 4)),
      0,
      daubs,
      true,
      singleLine,
    );
    const afterAll = getBallsNeededForBingo(
      card,
      new Set(rowBalls),
      0,
      daubs,
      true,
      singleLine,
    );

    expect(afterFour).toBe(1);
    expect(afterAll).toBe(0);
  });

  it('needs every uncalled space for a blackout', () => {
    const card = createTestCard();

    expect(
      getBallsNeededForBingo(card, new Set(), 0, new Set(), false, blackout),
    ).toBe(24);
  });

  /**
   * The metric deliberately counts *uncalled* balls, so a called-but-undaubed
   * space is already "paid for". Daub state and auto mode therefore do not
   * change the result today.
   */
  it('measures uncalled balls only, so daub state does not change the count', () => {
    const card = createTestCard();
    const drawn = new Set(ballsFor(card, rowCells(0)).slice(0, 4));

    const undaubed = getBallsNeededForBingo(
      card,
      drawn,
      0,
      new Set(),
      false,
      singleLine,
    );
    const autoDaubed = getBallsNeededForBingo(
      card,
      drawn,
      0,
      new Set(),
      true,
      singleLine,
    );
    const manuallyDaubed = getBallsNeededForBingo(
      card,
      drawn,
      0,
      cardDaubs(0, rowCells(0)),
      false,
      singleLine,
    );

    expect([undaubed, autoDaubed, manuallyDaubed]).toEqual([1, 1, 1]);
  });
});

describe('sortCardIndicesByProximity', () => {
  it('puts the card closest to bingo first', () => {
    const behind = createTestCard({ offset: 0, id: 'behind' });
    const ahead = createTestCard({ offset: 5, id: 'ahead' });
    const drawn = new Set(ballsFor(ahead, rowCells(0)));

    expect(
      sortCardIndicesByProximity(
        [behind, ahead],
        drawn,
        new Set(),
        true,
        singleLine,
      ),
    ).toEqual([1, 0]);
  });

  it('breaks ties by card index', () => {
    const cards = [
      createTestCard({ id: 'a' }),
      createTestCard({ id: 'b' }),
      createTestCard({ id: 'c' }),
    ];

    expect(
      sortCardIndicesByProximity(cards, new Set(), new Set(), true, singleLine),
    ).toEqual([0, 1, 2]);
  });

  it('returns an empty order for no cards', () => {
    expect(
      sortCardIndicesByProximity([], new Set(), new Set(), false, singleLine),
    ).toEqual([]);
  });
});
