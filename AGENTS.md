# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# File size budget

**No file in `App.tsx`, `index.ts`, or `src/` may exceed 250 lines.** This keeps every file
readable by a local model in one pass. Enforced by `npm run lint:lines`.

When a file approaches the limit, split it along these seams, in this order:

1. `StyleSheet` blocks move to a sibling `<Component>.styles.ts` exporting `createStyles(colors)`.
2. Animation, timer, and effect logic moves to a `use<Thing>.ts` hook.
3. Repeated markup moves to a subcomponent in the same folder.

# Conventions

- Import from `src/` with the `@/` alias (`@/game/card`), not relative paths. Metro resolves this
  via `tsconfig.json` paths; restart Expo CLI after editing them.
- `src/game/` is pure logic: no React imports, no side effects, unit-testable.
- Components live in a folder with their styles, hooks, and subcomponents:
  `src/components/Announcer/{Announcer.tsx, Announcer.styles.ts, useBallTransition.ts, index.ts}`.
  The `index.ts` is a one-line re-export.
- Screens read shared state from `useGameContext()`. Leaf/presentational components take props.
- Styles are theme-derived: always `useMemo(() => createStyles(colors), [colors])`.

# Verify before finishing

```sh
npm run typecheck   # tsc --noEmit
npm run lint:lines  # 250-line budget
npm test            # src/game/ unit tests
```
