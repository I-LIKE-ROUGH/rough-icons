import { execFileSync } from 'node:child_process';
import {
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { delimiter, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { expect, it } from 'vitest';

const repoRoot = resolve(import.meta.dirname, '..');

it('updates the Tabler lockfile when sync runs with CI=true', async () => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'rough-icons-tabler-sync-'));
  const scriptPath = join(fixtureRoot, 'scripts/sync-tabler.ts');
  const generatorPath = join(fixtureRoot, 'packages/generator');
  const binPath = join(fixtureRoot, 'bin');
  const callsPath = join(fixtureRoot, 'pnpm-calls.jsonl');

  try {
    await mkdir(dirname(scriptPath), { recursive: true });
    await mkdir(generatorPath, { recursive: true });
    await mkdir(binPath, { recursive: true });
    await copyFile(resolve(repoRoot, 'scripts/sync-tabler.ts'), scriptPath);
    await writeFile(
      join(fixtureRoot, 'package.json'),
      JSON.stringify({ type: 'module' }),
    );
    await writeFile(
      join(generatorPath, 'package.json'),
      JSON.stringify({ dependencies: { '@tabler/icons': '3.46.0' } }),
    );

    const npmPath = join(binPath, 'npm');
    await writeFile(
      npmPath,
      `#!/usr/bin/env node
if (process.argv[2] !== 'view') process.exit(2);
process.stdout.write('3.50.0\\n');
`,
    );
    await chmod(npmPath, 0o755);

    const pnpmPath = join(binPath, 'pnpm');
    await writeFile(
      pnpmPath,
      `#!/usr/bin/env node
import { appendFileSync } from 'node:fs';
const args = process.argv.slice(2);
appendFileSync(process.env.PNPM_CALLS_FILE, JSON.stringify(args) + '\\n');
if (args[0] === 'install' && process.env.CI === 'true' && !args.includes('--no-frozen-lockfile')) {
  process.stderr.write('ERR_PNPM_OUTDATED_LOCKFILE\\n');
  process.exit(1);
}
`,
    );
    await chmod(pnpmPath, 0o755);

    execFileSync(
      resolve(repoRoot, 'node_modules/.bin/tsx'),
      [scriptPath, 'latest'],
      {
        cwd: fixtureRoot,
        env: {
          ...process.env,
          CI: 'true',
          PATH: `${binPath}${delimiter}${process.env.PATH ?? ''}`,
          PNPM_CALLS_FILE: callsPath,
        },
        encoding: 'utf8',
      },
    );

    const calls = (await readFile(callsPath, 'utf8'))
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(calls).toEqual([['install', '--no-frozen-lockfile'], ['generate']]);
    const packageJson = JSON.parse(
      await readFile(join(generatorPath, 'package.json'), 'utf8'),
    );
    expect(packageJson.dependencies['@tabler/icons']).toBe('3.50.0');
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});
