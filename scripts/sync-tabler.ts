import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requested = process.argv[2] ?? 'latest';
const version = execFileSync(
  'npm',
  ['view', `@tabler/icons@${requested}`, 'version'],
  {
    encoding: 'utf8',
  },
)
  .trim()
  .split('\n')
  .at(-1)!;
const packagePath = resolve(root, 'packages/generator/package.json');
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'));
if (packageJson.dependencies['@tabler/icons'] === version) {
  console.log(`@tabler/icons ${version} is already current.`);
  process.exit(0);
}
packageJson.dependencies['@tabler/icons'] = version;
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
execFileSync('pnpm', ['install'], { cwd: root, stdio: 'inherit' });
execFileSync('pnpm', ['generate'], { cwd: root, stdio: 'inherit' });
console.log(`Synchronized @tabler/icons to ${version}.`);
