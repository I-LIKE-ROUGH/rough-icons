import { describe, expect, it } from 'vitest';
import {
  normalizeRoughOptions,
  resolveIconSeed,
  transformIcon,
} from './index.js';

const source = {
  name: 'minus',
  width: 24,
  height: 24,
  nodes: [{ type: 'line' as const, x1: 5, y1: 12, x2: 19, y2: 12 }],
};

describe('core', () => {
  it('generates deterministic paths', () =>
    expect(transformIcon(source)).toEqual(transformIcon(source)));
  it('changes variants deterministically', () =>
    expect(transformIcon(source, { seed: 'a' })).not.toEqual(
      transformIcon(source, { seed: 'b' }),
    ));
  it('clamps options', () =>
    expect(normalizeRoughOptions({ roughness: 20 }).roughness).toBe(5));
  it('creates stable nonzero seeds', () =>
    expect(resolveIconSeed('house')).toBe(resolveIconSeed('house')));

  it('does not generate hachure fills for unfilled circles', () => {
    const circle = {
      name: 'circle',
      width: 24,
      height: 24,
      nodes: [{ type: 'circle' as const, cx: 12, cy: 12, r: 10 }],
    };

    expect(transformIcon(circle).paths).toHaveLength(1);
  });

  it('preserves explicit solid circle fills', () => {
    const circle = {
      name: 'circle-dot',
      width: 24,
      height: 24,
      nodes: [
        {
          type: 'circle' as const,
          cx: 12,
          cy: 12,
          r: 1,
          fill: 'currentColor' as const,
        },
      ],
    };

    expect(transformIcon(circle).paths).toMatchObject([
      { fill: 'currentColor', stroke: 'none' },
      { fill: 'none', stroke: 'currentColor' },
    ]);
  });

  it('keeps filled compound paths as source geometry', () => {
    const filled = {
      name: 'donut',
      width: 24,
      height: 24,
      iconSet: 'tabler',
      iconStyle: 'filled' as const,
      nodes: [
        {
          type: 'path' as const,
          d: 'M2 2h20v20h-20zM8 8v8h8v-8z',
          paint: {
            fill: 'currentColor' as const,
            stroke: 'none' as const,
            fillRule: 'evenodd' as const,
            clipRule: 'evenodd' as const,
            strokeWidth: 0,
            strokeLinecap: 'round' as const,
            strokeLinejoin: 'round' as const,
            fillOpacity: 1,
            strokeOpacity: 1,
          },
        },
      ],
    };

    expect(transformIcon(filled).paths[0]).toMatchObject({
      d: filled.nodes[0].d,
      fill: 'currentColor',
      fillRule: 'evenodd',
      role: 'source-fill',
    });
  });

  it.each([
    'hachure',
    'cross-hatch',
    'zigzag',
    'dots',
    'dashed',
    'zigzag-line',
  ] as const)('generates deterministic clipped %s fills', (style) => {
    const filled = {
      name: 'square',
      width: 24,
      height: 24,
      iconStyle: 'filled' as const,
      nodes: [
        {
          type: 'path' as const,
          d: 'M2 2h20v20h-20z',
          paint: {
            fill: 'currentColor' as const,
            stroke: 'none' as const,
            fillRule: 'nonzero' as const,
            clipRule: 'nonzero' as const,
            strokeWidth: 0,
            strokeLinecap: 'round' as const,
            strokeLinejoin: 'round' as const,
            fillOpacity: 1,
            strokeOpacity: 1,
          },
        },
      ],
    };
    const first = transformIcon(filled, { fill: { style } });
    expect(first).toEqual(transformIcon(filled, { fill: { style } }));
    expect(first.clips?.[0]?.shapes[0]?.d).toBe(filled.nodes[0].d);
    expect(first.paths.some((path) => path.role === 'pattern-fill')).toBe(true);
  });
});
