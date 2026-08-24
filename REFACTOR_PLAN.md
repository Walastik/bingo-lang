# 250-Line Refactor Plan

Goal: no file in `App.tsx`, `index.ts`, or `src/` exceeds 250 lines, so a local model can read any
file in one pass. No behavior changes. Verify each phase with `npm run typecheck` and
`npm run lint:lines`.

Starting point: 4,637 lines / 17 files, 8 files over budget.

## Phase 0 — Guardrails and baseline

- [x] Baseline `npx tsc --noEmit` passes
- [x] `scripts/check-file-lines.mjs` reports files over 250 lines (warns over 225)
- [x] `npm run typecheck` and `npm run lint:lines` added to `package.json`
- [x] Script confirms exactly the 8 expected offenders
- [x] `@/*` → `./src/*` alias added to `tsconfig.json`; verified with `tsc` **and** a real Metro
      bundle (`expo export`, 601 modules). No `baseUrl`, to avoid shadowing node modules.
- [x] `AGENTS.md` documents the budget, split seams, and conventions

## Phase 1 — Pure game logic (`src/game/`)

- [x] `types.ts` — `BingoCard`, `WinningCardResult`, `CellCoord`, `WinPattern`, `RoundType`,
      `RoundConfig`, `GameState`, `WinResult`
