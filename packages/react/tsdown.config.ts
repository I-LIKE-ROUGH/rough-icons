import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/static/index.ts',
    'src/static/dynamic.ts',
    'src/runtime/index.ts',
    'src/runtime/dynamic.ts',
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
