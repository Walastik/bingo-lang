#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const MAX_LINES = 250;
const WARN_LINES = 225;

const projectRoot = resolve(import.meta.dirname, '..');
const roots = ['App.tsx', 'index.ts', 'src'];
const extensions = ['.ts', '.tsx'];

function collectFiles(target) {
  const absolute = join(projectRoot, target);
  const stats = statSync(absolute, { throwIfNoEntry: false });

  if (!stats) {
    return [];
  }

  if (stats.isFile()) {
    return extensions.some((ext) => absolute.endsWith(ext)) ? [absolute] : [];
  }

  return readdirSync(absolute).flatMap((entry) =>
    collectFiles(join(target, entry)),
  );
}

const files = roots
  .flatMap(collectFiles)
  .map((absolute) => ({
    path: relative(projectRoot, absolute),
    lines: readFileSync(absolute, 'utf8').split('\n').length,
  }))
  .sort((a, b) => b.lines - a.lines);

const violations = files.filter((file) => file.lines > MAX_LINES);
const warnings = files.filter(
  (file) => file.lines > WARN_LINES && file.lines <= MAX_LINES,
);

const format = ({ path, lines }) => `  ${String(lines).padStart(4)}  ${path}`;

if (violations.length > 0) {
  console.error(`${violations.length} file(s) over the ${MAX_LINES}-line limit:`);
  console.error(violations.map(format).join('\n'));
}

if (warnings.length > 0) {
  console.warn(`\n${warnings.length} file(s) approaching the limit:`);
  console.warn(warnings.map(format).join('\n'));
}

if (violations.length === 0) {
  const total = files.reduce((sum, file) => sum + file.lines, 0);
  console.log(
    `All ${files.length} source files are within ${MAX_LINES} lines ` +
      `(${total} total, largest ${files[0]?.lines ?? 0}).`,
  );
}

process.exit(violations.length > 0 ? 1 : 0);
