import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { icons } from '@lucide/icons';
import { transformIcon } from '@rough-lucide/core';
import { normalizeLucideIcon } from './normalize-lucide.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const iconsRoot = resolve(root, 'packages/icons/src/generated');
const reactRoot = resolve(root, 'packages/react/src');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const pascal = (name: string) => name.split('-').map((part) => part[0]!.toUpperCase() + part.slice(1)).join('');
const moduleText = (name: string, value: unknown) => `export const ${name} = ${JSON.stringify(value)} as const;\n`;

async function write(path: string, value: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value.replaceAll('\r\n', '\n'));
}

async function main() {
  await Promise.all([rm(iconsRoot, { recursive: true, force: true }), rm(resolve(reactRoot, 'static/generated'), { recursive: true, force: true }), rm(resolve(reactRoot, 'runtime/generated'), { recursive: true, force: true })]);
  const upstreamEntries = Object.values(icons).sort((left, right) => left.name.localeCompare(right.name));
  const entries = upstreamEntries.map(normalizeLucideIcon);
  const manifestIcons: Record<string, { inputHash: string; staticHash: string; sourceHash: string }> = {};
  const iconExports: string[] = [];
  const sourceExports: string[] = [];
  const staticReactExports: string[] = [];
  const runtimeReactExports: string[] = [];
  const staticImports: string[] = [];
  const sourceImports: string[] = [];
  const staticReactImports: string[] = [];
  const runtimeReactImports: string[] = [];
  const aliasMap: Record<string, string> = {};

  for (const source of entries) {
    const component = pascal(source.name);
    let generated;
    try {
      generated = transformIcon(source);
    } catch (error) {
      throw new Error(`Failed to transform ${source.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
    const staticText = moduleText(component, generated);
    const sourceText = moduleText(`${component}Source`, source);
    await Promise.all([
      write(resolve(iconsRoot, `static/${source.name}.ts`), staticText),
      write(resolve(iconsRoot, `source/${source.name}.ts`), sourceText),
      write(resolve(reactRoot, `static/generated/${source.name}.tsx`), `import { ${component} as data } from '@rough-lucide/icons/icons/${source.name}';\nimport { createStaticIcon } from '../../create-static-icon.js';\nexport const ${component} = createStaticIcon(data);\n`),
      write(resolve(reactRoot, `runtime/generated/${source.name}.tsx`), `import { ${component}Source as source } from '@rough-lucide/icons/source/${source.name}';\nimport { createRuntimeIcon } from '../../create-runtime-icon.js';\nexport const ${component} = createRuntimeIcon(source);\n`),
    ]);
    iconExports.push(`export { ${component} } from './static/${source.name}.js';`);
    sourceExports.push(`export { ${component}Source } from './source/${source.name}.js';`);
    staticReactExports.push(`export { ${component} } from './generated/${source.name}.js';`);
    runtimeReactExports.push(`export { ${component} } from './generated/${source.name}.js';`);
    staticImports.push(`  '${source.name}': () => import('./static/${source.name}.js'),`);
    sourceImports.push(`  '${source.name}': () => import('./source/${source.name}.js'),`);
    staticReactImports.push(`  '${source.name}': () => import('./generated/${source.name}.js'),`);
    runtimeReactImports.push(`  '${source.name}': () => import('./generated/${source.name}.js'),`);
    manifestIcons[source.name] = { inputHash: hash(JSON.stringify(source)), staticHash: hash(staticText), sourceHash: hash(sourceText) };
  }
  const canonicalNames = new Set(entries.map((entry) => entry.name));
  const exportedAliases = new Set(entries.map((entry) => pascal(entry.name)));
  for (const upstream of upstreamEntries) {
    for (const alias of upstream.aliases ?? []) {
      if (canonicalNames.has(alias)) throw new Error(`Alias collides with canonical icon: ${alias}`);
      if (aliasMap[alias] && aliasMap[alias] !== upstream.name) throw new Error(`Alias collision: ${alias}`);
      aliasMap[alias] = upstream.name;
      const aliasComponent = pascal(alias);
      if (exportedAliases.has(aliasComponent)) continue;
      exportedAliases.add(aliasComponent);
      const component = pascal(upstream.name);
      iconExports.push(`export { ${component} as ${aliasComponent} } from './static/${upstream.name}.js';`);
      sourceExports.push(`export { ${component}Source as ${aliasComponent}Source } from './source/${upstream.name}.js';`);
      staticReactExports.push(`export { ${component} as ${aliasComponent} } from './generated/${upstream.name}.js';`);
      runtimeReactExports.push(`export { ${component} as ${aliasComponent} } from './generated/${upstream.name}.js';`);
    }
  }
  await Promise.all([
    write(resolve(iconsRoot, 'index.ts'), [...iconExports, ...sourceExports].join('\n') + '\n'),
    write(resolve(iconsRoot, 'aliases.ts'), moduleText('aliases', aliasMap)),
    write(resolve(iconsRoot, 'dynamic-static.ts'), `export const staticIconImports: Record<string, () => Promise<Record<string, unknown>>> = {\n${staticImports.join('\n')}\n};\n`),
    write(resolve(iconsRoot, 'dynamic-source.ts'), `export const sourceIconImports: Record<string, () => Promise<Record<string, unknown>>> = {\n${sourceImports.join('\n')}\n};\n`),
    write(resolve(reactRoot, 'static/index.ts'), staticReactExports.join('\n') + "\nexport type { RoughIconProps } from '../types.js';\n"),
    write(resolve(reactRoot, 'runtime/index.ts'), runtimeReactExports.join('\n') + "\nexport type { RuntimeRoughIconProps } from '../types.js';\n"),
    write(resolve(reactRoot, 'static/dynamic.ts'), `export const iconImports: Record<string, () => Promise<Record<string, unknown>>> = {\n${staticReactImports.join('\n')}\n};\n`),
    write(resolve(reactRoot, 'runtime/dynamic.ts'), `export const runtimeIconImports: Record<string, () => Promise<Record<string, unknown>>> = {\n${runtimeReactImports.join('\n')}\n};\n`),
  ]);
  const corePackage = JSON.parse(await readFile(resolve(root, 'packages/core/package.json'), 'utf8'));
  const generatorPackage = JSON.parse(await readFile(resolve(root, 'packages/generator/package.json'), 'utf8'));
  const manifest = { schemaVersion: 1, source: { package: '@lucide/icons', version: generatorPackage.dependencies['@lucide/icons'] }, generator: { version: 1, roughjs: corePackage.dependencies.roughjs, preset: 'editorial-v1', seedAlgorithm: 'icon-node-hash-v1' }, summary: { icons: entries.length, aliases: Object.keys(aliasMap).length }, icons: manifestIcons };
  await write(resolve(root, 'manifests/generation.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Generated ${entries.length} icons.`);
}

await main();
