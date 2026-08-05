import { expect, it } from 'vitest';
import { normalizeLucideIcon } from './normalize-lucide.js';

it('fails on unsupported nodes', () => {
  expect(() =>
    normalizeLucideIcon({ name: 'bad', size: 24, node: [['g', {}]] }),
  ).toThrow('Unsupported SVG element');
});
