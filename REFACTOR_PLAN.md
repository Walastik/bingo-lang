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

- [ ] `useLatestRef.ts` — replaces 8 hand-written ref-sync effects
- [ ] `useCardSet.ts` — user/NPC cards, refs, `generateFreshCards`
- [ ] `useRoundProgression.ts` — round list, index, `advanceRound`, `resetRounds`, `isFinalRound`
- [ ] `useDaubs.ts` — daub set, column auto-daub, auto mode
- [ ] `useBallCaller.ts` — deck, draw timer, upcoming-ball reveal, pause/resume, speed scaling
- [ ] `useWinDetection.ts` — `winResult`, `recordUserWin`, `recordNpcWin`, `evaluateUserBingo`
- [ ] `useBingoGame.ts` — owns `gameState` only; composes the five hooks
- [ ] Return the **exact same object shape** (minus unused `npcCards`) so `App.tsx` compiles
      untouched — that's the proof the split is faithful
- [ ] Full manual QA pass

## Phase 5 — Split `App.tsx` into screens

`src/screens/LobbyScreen/` and `src/screens/GameScreen/` already hold each screen's styles; this
phase moves the matching JSX in beside them and `App.tsx` stops importing both.

- [ ] `useLobbyConfig.ts` — card count, caller-only, round selection + "keep one round" guard
- [ ] `state/GameProvider.tsx` + `useGameContext.ts` — composes lobby config and game state into
      one memoized context, replacing a ~20-value prop drill
- [ ] Wrap `<App />` in `<GameProvider>` inside `index.ts`
- [ ] `LobbyScreen/` → `ModeSelector`, `CardCountSelector`, `RoundLineupList`, `AppearanceSection`
- [ ] `GameScreen/` → `useGameScreenModals.ts` (modal state, pause coupling, quit alert),
      `GameHeader.tsx`, `BingoButton.tsx`
- [ ] Fix `previewPatterns` memo: it reads `currentRound` but depends only on `currentRound.type`
- [ ] `App.tsx` → routes lobby vs game only

## Phase 6 — Final verification

- [ ] `npm run lint:lines` clean, `npm run typecheck` clean, `npm test` passing
- [ ] No `src/utils/`, no leftover barrel files
- [ ] `README.md` rewritten — it is still the untouched template, describing an `app/` directory
      and Expo Router that this project has never used

## Manual QA checklist

Run after Phase 4 and Phase 5. There is no UI test coverage.

- [ ] Lobby: mode toggle; card count 1–4; the last selected round cannot be deselected;
      dark mode persists across restart
- [ ] Balls auto-draw every 5s; next-ball window reveals partway through; shrink-and-slide
      animation lands the ball in the recents row
- [ ] Pause mid-interval, wait, resume — remaining delay preserved, not restarted
- [ ] Change speed while paused — remaining delay scales by old/new ratio
- [ ] Auto-daub back-fills previously drawn balls; column header daubs only called numbers
- [ ] Valid BINGO advances the round; invalid shows overlay and Continue resumes drawing
- [ ] NPC win stops the timer and shows the NPC card with highlighted cells
- [ ] Multi-card: closest-to-bingo ordering; arrows and swipe agree on index
- [ ] Caller Only: manual next ball; Declare Winner advances; final round returns to lobby
- [ ] Settings pauses during play and resumes on close; Quit returns to lobby
