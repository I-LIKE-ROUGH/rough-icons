import type { RoughIconPreset } from './types.js';

export const editorialPreset: RoughIconPreset = {
  name: 'editorial',
  version: 1,
  roughness: 0.75,
  bowing: 0.85,
  maxRandomnessOffset: 1.15,
  preserveVertices: true,
  multipleStrokes: true,
};

export const subtlePreset: RoughIconPreset = {
  ...editorialPreset,
  name: 'subtle',
  roughness: 0.35,
  bowing: 0.45,
  maxRandomnessOffset: 0.65,
};

export const sketchPreset: RoughIconPreset = {
  ...editorialPreset,
  name: 'sketch',
  roughness: 1.25,
  bowing: 1.35,
  maxRandomnessOffset: 1.8,
};
