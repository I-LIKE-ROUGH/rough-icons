import { describe, expect, it } from 'vitest';
import { normalizeRoughOptions, resolveIconSeed, transformIcon } from './index.js';

const source = { name: 'minus', width: 24, height: 24, nodes: [{ type: 'line' as const, x1: 5, y1: 12, x2: 19, y2: 12 }] };

describe('core', () => {
  it('generates deterministic paths', () => expect(transformIcon(source)).toEqual(transformIcon(source)));
  it('changes variants deterministically', () => expect(transformIcon(source, { seed: 'a' })).not.toEqual(transformIcon(source, { seed: 'b' })));
  it('clamps options', () => expect(normalizeRoughOptions({ roughness: 20 }).roughness).toBe(5));
  it('creates stable nonzero seeds', () => expect(resolveIconSeed('house')).toBe(resolveIconSeed('house')));
});
