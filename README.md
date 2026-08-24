# Bingo Lang!

A fun little bingo app para sa aking pamilya! Built with Expo and React Native.

Two ways to play. Deal yourself up to four cards and race ten invisible opponents, or run
the board as a caller for a room of people playing on paper.

## Getting started

Node 18 or newer, then:

```sh
npm install
npm start
```

Press `i` for the iOS simulator, `a` for an Android emulator, or scan the QR code with
[Expo Go](https://expo.dev/go). `npm run ios` and `npm run android` build and run natively
instead, which needs Xcode or Android Studio installed.

## How the game works

**Rounds.** The lobby lists fourteen rounds — Regular Bingo, Double Bingo, Postage Stamp,
6 Pack, Pyramid, Four Corners, X, T or Z, H, Kite, Arrowhead, Outside Frame, Inside Frame,
and Blackout. Tap any of them to include or exclude it; they play in a fixed order, and at
least one has to stay on. Each round deals fresh cards.

**Calling.** A ball is drawn every five seconds, and the one coming next peeks out a
quarter of the way through the interval. Settings offer speeds from 0.25× to 3×. Pausing
keeps the time remaining on the current interval rather than restarting it, and changing
speed while paused rescales what is left.

**Daubing.** Tap a space to mark it, or tap a column's letter to daub every called number
in that column. Auto mode daubs for you and back-fills anything already called. With
several cards in play, the carousel keeps the one closest to a bingo in front.

**Winning.** BINGO! is checked against the round's pattern and the spaces you actually
daubed — marking a number that has not been called never counts. A wrong call just resumes
the draw. An opponent can win first, which ends the round and shows you their card.

**Caller Only.** No cards are dealt. You draw each ball by hand and tap Declare Winner when
someone in the room calls it, which advances the lineup; declaring on the final round
returns to the lobby.

Dark mode is in the lobby under Appearance and survives a restart.

## Project layout

| Path | What lives there |
| --- | --- |
| `index.ts` | Entry point. Wraps the app in the safe-area, theme, and game providers. |
| `App.tsx` | Routes between the two screens, nothing else. |
| `src/game/` | The rules as pure functions: cards and decks, win checking, distance-to-bingo, the pattern builders, speed math. No React, and unit tested. |
| `src/hooks/` | `useBingoGame` composes the game from `useCardSet`, `useRoundProgression`, `useDaubs`, `useBallCaller`, `useWinDetection`, and `useGameFlow`. |
| `src/state/` | `GameContext` holds the lobby configuration and the game it feeds, so both screens read one value. |
| `src/screens/` | `LobbyScreen/` and `GameScreen/`, each with its styles, hooks, and sections. |
| `src/components/` | Shared UI, each in a folder with its styles, hooks, and subcomponents. |
| `src/theme/` | Palettes, the theme provider, and the screen container shared by both screens. |

Imports across areas use the `@/` alias (`@/game/card`); relative paths are for same-folder
siblings only.

## Checks

```sh
npm run typecheck   # tsc --noEmit
npm run lint:lines  # no file in src/ over 250 lines
npm test            # unit tests for src/game/
```

The line budget exists so any single file fits comfortably in a local model's context
window. [`AGENTS.md`](./AGENTS.md) documents it along with the seams to split along when a
file grows too big, and the conventions the code follows.

## Builds

Internal distribution builds go through [EAS](https://docs.expo.dev/build/introduction/):

```sh
eas build -p ios --profile preview
eas build -p android --profile preview
```
