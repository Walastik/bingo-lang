# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# File size budget

**No file in `App.tsx`, `index.ts`, or `src/` may exceed 250 lines.** This keeps every file
readable by a local model in one pass. Enforced by `npm run lint:lines`.

When a file approaches the limit, split it along these seams, in this order:

1. `StyleSheet` blocks move to `<Component>.styles.ts` exporting `createStyles(colors)`.
2. Animation, timer, and effect logic moves to a `use<Thing>.ts` hook.
3. Repeated markup moves to a subcomponent in the same folder.

Moving styles is the one refactor `tsc` cannot check: it catches a dropped key, never a mistyped
value, and there is no UI test coverage. Diff the property lines against the previous commit.

# Conventions

- Import across areas with the `@/` alias (`@/game/card`); use relative paths only for same-folder
  siblings (`./primitives`). Metro resolves the alias via `tsconfig.json` paths, and `jest-expo`
  derives its `moduleNameMapper` from the same place, so add aliases there only.
- `src/game/` is pure logic: no React imports, no side effects, unit-testable. Board geometry and
  the cell/daub key formats live in `@/game/constants` — never re-derive `row * 5 + col` or
  `` `${cardIndex}-${row}-${col}` `` by hand.
- Components live in a folder with their styles, hooks, and subcomponents:
  `src/components/Announcer/{Announcer.tsx, Announcer.styles.ts, useBallTransition.ts, index.ts}`.
  The `index.ts` is a one-line re-export, so `@/components/Announcer` keeps working when the
  component is split further.
- Screens read shared state from `useGameContext()`. Leaf/presentational components take props.
- `useLatestRef` is for values a long-lived callback reads later, like the draw timer's. When the
  tick that sets the state also reads the ref — `isPaused`, `isAutoMode`, `gameSpeed`, the round
  index — write the ref at the mutation site instead. An effect runs a render too late, and
  pause/resume breaks quietly.
- Styles are theme-derived: always `useMemo(() => createStyles(colors), [colors])`.
- Subcomponents take the parent's stylesheet as a prop (`styles: AnnouncerStyles`) instead of
  calling `createStyles` themselves; a 25-cell grid would otherwise build 25 stylesheets. That is
  what each `.styles.ts` exports its `ReturnType` for.
- A dimension belongs to the component that renders it (`BALL_SIZES` in `BingoBall`), and animation
  or layout math imports it from there. Never restate another component's size as a literal.

# Verify before finishing

```sh
npm run typecheck   # tsc --noEmit
npm run lint:lines  # 250-line budget
npm test            # src/game/ unit tests
```
