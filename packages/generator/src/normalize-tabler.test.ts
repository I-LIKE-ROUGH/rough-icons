import { describe, expect, it } from 'vitest';
import { normalizeTablerIcon } from './normalize-tabler.js';

describe('normalizeTablerIcon', () => {
  it('resolves outline paint', () => {
    const icon = normalizeTablerIcon('home', 'outline', [
      ['path', { d: 'M2 2h20' }],
    ]);
    expect(icon.nodes[0]?.paint).toMatchObject({
      fill: 'none',
      stroke: 'currentColor',
    });
  });

  it('resolves topology-safe filled paint', () => {
    const icon = normalizeTablerIcon('donut', 'filled', [
      ['path', { d: 'M2 2h20v20zM8 8v8h8v-8z' }],
    ]);
    expect(icon.nodes[0]).toMatchObject({
      paint: { fill: 'currentColor', stroke: 'none' },
      geometry: { compound: true, contourCount: 2 },
    });
  });

  it('rejects unsupported paint attributes', () => {
    expect(() =>
      normalizeTablerIcon('bad', 'filled', [
        ['path', { d: 'M0 0z', transform: 'scale(2)' }],
      ]),
    ).toThrow('Unsupported path attributes');
  });
});
