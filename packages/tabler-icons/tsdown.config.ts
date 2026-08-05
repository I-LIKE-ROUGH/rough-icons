import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/types.ts',
    'src/generated/index.ts',
    'src/generated/outline/index.ts',
    'src/generated/filled/index.ts',
    'src/generated/dynamic-outline.ts',
    'src/generated/dynamic-filled.ts',
    'src/generated/dynamic-source-outline.ts',
    'src/generated/dynamic-source-filled.ts',
  ],
  root: 'src',
  format: ['esm'],
  fixedExtension: false,
  unbundle: true,
  dts: false,
  sourcemap: true,
  clean: true,
  logLevel: 'warn',
});