- [x] `constants.ts` — board geometry plus the `cellKey`/`daubKey` builders
- [x] `speed.ts` — `GAME_SPEED_OPTIONS`, `GameSpeed`, draw-interval math (split out of the planned
      `constants.ts`, which was becoming a grab bag; Phase 4's `useBallCaller` imports just this)
- [x] `card.ts` — `generateCard`, `generateDeck`
- [x] `ballFormat.ts` — `getBallString`, `getBallColor`
- [x] `winCheck.ts` — cell-marked checker, `checkWin`, `findWinningCard`
- [x] `proximity.ts` — `getBallsNeededForBingo`, `sortCardIndicesByProximity`
- [x] `patterns/primitives.ts` — row/col/diagonal cells, `dedupeCells`, `mergeCells`,
      `getPatternGroups`
- [x] `patterns/lines.ts`, `blocks.ts`, `letters.ts`, `figures.ts` — the 14 pattern builders
- [x] `patterns/roundConfigs.ts` — `ROUND_SEQUENCE`, builder registry, `getRoundConfig`,
      `getRoundsForGame`
- [x] `patterns/previewPatterns.ts` — `buildPreviewPatterns`
- [x] `jest-expo` installed; `npm test` added. No `moduleNameMapper` needed: the preset derives it
      from `tsconfig.json` paths. `testMatch` is scoped to `src/**/*.test.ts` so fixtures can live
      in `__tests__` without being collected as suites.
- [x] 74 tests across `card`, `winCheck`, `proximity`, and `roundConfigs`
- [x] All import sites migrated to `@/`; `src/utils/` deleted
- [x] Dead code deleted: `ACTIVE_WIN_PATTERNS`, `MAX_ROUNDS`, `DEFAULT_ROUND_SELECTION`,
      `BingoCell.tsx`, and `BingoCard.daubed` / `BingoCard.columns` (written by `generateCard`,
      never read — daubs live in the `userDaubs` set)
- [x] Three duplications collapsed: the merge-cells helper, the pattern-pairing helper, and
      `CalledBallsBoard`'s own copy of the column letters and ball ranges
- [x] `roundConfig` is now a required parameter on `checkWin`, `findWinningCard`, and the proximity
      functions. It silently defaulted to single-line before; every caller already passed it.

### Open question raised by the tests

`getBallsNeededForBingo` takes `userDaubs` and `isAutoMode`, but they cannot change its result: it
counts only *uncalled* balls, and a called-but-undaubed space is skipped either way. So carousel
ordering ignores whether you have actually daubed. Current behavior is locked in by a test. Decide
whether missed daubs should push a card down the order before removing the parameters.

## Phase 2 — Style extraction

Mechanical: `createStyles(colors)` → `<Component>.styles.ts`, call site unchanged.

- [x] Every component moved into its own folder (`Announcer/Announcer.tsx` + `index.ts` re-export)
      rather than leaving `<Component>.styles.ts` as a flat sibling. Phase 3 splits these same
      components, so this is the destination either way, and the `index.ts` keeps the import
      specifier (`@/components/Announcer`) identical — **no call site changed at all.**
- [x] `Announcer` — `announcerLayout.ts` extracted first (both the styles and Phase 3's animation
      hook need the constants; a direct import between them would be circular). 559 → 400
- [x] `WinningCardView` 314 → 230, `BingoCardView` 297 → 197, `BingoCardCarousel` 261 → 189
- [x] `App.tsx` — lobby styles → `LobbyScreen.styles.ts`, game styles → `GameScreen.styles.ts`,
      shared container → `src/theme/screenStyles.ts`. 689 → 441
- [x] `CalledBallsBoard`, `GameSettingsModal`, `WinnerOverlay`, `DeclareWinnerModal` — for
      consistency, so "styles live in `.styles.ts`" holds with no exceptions
- [x] `BingoBall` left flat: its styles are static rather than theme-derived, and it is 66 lines
- [x] Verified every moved declaration is byte-identical to the previous commit, by extracting and
      diffing the property lines mechanically. This is what rules out theme bugs; `tsc` catches a
      dropped *key* but never a mistyped *value*, and there is no UI test coverage.
- [ ] Still worth a visual pass in light **and** dark mode

### Deduplication that fell out of it

- `cardGridLayout.ts` — `GRID_GAP` and `getCellSize` were duplicated in both card views. The gap is
  needed by the styles *and* the component, so it had to be shared rather than file-local.
- `BALL_SIZES` now comes from `BingoBall`, which owns the rendered diameter. `Announcer` previously
  hardcoded matching `120`/`50` in its slide math, where a change to the ball would have silently
  desynced the animation. Direction matters: the layout depends on the ball, not the reverse.
- `MAX_RECENT_BALLS` replaces four separate `3`s (slice, width, shift guard, count label).
- `SECTION_MAX_WIDTH` replaces six `maxWidth: 360`s that must agree for the lobby to line up.
- `App.tsx` picked up `TOTAL_BALLS` and a new `fromFlatIndex`, replacing a hardcoded `75` and a
  hand-rolled `flatIndex / 5` — both of which `AGENTS.md` had just forbidden.

## Phase 3 — Component decomposition

Folders and the shared-layout module already existed, so every item was additive.

- [x] `Announcer/` → `useBallTransition.ts`, `AnnouncerControls.tsx`, `CurrentBallStage.tsx`,
      `RecentBallsRow.tsx`, `CalledBallsSummary.tsx`, plus an unplanned `NextBallWindow.tsx`: the
      controls and the next-ball box are one visual column but have nothing else in common.
      400 → 113, the last component over budget.
- [x] `BingoCardView/` → `useWinPreview.ts`, `BingoCardCell.tsx` (197 → 85)
- [x] `WinningCardView/` → `useWinCardAnimation.ts`, `WinningCardCell.tsx` (230 → 120)
- [x] `CardHeaderRow.tsx` — one shared B-I-N-G-O header. The two copies were identical apart from
      the play card's tappable columns, so it takes an optional `onColumnPress`. Flat rather than
      foldered, like `BingoBall`: one file, static styles, no theme.
- [x] `useGridCellSize.ts` — shared `onLayout` → `cellSize` hook wrapping `getCellSize`
- [x] `BingoCardCarousel/` → `useCarouselPaging.ts`, `CarouselControls.tsx` (189 → 125)
- [x] `WinnerOverlay/winnerCopy.ts` — pure title/message/ownerLabel. Replaces three stacked
      ternaries with `switch` on the state, so a new state is a compile error rather than a silent
      fallthrough. Now covered by 10 tests, which is the payoff for making it pure.
- [x] `CalledBallsBoard/BallGrid.tsx` — the 15×5 grid
- [x] Subcomponents receive the parent's `styles` object rather than calling `createStyles`. A
      25-cell grid would otherwise build 25 stylesheets per card.

Largest file in `src/components/` is now 171 lines (`useBallTransition.ts`), down from 400.

## Phase 4 — Decompose `useBingoGame` (risky: timers, refs, state machine)

Do last among code splits. Key seam: `useBallCaller` owns drawing/scheduling and knows nothing
about winning — it asks its owner via `onBallDrawn(ball, drawnSet) => 'continue' | 'stop'`.

- [x] `useLatestRef.ts` — replaces 5 of the 8 ref-sync effects (`gameState`, `currentRound`,
      round count, user cards, NPC cards). The other three — `isPaused`, `isAutoMode`, `gameSpeed` —
      and the round index keep writing their ref at the mutation site, because each is read again
      in the same tick that sets it. Doing those through an effect would break pause/resume.
- [x] `useCardSet.ts` — user/NPC cards, refs, `generateFreshCards`
- [x] `useRoundProgression.ts` — round list, index, `advanceRound`, `resetRounds`, `isFinalRound`
- [x] `useDaubs.ts` — daub set, column auto-daub, auto mode. Takes the called balls as an
      argument instead of reading the caller's ref, which is what keeps the hooks acyclic:
      `useBallCaller` needs `onBallDrawn`, so it has to be created after everything it notifies.
- [x] `usePausableTimeout.ts` — not in the original plan. The draw timer and the reveal timer had
      the same 30 lines of clear/hold/rescale plumbing twice over; one primitive holds it now, and
      `useBallCaller` came in over budget without it.
- [x] `useBallCaller.ts` — deck, draw loop, upcoming-ball reveal, pause/resume, speed scaling
- [x] `useWinDetection.ts` — `winResult`, `recordUserWin`, `recordNpcWin`, `userHasBingo`,
      `npcHasWon`. `callBingo` had its own inline copy of the per-card daub extraction; both now
      go through `getUserDaubsForCard`.
- [x] `useGameFlow.ts` — the state machine: every lobby/play/win transition. Split out of the
      composer, which was 304 lines with them inlined.
- [x] `useBingoGame.ts` — owns `gameState` only; composes the six hooks
- [x] Returns the same object shape minus unused `npcCards`. `App.tsx` is untouched and `tsc`
      passes, and it is the hook's only consumer — that is the proof the split is faithful.
- [x] Full manual QA pass

Two deliberate behavior changes, both in paths the old code could reach but never acted on:

- A win now stops the loop synchronously via the `'stop'` verdict. The old code re-read
  `gameStateRef` right after drawing, but that ref updates in an effect, so it still scheduled one
  more timer that then bailed out on its own guard. Same outcome, one less orphaned timer.
- `pause()` with no draw timer pending now discards the stale remainder instead of keeping it.
  Unreachable while playing, since every tick schedules the next before returning.

`useBingoGame` is 177 lines, down from 621. Largest piece is `useBallCaller` at 215.

## Phase 5 — Split `App.tsx` into screens

`src/screens/LobbyScreen/` and `src/screens/GameScreen/` already hold each screen's styles; this
phase moves the matching JSX in beside them and `App.tsx` stops importing both.

- [x] `useLobbyConfig.ts` — card count, caller-only, round selection + "keep one round" guard
- [x] `state/GameContext.tsx` — provider and hook in one file, following `ThemeContext.tsx`, rather
      than the planned two. The value type is `ReturnType` of the two hooks intersected, so adding
      a field reaches the screens without a second declaration to keep in step.
- [x] Wrap `<App />` in `<GameProvider>` inside `index.ts`
- [x] `LobbyScreen/` → `ModeSelector`, `CardCountSelector`, `RoundLineupList`, `AppearanceSection`
- [x] `GameScreen/` → `useGameScreenModals.ts` (modal state, pause coupling, quit alert),
      `GameHeader.tsx`, `BingoButton.tsx`
- [x] Fix `previewPatterns` memo: it read `currentRound` but depended only on `currentRound.type`.
      Depends on `currentRound` now, whose identity is already stable per round.
- [x] `App.tsx` → routes lobby vs game only, 11 lines

The context value is **not** memoized, against the plan. Every field on it is state owned by the
provider, so a re-render there always means the value changed, and `children` comes from `Root`,
which never re-renders — a `useMemo` would look like it was earning something while never hitting.
The real win is that modal state moved into `GameScreen`, so opening settings no longer re-renders
the provider and every screen under it.

`AppearanceSection` reads `useTheme()` instead of taking props, the one exception to the
leaf-takes-props convention: the theme is its whole subject, and `Switch` needs a color that no
style prop carries.

Verified beyond `tsc`: all 42 style keys the old `App.tsx` referenced are still referenced, and all
55 JSX props it passed are still passed. Metro bundles the new graph at 670 modules.

## Phase 6 — Final verification

- [x] `npm run typecheck` clean, `npm run lint:lines` clean (92 files, largest 216), `npm test`
      passing (84 tests)
- [x] No `src/utils/`. Every module in `src/` is imported by something — checked by resolving each
      file's basename against the import statements in the repo, not by eye.
- [x] Ten `index.ts` barrels remain, one per component and screen folder, each imported exactly
      once. They are the seam that lets a folder be split further without touching its consumers,
      so they stay.
- [x] Eight exports that nothing outside their own module used are now module-private: the four
      single-line pattern builders behind `buildSingleLineWinPatterns`, `createCellMarkedChecker`
      and `getCompletedPatterns` behind `checkWin`, and `ColumnLetter`/`getColumnLetter` behind
      `getBallString`. Smaller public surfaces make a module's purpose legible in one pass.
- [x] Five unused exports kept on purpose: `FREE_ROW`, whose other half `FREE_COL` the tests
      import, and the four `.styles.ts` `ReturnType` exports, which are the documented convention
      and return the moment a component gains a subcomponent.
- [x] `README.md` rewritten. The template described an `app/` directory and Expo Router this
      project never used, and trailed off into a pasted `.gitignore` after an unclosed code fence.

`proximity.ts` keeps its own cell-marked checker rather than sharing `winCheck`'s: with auto-daub
on, a called-but-undaubed space counts toward distance-to-bingo but never toward a win. It reuses
only the `CellMarkedChecker` type. Left as is — the duplication is the point.

## Manual QA checklist

Run after Phase 4 and Phase 5. There is no UI test coverage.

- [x] Lobby: mode toggle; card count 1–4; the last selected round cannot be deselected;
      dark mode persists across restart
- [x] Balls auto-draw every 5s; next-ball window reveals partway through; shrink-and-slide
      animation lands the ball in the recents row
- [x] Pause mid-interval, wait, resume — remaining delay preserved, not restarted
- [x] Change speed while paused — remaining delay scales by old/new ratio
- [x] Auto-daub back-fills previously drawn balls; column header daubs only called numbers
- [x] Valid BINGO advances the round; invalid shows overlay and Continue resumes drawing
- [x] NPC win stops the timer and shows the NPC card with highlighted cells
- [x] Multi-card: closest-to-bingo ordering; arrows and swipe agree on index
- [x] Caller Only: manual next ball; Declare Winner advances; final round returns to lobby
- [x] Settings pauses during play and resumes on close; Quit returns to lobby

Passed on device after Phase 4 and again after Phase 5.

## Where it ended up

| | Before | After |
| --- | --- | --- |
| Files over 250 lines | 8 | 0 |
| Largest file | 686 (`App.tsx`) | 216 (`useBallCaller.ts`) |
| `App.tsx` | 686 | 11 |
| `useBingoGame.ts` | 640 | 177 |
| Unit tests | 0 | 84 |

The two files that started largest are now a router and a composition root. Everything they used
to hold is in a file named after the one thing it does.
