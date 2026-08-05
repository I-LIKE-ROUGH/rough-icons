import { svgPathBbox } from 'svg-path-bbox';
import type { PathGeometryInfo } from '@rough-lucide/core';

export function analyzePath(d: string): PathGeometryInfo {
  const contours = d.match(/[Mm](?=[\s\d.+-])/g)?.length ?? 1;
  const [minX, minY, maxX, maxY] = svgPathBbox(d);
  return {
    closed: /[zZ]/.test(d),
    contourCount: contours,
    compound: contours > 1,
    bounds: { minX, minY, maxX, maxY },
  };
}
