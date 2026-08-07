import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requested = process.argv[2] ?? 'latest';
const version = execFileSync(
  'npm',
  ['view', `@lucide/icons@${requested}`, 'version'],
  {
    encoding: 'utf8',
  },
)
  .trim()
  .split('\n')
  .at(-1)!;
const packagePath = resolve(root, 'packages/generator/package.json');
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
if (packageJson.dependencies['@lucide/icons'] === version) {
  console.log(`@lucide/icons ${version} is already current.`);
  process.exit(0);
}
packageJson.dependencies['@lucide/icons'] = version;
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
for (const packageName of ['core', 'icons', 'react']) {
  const publicPackagePath = resolve(
    root,
    `packages/${packageName}/package.json`,
  );
  const publicPackage = JSON.parse(await readFile(publicPackagePath, 'utf8'));
  publicPackage.roughLucide.lucideSourceVersion = version;
  await writeFile(
    publicPackagePath,
    `${JSON.stringify(publicPackage, null, 2)}\n`,
  );
}
execFileSync('pnpm', ['install', '--no-frozen-lockfile'], {
  cwd: root,
  stdio: 'inherit',
});
execFileSync('pnpm', ['generate'], { cwd: root, stdio: 'inherit' });
console.log(`Synchronized @lucide/icons to ${version}.`);
