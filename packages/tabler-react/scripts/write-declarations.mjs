import { readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pascal = (name) =>
  name
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');

async function declarations(style, runtime) {
  const names = (await readdir(resolve(root, `src/static/${style}/generated`)))
    .filter((name) => name.endsWith('.tsx'))
    .map((name) => name.slice(0, -4))
    .sort();
  const props = runtime
    ? 'RuntimeRoughTablerIconProps'
    : 'RoughTablerIconProps';
  return [
    "import type { ForwardRefExoticComponent, RefAttributes } from 'react';",
    `import type { ${props} } from './types.js';`,
    ...names.map((name) => {
      const component = `Icon${pascal(name)}${style === 'filled' ? 'Filled' : ''}`;
      return `export declare const ${component}: ForwardRefExoticComponent<${props} & RefAttributes<SVGSVGElement>>;`;
    }),
    '',
  ].join('\n');
}

const outline = await declarations('outline', false);
const filled = await declarations('filled', false);
const runtimeOutline = await declarations('outline', true);
const runtimeFilled = await declarations('filled', true);
const withoutImports = (value) => value.split('\n').slice(2).join('\n');
const types = `import type { SVGProps } from 'react';
import type { RoughIconOptions } from '@rough-lucide/core';
export type RoughTablerIconProps = Omit<SVGProps<SVGSVGElement>, 'color'> & { size?: number | string; color?: string; strokeWidth?: number; absoluteStrokeWidth?: boolean; title?: string };
export type RuntimeRoughTablerIconProps = RoughTablerIconProps & { rough?: RoughIconOptions; preset?: 'editorial' | 'subtle' | 'sketch'; variant?: string };
`;

await Promise.all([
  writeFile(resolve(root, 'dist/types.d.ts'), types),
  writeFile(resolve(root, 'dist/outline.d.ts'), outline),
  writeFile(resolve(root, 'dist/filled.d.ts'), filled),
  writeFile(
    resolve(root, 'dist/index.d.ts'),
    `${outline}\n${withoutImports(filled)}`,
  ),
  writeFile(resolve(root, 'dist/runtime-outline.d.ts'), runtimeOutline),
  writeFile(resolve(root, 'dist/runtime-filled.d.ts'), runtimeFilled),
  writeFile(
    resolve(root, 'dist/runtime.d.ts'),
    `${runtimeOutline}\n${withoutImports(runtimeFilled)}`,
  ),
  writeFile(
    resolve(root, 'dist/dynamic.d.ts'),
    'export declare const iconImports: Record<string, () => Promise<Record<string, unknown>>>;\nexport declare const runtimeIconImports: Record<string, () => Promise<Record<string, unknown>>>;\n',
  ),
]);
