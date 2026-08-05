import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const generatedRoots = [
  resolve(import.meta.dirname, '../packages/icons/src/generated'),
  resolve(import.meta.dirname, '../packages/tabler-icons/src/generated'),
];
async function digest(directory: string): Promise<string> {
  const hash = createHash('sha256');
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort(
    (a, b) => a.name.localeCompare(b.name),
  )) {
    const path = resolve(directory, entry.name);
    hash.update(entry.name);
    hash.update(
      entry.isDirectory() ? await digest(path) : await readFile(path),
    );
  }
  return hash.digest('hex');
}
async function generatedDigest() {
  const hash = createHash('sha256');
  for (const root of generatedRoots) hash.update(await digest(root));
  return hash.digest('hex');
}

const before = await generatedDigest();
execFileSync('pnpm', ['generate'], {
  cwd: resolve(import.meta.dirname, '..'),
  stdio: 'inherit',
});
const after = await generatedDigest();
if (before !== after)
  throw new Error(`Generation is not deterministic: ${before} != ${after}`);
console.log(`Determinism verified: ${after}`);
