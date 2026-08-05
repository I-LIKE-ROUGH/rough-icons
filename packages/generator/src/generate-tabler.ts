import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { transformIcon } from '@rough-lucide/core';
import type { NormalizedIconSource } from '@rough-lucide/core';
import { normalizeTablerIcon } from './normalize-tabler.js';
import type { TablerNode } from './normalize-tabler.js';

type TablerNodes = Record<string, readonly TablerNode[]>;
const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');
const pascal = (name: string) =>
  name
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join('');
const componentName = (name: string, style: 'outline' | 'filled') =>
  `Icon${pascal(name)}${style === 'filled' ? 'Filled' : ''}`;
const moduleText = (name: string, value: unknown) =>
  `export const ${name} = ${JSON.stringify(value)} as const;\n`;

async function write(path: string, value: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value.replaceAll('\r\n', '\n'));
}

function risk(source: NormalizedIconSource) {
  const paths = source.nodes.filter((node) => node.type === 'path');
  if (paths.some((node) => node.paint?.fillRule === 'evenodd'))
    return 'evenodd';
  if (paths.length > 1) return 'mixedPaint';
  if (paths.some((node) => node.geometry?.compound)) return 'compound';
  return 'simple';
}

export async function generateTabler(root: string) {
  const packageRoot = resolve(
    root,
    'packages/generator/node_modules/@tabler/icons',
  );
  const [outlineNodes, filledNodes, packageJson] = await Promise.all([
    readFile(resolve(packageRoot, 'tabler-nodes-outline.json'), 'utf8').then(
      (value) => JSON.parse(value) as TablerNodes,
    ),
    readFile(resolve(packageRoot, 'tabler-nodes-filled.json'), 'utf8').then(
      (value) => JSON.parse(value) as TablerNodes,
    ),
    readFile(resolve(packageRoot, 'package.json'), 'utf8').then(JSON.parse),
  ]);
  const iconsRoot = resolve(root, 'packages/tabler-icons/src/generated');
  const reactRoot = resolve(root, 'packages/tabler-react/src');
  await Promise.all([
    rm(iconsRoot, { recursive: true, force: true }),
    rm(resolve(reactRoot, 'static'), { recursive: true, force: true }),
    rm(resolve(reactRoot, 'runtime'), { recursive: true, force: true }),
  ]);

  const manifest: Record<string, unknown> = {
    schemaVersion: 3,
    set: 'tabler',
    source: { package: '@tabler/icons', version: packageJson.version },
    generator: {
      version: 4,
      fillEngineVersion: 1,
      dotEngineVersion: 1,
      safeFillVersion: 1,
    },
    styles: {},
  };
  const audit = {
    version: packageJson.version,
    summary: {
      icons: Object.keys(filledNodes).length,
      nodes: 0,
      compoundPaths: 0,
      multiNodeIcons: 0,
      evenoddPaths: 0,
      mixedPaintIcons: 0,
      unsupportedIcons: 0,
    },
    elements: { path: 0 } as Record<string, number>,
    attributes: {} as Record<string, number>,
    riskBuckets: {
      simple: [] as string[],
      compound: [] as string[],
      evenodd: [] as string[],
      mixedPaint: [] as string[],
      unsupported: [] as string[],
    },
  };

  for (const [style, records] of [
    ['outline', outlineNodes],
    ['filled', filledNodes],
  ] as const) {
    const iconExports: string[] = [];
    const sourceExports: string[] = [];
    const staticReactExports: string[] = [];
    const runtimeReactExports: string[] = [];
    const staticImports: string[] = [];
    const sourceImports: string[] = [];
    const staticReactImports: string[] = [];
    const runtimeReactImports: string[] = [];
    const manifestIcons: Record<string, unknown> = {};
    const names = Object.keys(records).sort((left, right) =>
      left.localeCompare(right),
    );

    for (const name of names) {
      const upstreamNodes = records[name]!;
      const source = normalizeTablerIcon(name, style, upstreamNodes);
      const generated = transformIcon(source);
      const component = componentName(name, style);
      const sourceName = `${component}Source`;
      const staticText = moduleText(component, generated);
      const sourceText = moduleText(sourceName, source);
      await Promise.all([
        write(resolve(iconsRoot, `${style}/${name}.ts`), staticText),
        write(resolve(iconsRoot, `source/${style}/${name}.ts`), sourceText),
        write(
          resolve(reactRoot, `static/${style}/generated/${name}.tsx`),
          `import { ${component} as data } from '@rough-tabler/icons/${style}/${name}';\nimport { createStaticIcon } from '../../../create-static-icon.js';\nexport const ${component} = createStaticIcon(data);\n`,
        ),
        write(
          resolve(reactRoot, `runtime/${style}/generated/${name}.tsx`),
          `import { ${sourceName} as source } from '@rough-tabler/icons/source/${style}/${name}';\nimport { createRuntimeIcon } from '../../../create-runtime-icon.js';\nexport const ${component} = createRuntimeIcon(source);\n`,
        ),
      ]);
      iconExports.push(`export { ${component} } from './${name}.js';`);
      sourceExports.push(
        `export { ${sourceName} } from '../source/${style}/${name}.js';`,
      );
      staticReactExports.push(
        `export { ${component} } from './generated/${name}.js';`,
      );
      runtimeReactExports.push(
        `export { ${component} } from './generated/${name}.js';`,
      );
      staticImports.push(`  '${name}': () => import('./${style}/${name}.js'),`);
      sourceImports.push(
        `  '${name}': () => import('./source/${style}/${name}.js'),`,
      );
      staticReactImports.push(
        `  '${name}': () => import('./${style}/generated/${name}.js'),`,
      );
      runtimeReactImports.push(
        `  '${name}': () => import('./${style}/generated/${name}.js'),`,
      );
      const bucket = risk(source);
      manifestIcons[name] = {
        inputHash: hash(JSON.stringify(source)),
        staticHash: hash(staticText),
        sourceHash: hash(sourceText),
        ...(style === 'filled' ? { riskBucket: bucket } : {}),
      };

      if (style === 'filled') {
        audit.summary.nodes += upstreamNodes.length;
        if (upstreamNodes.length > 1) audit.summary.multiNodeIcons++;
        audit.riskBuckets[bucket].push(name);
        for (const [tag, attributes] of upstreamNodes) {
          audit.elements[tag] = (audit.elements[tag] ?? 0) + 1;
          for (const attribute of Object.keys(attributes))
            audit.attributes[attribute] =
              (audit.attributes[attribute] ?? 0) + 1;
        }
        for (const node of source.nodes) {
          if (node.type === 'path' && node.geometry?.compound)
            audit.summary.compoundPaths++;
          if (node.paint?.fillRule === 'evenodd') audit.summary.evenoddPaths++;
        }
        if (bucket === 'mixedPaint') audit.summary.mixedPaintIcons++;
      }
    }

    await Promise.all([
      write(
        resolve(iconsRoot, `${style}/index.ts`),
        [...iconExports, ...sourceExports].join('\n') + '\n',
      ),
      write(
        resolve(iconsRoot, `dynamic-${style}.ts`),
        `export const iconImports: Record<string, () => Promise<Record<string, unknown>>> = {\n${staticImports.join('\n')}\n};\n`,
      ),
      write(
        resolve(iconsRoot, `dynamic-source-${style}.ts`),
        `export const sourceIconImports: Record<string, () => Promise<Record<string, unknown>>> = {\n${sourceImports.join('\n')}\n};\n`,
      ),
      write(
        resolve(reactRoot, `static/${style}/index.ts`),
        `${staticReactExports.join('\n')}\nexport type { RoughTablerIconProps } from '../../types.js';\n`,
      ),
      write(
        resolve(reactRoot, `runtime/${style}/index.ts`),
        `${runtimeReactExports.join('\n')}\nexport type { RuntimeRoughTablerIconProps } from '../../types.js';\n`,
      ),
      write(
        resolve(reactRoot, `static/dynamic-${style}.ts`),
        `export const iconImports: Record<string, () => Promise<Record<string, unknown>>> = {\n${staticReactImports.join('\n')}\n};\n`,
      ),
      write(
        resolve(reactRoot, `runtime/dynamic-${style}.ts`),
        `export const runtimeIconImports: Record<string, () => Promise<Record<string, unknown>>> = {\n${runtimeReactImports.join('\n')}\n};\n`,
      ),
    ]);
    (manifest.styles as Record<string, unknown>)[style] = {
      summary: { icons: names.length },
      icons: manifestIcons,
    };
  }

  await Promise.all([
    write(
      resolve(iconsRoot, 'index.ts'),
      `export * from './outline/index.js';\nexport * from './filled/index.js';\n`,
    ),
    write(
      resolve(reactRoot, 'static/index.ts'),
      `export * from './outline/index.js';\nexport * from './filled/index.js';\n`,
    ),
    write(
      resolve(reactRoot, 'runtime/index.ts'),
      `export * from './outline/index.js';\nexport * from './filled/index.js';\n`,
    ),
    write(
      resolve(root, 'manifests/tabler-generation.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    ),
    write(
      resolve(root, 'reports/tabler-filled-audit.json'),
      `${JSON.stringify(audit, null, 2)}\n`,
    ),
  ]);
  console.log(
    `Generated ${Object.keys(outlineNodes).length} Tabler outline and ${Object.keys(filledNodes).length} filled icons.`,
  );
}
