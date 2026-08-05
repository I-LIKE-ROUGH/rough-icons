import { readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pascal = (name) =>
  name
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');

async function declarations(style) {
  const names = (await readdir(resolve(root, `src/generated/${style}`)))
    .filter((name) => name.endsWith('.ts') && name !== 'index.ts')
    .map((name) => name.slice(0, -3))
    .sort();
  return [
    "import type { GeneratedIcon, NormalizedIconSource } from '@rough-lucide/core';",
    ...names.flatMap((name) => {
      const component = `Icon${pascal(name)}${style === 'filled' ? 'Filled' : ''}`;
      return [
        `export declare const ${component}: GeneratedIcon;`,
        `export declare const ${component}Source: NormalizedIconSource;`,
      ];
    }),
    '',
  ].join('\n');
}

const outline = await declarations('outline');
const filled = await declarations('filled');
const filledBody = filled.split('\n').slice(1).join('\n');
await Promise.all([
  writeFile(resolve(root, 'dist/outline.d.ts'), outline),
  writeFile(resolve(root, 'dist/filled.d.ts'), filled),
  writeFile(resolve(root, 'dist/index.d.ts'), `${outline}\n${filledBody}`),
  writeFile(
    resolve(root, 'dist/types.d.ts'),
    "export type * from '@rough-lucide/core';\n",
  ),
  writeFile(
    resolve(root, 'dist/dynamic.d.ts'),
    'export declare const iconImports: Record<string, () => Promise<Record<string, unknown>>>;\n',
  ),
  writeFile(
    resolve(root, 'dist/dynamic-source.d.ts'),
    'export declare const sourceIconImports: Record<string, () => Promise<Record<string, unknown>>>;\n',
  ),
]);
