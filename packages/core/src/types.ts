export type FillRule = 'nonzero' | 'evenodd';

export type IconPaint = {
  fill: 'none' | 'currentColor';
  stroke: 'none' | 'currentColor';
  fillRule: FillRule;
  clipRule: FillRule;
  strokeWidth: number;
  strokeLinecap: 'round' | 'butt' | 'square';
  strokeLinejoin: 'round' | 'miter' | 'bevel';
  fillOpacity: number;
  strokeOpacity: number;
};

export type PathGeometryInfo = {
  closed: boolean;
  contourCount: number;
  compound: boolean;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
};

type PaintedNode = { paint?: IconPaint };

export type NormalizedIconNode =
  | (PaintedNode & { type: 'path'; d: string; geometry?: PathGeometryInfo })
  | (PaintedNode & {
      type: 'line';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    })
  | (PaintedNode & {
      type: 'polyline' | 'polygon';
      points: readonly (readonly [number, number])[];
    })
  | (PaintedNode & {
      type: 'circle';
      cx: number;
      cy: number;
      r: number;
      fill?: 'currentColor';
    })
  | (PaintedNode & {
      type: 'ellipse';
      cx: number;
      cy: number;
      rx: number;
      ry: number;
    })
  | (PaintedNode & {
      type: 'rectangle';
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
      ry?: number;
    });

export type NormalizedIconSource = {
  name: string;
  width: number;
  height: number;
  iconSet?: string;
  iconStyle?: 'outline' | 'filled';
  defaultPaint?: IconPaint;
  nodes: readonly NormalizedIconNode[];
};

export type GeneratedIconPath = {
  d: string;
  fill: 'none' | 'currentColor';
  stroke: 'none' | 'currentColor';
  strokeWidth: number;
  fillRule?: FillRule;
  clip?: string;
  opacity?: number;
  role?: 'source-fill' | 'pattern-fill' | 'source-stroke' | 'fill-edge';
};

export type GeneratedClipPath = {
  key: string;
  shapes: readonly { d: string; clipRule: FillRule }[];
};

export type GeneratedIcon = {
  name: string;
  width: number;
  height: number;
  paths: readonly GeneratedIconPath[];
  clips?: readonly GeneratedClipPath[];
};

export type RoughFillStyle =
  | 'source'
  | 'none'
  | 'solid'
  | 'hachure'
  | 'cross-hatch'
  | 'zigzag'
  | 'dots'
  | 'dashed'
  | 'zigzag-line';

export type RoughFillOptions = {
  style?: RoughFillStyle;
  target?: 'source' | 'closed';
  weight?: number;
  angle?: number;
  gap?: number;
  dashOffset?: number;
  dashGap?: number;
  zigzagOffset?: number;
  edge?: 'auto' | 'rough' | 'none';
  edgeWidth?: number;
  multipleStrokes?: boolean;
};

export type NormalizedRoughFillOptions = {
  style: RoughFillStyle;
  target: 'source' | 'closed';
  weight: number;
  angle: number;
  gap: number;
  dashOffset: number;
  dashGap: number;
  zigzagOffset: number;
  edge: 'rough' | 'none';
  edgeWidth: number;
  multipleStrokes: boolean;
};

export type RoughIconOptions = {
  roughness?: number;
  bowing?: number;
  maxRandomnessOffset?: number;
  seed?: string | number;
  preserveVertices?: boolean;
  multipleStrokes?: boolean;
  fill?: RoughFillOptions;
};

export type NormalizedRoughIconOptions = Required<
  Omit<RoughIconOptions, 'seed' | 'fill'>
> & {
  seed?: string | number;
  fill: NormalizedRoughFillOptions;
};

export type RoughIconPreset = Omit<NormalizedRoughIconOptions, 'fill'> & {
  name: string;
  version: number;
};
