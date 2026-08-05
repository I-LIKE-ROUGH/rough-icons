import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { staticIconImports } from '@rough-lucide/icons/dynamic';
import { aliases } from '@rough-lucide/icons/aliases';
import { iconImports as tablerOutlineImports } from '@rough-tabler/icons/dynamic/outline';
import { iconImports as tablerFilledImports } from '@rough-tabler/icons/dynamic/filled';
import type { GeneratedIcon } from '@rough-lucide/core';

const publicRoot = resolve(import.meta.dirname, '../public');
const iconRoot = resolve(publicRoot, 'icons');
const records: {
  id: string;
  name: string;
  iconSet: 'lucide' | 'tabler';
  iconStyle: 'outline' | 'filled';
  aliases: string[];
  categories: string[];
  tags: string[];
  searchText: string;
}[] = [];
const aliasesByName = Object.entries(aliases).reduce<Record<string, string[]>>(
  (result, [alias, name]) => {
    (result[name] ??= []).push(alias);
    return result;
  },
  {},
);
const collections = [
  {
    iconSet: 'lucide' as const,
    iconStyle: 'outline' as const,
    imports: staticIconImports,
  },
  {
    iconSet: 'tabler' as const,
    iconStyle: 'outline' as const,
    imports: tablerOutlineImports,
  },
  {
    iconSet: 'tabler' as const,
    iconStyle: 'filled' as const,
    imports: tablerFilledImports,
  },
];

await rm(publicRoot, { recursive: true, force: true });
await mkdir(iconRoot, { recursive: true });
for (const collection of collections) {
  const outputRoot = resolve(
    iconRoot,
    collection.iconSet,
    collection.iconStyle,
  );
  await mkdir(outputRoot, { recursive: true });
  for (const name of Object.keys(collection.imports).sort()) {
    const module = await collection.imports[name]!();
    const icon = Object.values(module)[0]! as GeneratedIcon;
    const paths = icon.paths
      .map(
        (path) =>
          `<path d="${path.d}" fill="${path.fill}" stroke="${path.stroke}" stroke-width="${path.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${path.fillRule ? ` fill-rule="${path.fillRule}"` : ''}/>`,
      )
      .join('');
    await writeFile(
      resolve(outputRoot, `${name}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.width} ${icon.height}" fill="none" color="#171713">${paths}</svg>`,
    );
    const tags = name.split('-');
    const iconAliases =
      collection.iconSet === 'lucide' ? (aliasesByName[name] ?? []) : [];
    records.push({
      id: `${collection.iconSet}:${collection.iconStyle}:${name}`,
      name,
      iconSet: collection.iconSet,
      iconStyle: collection.iconStyle,
      aliases: iconAliases,
      categories: [],
      tags,
      searchText:
        `${name} ${collection.iconSet} ${collection.iconStyle} ${iconAliases.join(' ')} ${tags.join(' ')}`.toLowerCase(),
    });
  }
}
await mkdir(resolve(publicRoot, 'data'), { recursive: true });
await writeFile(
  resolve(publicRoot, 'data/icons-index.json'),
  JSON.stringify(records),
);
await writeFile(
  resolve(publicRoot, 'data/generation.json'),
  await readFile(
    resolve(import.meta.dirname, '../../../manifests/generation.json'),
  ),
);
console.log(`Generated ${records.length} site icons.`);
