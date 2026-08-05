import { RoughGenerator } from 'roughjs/bin/generator.js';
import type { Drawable, Options, OpSet } from 'roughjs/bin/core.js';
import svgpath from 'svgpath';
import { normalizeRoughOptions } from './normalize-options.js';
import { hash32, resolveIconSeed } from './seed.js';
import type {
  GeneratedClipPath,
  GeneratedIconPath,
  IconPaint,
  NormalizedIconNode,
  NormalizedIconSource,
  NormalizedRoughFillOptions,
  RoughFillStyle,
  RoughIconOptions,
} from './types.js';

const generator = new RoughGenerator();
const legacyPaint: IconPaint = {
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

function roundedRectanglePath(
  node: Extract<NormalizedIconNode, { type: 'rectangle' }>,
): string {
  const radius = Math.min(
    node.rx ?? node.ry ?? 0,
    node.width / 2,
    node.height / 2,
  );
  if (!radius)
    return `M${node.x} ${node.y}h${node.width}v${node.height}h-${node.width}Z`;
  const right = node.x + node.width;
  const bottom = node.y + node.height;
  return `M${node.x + radius} ${node.y}H${right - radius}A${radius} ${radius} 0 0 1 ${right} ${node.y + radius}V${bottom - radius}A${radius} ${radius} 0 0 1 ${right - radius} ${bottom}H${node.x + radius}A${radius} ${radius} 0 0 1 ${node.x} ${bottom - radius}V${node.y + radius}A${radius} ${radius} 0 0 1 ${node.x + radius} ${node.y}Z`;
}

function nodePath(node: NormalizedIconNode): string {
  switch (node.type) {
    case 'path':
      return svgpath(node.d).toString();
    case 'line':
      return `M${node.x1} ${node.y1}L${node.x2} ${node.y2}`;
    case 'polyline':
    case 'polygon':
      return `${node.points.map(([x, y], index) => `${index ? 'L' : 'M'}${x} ${y}`).join('')}${node.type === 'polygon' ? 'Z' : ''}`;
    case 'circle':
      return `M${node.cx - node.r} ${node.cy}a${node.r} ${node.r} 0 1 0 ${node.r * 2} 0a${node.r} ${node.r} 0 1 0 -${node.r * 2} 0Z`;
    case 'ellipse':
      return `M${node.cx - node.rx} ${node.cy}a${node.rx} ${node.ry} 0 1 0 ${node.rx * 2} 0a${node.rx} ${node.ry} 0 1 0 -${node.rx * 2} 0Z`;
    case 'rectangle':
      return roundedRectanglePath(node);
  }
}

function drawNode(node: NormalizedIconNode, options: Options): Drawable {
  switch (node.type) {
    case 'path':
    case 'rectangle':
      return generator.path(nodePath(node), options);
    case 'line':
      return generator.line(node.x1, node.y1, node.x2, node.y2, options);
    case 'polyline':
      return generator.linearPath(
        node.points.map(([x, y]) => [x, y]),
        options,
      );
    case 'polygon':
      return generator.polygon(
        node.points.map(([x, y]) => [x, y]),
        options,
      );
    case 'circle':
      return generator.circle(node.cx, node.cy, node.r * 2, options);
    case 'ellipse':
      return generator.ellipse(
        node.cx,
        node.cy,
        node.rx * 2,
        node.ry * 2,
        options,
      );
  }
}

function drawablePaths(
  drawable: Drawable,
  role: GeneratedIconPath['role'],
): GeneratedIconPath[] {
  return drawable.sets.map((set) => ({
    d: generator.opsToPath(set, 3),
    fill: set.type === 'fillPath' ? 'currentColor' : 'none',
    stroke: set.type === 'fillPath' ? 'none' : 'currentColor',
    strokeWidth: drawable.options.strokeWidth,
    role,
  }));
}

function legacySeedNode(node: NormalizedIconNode) {
  const { paint: _paint, ...geometry } = node;
  if ('geometry' in geometry) {
    const { geometry: _metadata, ...legacy } = geometry;
    return legacy;
  }
  return geometry;
}

function isClosed(node: NormalizedIconNode) {
  if (
    node.type === 'circle' ||
    node.type === 'ellipse' ||
    node.type === 'rectangle' ||
    node.type === 'polygon'
  )
    return true;
  return node.type === 'path' && (node.geometry?.closed ?? /[zZ]/.test(node.d));
}

function resolveStyle(style: RoughFillStyle, sourceFilled: boolean) {
  if (style === 'source') return sourceFilled ? 'solid' : 'none';
  return style;
}

function patternOptions(
  style: Exclude<RoughFillStyle, 'source' | 'none' | 'solid' | 'dots'>,
  fill: NormalizedRoughFillOptions,
  seed: number,
): Options {
  return {
    seed,
    stroke: 'none',
    fill: 'currentColor',
    fillStyle: style,
    fillWeight: fill.weight,
    hachureAngle: fill.angle,
    hachureGap: fill.gap,
    dashOffset: fill.dashOffset,
    dashGap: fill.dashGap,
    zigzagOffset: fill.zigzagOffset,
    disableMultiStrokeFill: !fill.multipleStrokes,
  };
}

function patternSetPath(
  set: OpSet,
  clip: string,
  weight: number,
): GeneratedIconPath {
  return {
    d: generator.opsToPath(set, 3),
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: weight,
    clip,
    role: 'pattern-fill',
  };
}

function roughPattern(
  style: Exclude<RoughFillStyle, 'source' | 'none' | 'solid' | 'dots'>,
  width: number,
  height: number,
  fill: NormalizedRoughFillOptions,
  seed: number,
  clip: string,
) {
  const overflow = Math.max(4, fill.gap * 2);
  const drawable = generator.rectangle(
    -overflow,
    -overflow,
    width + overflow * 2,
    height + overflow * 2,
    patternOptions(style, fill, seed),
  );
  return drawable.sets
    .filter((set) => set.type === 'fillSketch')
    .map((set) => patternSetPath(set, clip, fill.weight));
}

function dotsPattern(
  width: number,
  height: number,
  fill: NormalizedRoughFillOptions,
  seed: number,
  clip: string,
) {
  const paths: GeneratedIconPath[] = [];
  const gap = fill.gap;
  const radius = Math.max(0.12, fill.weight / 2);
  for (let row = -1; row <= Math.ceil(height / gap) + 1; row++) {
    for (let column = -1; column <= Math.ceil(width / gap) + 1; column++) {
      const dotSeed = hash32(`${seed}:dots:${row}:${column}`);
      let state = dotSeed || 1;
      const random = () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return (state >>> 0) / 0x1_0000_0000;
      };
      const jitter = gap * 0.18;
      const x = column * gap + gap / 2 + (random() - 0.5) * jitter;
      const y = row * gap + gap / 2 + (random() - 0.5) * jitter;
      const drawable = generator.ellipse(x, y, radius * 2, radius * 2, {
        seed: dotSeed,
        stroke: 'currentColor',
        strokeWidth: fill.weight,
        disableMultiStroke: !fill.multipleStrokes,
        roughness: 0.5,
      });
      paths.push(
        ...drawable.sets.map((set) => patternSetPath(set, clip, fill.weight)),
      );
    }
  }
  return paths;
}

