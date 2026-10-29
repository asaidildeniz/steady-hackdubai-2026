/// <reference types="node" /> // comes with @types/jest; no new dependency
import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';

// Section 12, check 7: nothing in the app can send data away or log what someone chose.
const FORBIDDEN = /\bfetch\(|\baxios\b|XMLHttpRequest|WebSocket|analytics|console\./;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

test('app code has no network calls, analytics or console logging', () => {
  const root = join(__dirname, '..', '..');
  const files = [...sourceFiles(join(root, 'app')), ...sourceFiles(join(root, 'src'))];
  expect(files.length).toBeGreaterThan(10);
  const hits = files.flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((line, i) => (FORBIDDEN.test(line) ? [`${relative(root, file)}:${i + 1}: ${line.trim()}`] : [])),
  );
  expect(hits).toEqual([]);
});
