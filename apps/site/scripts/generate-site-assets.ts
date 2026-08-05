import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { staticIconImports } from '@rough-lucide/icons/dynamic';
import { aliases } from '@rough-lucide/icons/aliases';
import type { GeneratedIcon } from '@rough-lucide/core';

const publicRoot = resolve(import.meta.dirname, '../public');
const iconRoot = resolve(publicRoot, 'icons');
const records: { name: string; aliases: string[]; categories: string[]; tags: string[]; searchText: string }[] = [];
const aliasesByName = Object.entries(aliases).reduce<Record<string, string[]>>((result, [alias, name]) => {
  (result[name] ??= []).push(alias);
  return result;
}, {});

await rm(publicRoot, { recursive: true, force: true });
await mkdir(iconRoot, { recursive: true });
for (const name of Object.keys(staticIconImports).sort()) {
  const module = await staticIconImports[name]!();
  const icon = Object.values(module)[0]! as GeneratedIcon;
  const paths = icon.paths.map((path) => `<path d="${path.d}" fill="${path.fill}" stroke="${path.stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  await writeFile(resolve(iconRoot, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.width} ${icon.height}" fill="none" color="#171713">${paths}</svg>`);
  const tags = name.split('-');
  const iconAliases = aliasesByName[name] ?? [];
  records.push({ name, aliases: iconAliases, categories: [], tags, searchText: `${name} ${iconAliases.join(' ')} ${tags.join(' ')}`.toLowerCase() });
}
await mkdir(resolve(publicRoot, 'data'), { recursive: true });
await writeFile(resolve(publicRoot, 'data/icons-index.json'), JSON.stringify(records));
await writeFile(resolve(publicRoot, 'data/generation.json'), await readFile(resolve(import.meta.dirname, '../../../manifests/generation.json')));
console.log(`Generated ${records.length} site icons.`);
