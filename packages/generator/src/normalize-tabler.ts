import type {
  IconPaint,
  NormalizedIconNode,
  NormalizedIconSource,
} from '@rough-lucide/core';
import { analyzePath } from './geometry.js';

export type TablerNode = readonly ['path', Readonly<Record<string, string>>];

const outlinePaint: IconPaint = {
  fill: 'none',
  stroke: 'currentColor',
  fillRule: 'nonzero',
  clipRule: 'nonzero',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fillOpacity: 1,
  strokeOpacity: 1,
};

const filledPaint: IconPaint = {
  ...outlinePaint,
  fill: 'currentColor',
  stroke: 'none',
  strokeWidth: 0,
};

export function normalizeTablerIcon(
  name: string,
  style: 'outline' | 'filled',
  nodes: readonly TablerNode[],
): NormalizedIconSource {
  const defaultPaint = style === 'filled' ? filledPaint : outlinePaint;
  try {
    return {
      name,
      width: 24,
      height: 24,
      iconSet: 'tabler',
      iconStyle: style,
      defaultPaint,
      nodes: nodes.map(([tag, attributes]): NormalizedIconNode => {
        if (tag !== 'path') throw new Error(`Unsupported SVG element: ${tag}`);
        const unknown = Object.keys(attributes).filter(
          (key) =>
            ![
              'd',
              'fill',
              'stroke',
              'opacity',
              'fill-rule',
              'clip-rule',
            ].includes(key),
        );
        if (unknown.length)
          throw new Error(`Unsupported path attributes: ${unknown.join(', ')}`);
        if (!attributes.d) throw new Error('Path is missing d');
        if (
          attributes.fill &&
          !['none', 'currentColor'].includes(attributes.fill)
        )
          throw new Error(`Unsupported fill: ${attributes.fill}`);
        if (
          attributes.stroke &&
          !['none', 'currentColor'].includes(attributes.stroke)
        )
          throw new Error(`Unsupported stroke: ${attributes.stroke}`);
        const opacity =
          attributes.opacity === undefined ? 1 : Number(attributes.opacity);
        if (!Number.isFinite(opacity))
          throw new Error(`Invalid opacity: ${attributes.opacity}`);
        const paint: IconPaint = {
          ...defaultPaint,
          fill: (attributes.fill ?? defaultPaint.fill) as IconPaint['fill'],
          stroke: (attributes.stroke ??
            defaultPaint.stroke) as IconPaint['stroke'],
          fillRule: (attributes['fill-rule'] ??
            defaultPaint.fillRule) as IconPaint['fillRule'],
          clipRule: (attributes['clip-rule'] ??
            defaultPaint.clipRule) as IconPaint['clipRule'],
          fillOpacity: opacity,
          strokeOpacity: opacity,
        };
        return {
          type: 'path',
          d: attributes.d,
          paint,
          geometry: analyzePath(attributes.d),
        };
      }),
    };
  } catch (error) {
    throw new Error(
      `Failed to normalize Tabler ${style} ${name}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
