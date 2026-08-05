import { editorialPreset } from './presets.js';
import type {
  NormalizedRoughFillOptions,
  NormalizedRoughIconOptions,
  RoughFillOptions,
  RoughIconOptions,
} from './types.js';

const finite = (
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
) =>
  value === undefined || !Number.isFinite(value)
    ? fallback
    : Math.min(maximum, Math.max(minimum, value));

export function normalizeRoughOptions(
  options: RoughIconOptions = {},
): NormalizedRoughIconOptions {
  return {
    roughness: finite(options.roughness, editorialPreset.roughness, 0, 5),
    bowing: finite(options.bowing, editorialPreset.bowing, 0, 5),
    maxRandomnessOffset: finite(
      options.maxRandomnessOffset,
      editorialPreset.maxRandomnessOffset,
      0,
      5,
    ),
    seed: options.seed,
    preserveVertices:
      options.preserveVertices ?? editorialPreset.preserveVertices,
    multipleStrokes: options.multipleStrokes ?? editorialPreset.multipleStrokes,
    fill: normalizeFillOptions(options.fill),
  };
}

export function normalizeFillOptions(
  options: RoughFillOptions = {},
): NormalizedRoughFillOptions {
  const edge = options.edge ?? 'auto';
  return {
    style: options.style ?? 'source',
    target: options.target ?? 'source',
    weight: finite(options.weight, 0.7, 0.1, 5),
    angle: finite(options.angle, -41, -180, 180),
    gap: finite(options.gap, 2, 0.25, 24),
    dashOffset: finite(options.dashOffset, 1, 0.1, 24),
    dashGap: finite(options.dashGap, 1, 0.1, 24),
    zigzagOffset: finite(options.zigzagOffset, 1, 0.1, 24),
    edge: edge === 'none' ? 'none' : 'rough',
    edgeWidth: finite(options.edgeWidth, 0.9, 0.1, 5),
    multipleStrokes: options.multipleStrokes ?? false,
  };
}
