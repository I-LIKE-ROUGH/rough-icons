import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/types.ts',
    'src/generated/index.ts',
    'src/generated/aliases.ts',
    'src/generated/dynamic-source.ts',
    'src/generated/dynamic-static.ts',
  ],
  root: 'src',
  format: ['esm'],
  fixedExtension: false,
  unbundle: true,
  dts: { sourcemap: true },
  sourcemap: true,
  clean: true,
  logLevel: 'warn',
});
