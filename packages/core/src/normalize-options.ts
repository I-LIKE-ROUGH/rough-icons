import { editorialPreset } from './presets.js';
import type { NormalizedRoughIconOptions, RoughIconOptions } from './types.js';

const finite = (value: number | undefined, fallback: number, minimum: number, maximum: number) =>
  value === undefined || !Number.isFinite(value)
    ? fallback
    : Math.min(maximum, Math.max(minimum, value));

export function normalizeRoughOptions(options: RoughIconOptions = {}): NormalizedRoughIconOptions {
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
    preserveVertices: options.preserveVertices ?? editorialPreset.preserveVertices,
    multipleStrokes: options.multipleStrokes ?? editorialPreset.multipleStrokes,
  };
}