export function transformIcon(
  icon: NormalizedIconSource,
  input: RoughIconOptions = {},
) {
  const options = normalizeRoughOptions(input);
  const baseSeed = resolveIconSeed(
    `${icon.iconSet ?? 'lucide'}:${icon.name}`,
    options.seed,
  );
  const generatedPaths: GeneratedIconPath[] = [];
  const clips: GeneratedClipPath[] = [];
  const fillNodes: {
    node: NormalizedIconNode;
    paint: IconPaint;
    index: number;
  }[] = [];

  icon.nodes.forEach((node, index) => {
    const fallback =
      node.type === 'circle' && node.fill
        ? { ...legacyPaint, fill: node.fill }
        : (icon.defaultPaint ?? legacyPaint);
    const paint = node.paint ?? fallback;
    const sourceFilled = paint.fill !== 'none';
    const targetFilled =
      sourceFilled || (options.fill.target === 'closed' && isClosed(node));
    const style = resolveStyle(options.fill.style, sourceFilled);
    const nodeSeed = resolveIconSeed(
      icon.name,
      `${resolveIconSeed(icon.name, options.seed)}:${index}:${JSON.stringify(legacySeedNode(node))}`,
    );
    const common: Options = {
      roughness: options.roughness,
      bowing: options.bowing,
      maxRandomnessOffset: options.maxRandomnessOffset,
      preserveVertices: options.preserveVertices,
      disableMultiStroke: !options.multipleStrokes,
      seed: nodeSeed,
      stroke: paint.stroke,
      strokeWidth: paint.strokeWidth,
    };

    if (
      sourceFilled &&
      paint.stroke !== 'none' &&
      icon.iconStyle !== 'filled'
    ) {
      generatedPaths.push(
        ...drawablePaths(
          drawNode(node, {
            ...common,
            fill: paint.fill,
            fillStyle: 'solid',
          }),
          'source-stroke',
        ),
      );
      return;
    }

    if (paint.stroke !== 'none') {
      generatedPaths.push(
        ...drawablePaths(drawNode(node, common), 'source-stroke').map(
          (path) => ({
            ...path,
            opacity:
              paint.strokeOpacity === 1 ? undefined : paint.strokeOpacity,
          }),
        ),
      );
    }

    if (targetFilled && style !== 'none')
      fillNodes.push({ node, paint, index });
    if (targetFilled && options.fill.edge === 'rough') {
      generatedPaths.push(
        ...drawablePaths(
          drawNode(node, {
            ...common,
            seed: resolveIconSeed(icon.name, `${baseSeed}:fill-edge:${index}`),
            stroke: 'currentColor',
            strokeWidth: options.fill.edgeWidth,
            disableMultiStroke: !options.fill.multipleStrokes,
          }),
          'fill-edge',
        ),
      );
    }
  });

  if (fillNodes.length) {
    const sourceFilled = fillNodes.some(({ paint }) => paint.fill !== 'none');
    const style = resolveStyle(options.fill.style, sourceFilled);
    if (style === 'solid') {
      generatedPaths.unshift(
        ...fillNodes.map(({ node, paint }) => ({
          d: nodePath(node),
          fill: 'currentColor' as const,
          stroke: 'none' as const,
          strokeWidth: 0,
          fillRule: paint.fillRule,
          opacity: paint.fillOpacity === 1 ? undefined : paint.fillOpacity,
          role: 'source-fill' as const,
        })),
      );
    } else if (style !== 'none') {
      const clip = 'fill-0';
      clips.push({
        key: clip,
        shapes: fillNodes.map(({ node, paint }) => ({
          d: nodePath(node),
          clipRule: paint.clipRule,
        })),
      });
      const patternSeed = resolveIconSeed(
        icon.name,
        `${baseSeed}:fill-pattern:${style}:${JSON.stringify(options.fill)}`,
      );
      const patterns =
        style === 'dots'
          ? dotsPattern(
              icon.width,
              icon.height,
              options.fill,
              patternSeed,
              clip,
            )
          : roughPattern(
              style,
              icon.width,
              icon.height,
              options.fill,
              patternSeed,
              clip,
            );
      generatedPaths.unshift(...patterns);
    }
  }

  return {
    name: icon.name,
    width: icon.width,
    height: icon.height,
    paths:
      icon.iconSet === 'tabler' || icon.iconStyle === 'filled'
        ? generatedPaths
        : generatedPaths.map(({ role: _role, ...path }) => path),
    ...(clips.length ? { clips } : {}),
  };
}
