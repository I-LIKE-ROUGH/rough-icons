import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/static/index.ts',
    'src/static/outline/index.ts',
    'src/static/filled/index.ts',
    'src/static/dynamic-outline.ts',
    'src/static/dynamic-filled.ts',
    'src/runtime/index.ts',
    'src/runtime/outline/index.ts',
    'src/runtime/filled/index.ts',
    'src/runtime/dynamic-outline.ts',
    'src/runtime/dynamic-filled.ts',
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
