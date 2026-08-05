import { svgPathBbox } from 'svg-path-bbox';
import type { PathGeometryInfo } from '@rough-lucide/core';

export function analyzePath(d: string): PathGeometryInfo {
  const contours = d.match(/[Mm](?=[\s\d.+-])/g)?.length ?? 1;
  const normalize = (value: number) => {
    const rounded = Math.round(value * 1_000_000) / 1_000_000;
    return Object.is(rounded, -0) ? 0 : rounded;
  };
  const bounds = svgPathBbox(d);
  const [minX, minY, maxX, maxY] = bounds.map(normalize) as typeof bounds;
  return {
    closed: /[zZ]/.test(d),
    contourCount: contours,
    compound: contours > 1,
    bounds: { minX, minY, maxX, maxY },
  };
}
