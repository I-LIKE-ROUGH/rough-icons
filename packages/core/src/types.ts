export type NormalizedIconNode =
  | { type: 'path'; d: string }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | {
      type: 'polyline' | 'polygon';
      points: readonly (readonly [number, number])[];
    }
  | { type: 'circle'; cx: number; cy: number; r: number; fill?: 'currentColor' }
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | {
      type: 'rectangle';
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
      ry?: number;
    };

export type NormalizedIconSource = {
  name: string;
  width: number;
  height: number;
  nodes: readonly NormalizedIconNode[];
};

export type GeneratedIconPath = {
  d: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
};

export type GeneratedIcon = {
  name: string;
  width: number;
  height: number;
  paths: readonly GeneratedIconPath[];
};

export type RoughIconOptions = {
  roughness?: number;
  bowing?: number;
  maxRandomnessOffset?: number;
  seed?: string | number;
  preserveVertices?: boolean;
  multipleStrokes?: boolean;
};

export type NormalizedRoughIconOptions = Required<
  Omit<RoughIconOptions, 'seed'>
> & {
  seed?: string | number;
};

export type RoughIconPreset = NormalizedRoughIconOptions & {
  name: string;
  version: number;
};
