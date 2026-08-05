import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  fixedExtension: false,
  sourcemap: true,
  clean: true,
});
