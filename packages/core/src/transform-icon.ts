import { RoughGenerator } from 'roughjs/bin/generator.js';
import type { Drawable, Options } from 'roughjs/bin/core.js';
import svgpath from 'svgpath';
import { normalizeRoughOptions } from './normalize-options.js';
import { resolveIconSeed } from './seed.js';
import type {
  GeneratedIconPath,
  NormalizedIconNode,
  NormalizedIconSource,
  RoughIconOptions,
} from './types.js';

const generator = new RoughGenerator();

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

function drawNode(node: NormalizedIconNode, options: Options): Drawable {
  const nodeOptions =
    node.type === 'circle' && node.fill
      ? { ...options, fill: node.fill, fillStyle: 'solid' }
      : options;
  switch (node.type) {
    case 'path':
      return generator.path(svgpath(node.d).toString(), nodeOptions);
    case 'line':
      return generator.line(node.x1, node.y1, node.x2, node.y2, nodeOptions);
    case 'polyline':
      return generator.linearPath(
        node.points.map(([x, y]) => [x, y]),
        nodeOptions,
      );
    case 'polygon':
      return generator.polygon(
        node.points.map(([x, y]) => [x, y]),
        nodeOptions,
      );
    case 'circle':
      return generator.circle(node.cx, node.cy, node.r * 2, nodeOptions);
    case 'ellipse':
      return generator.ellipse(
        node.cx,
        node.cy,
        node.rx * 2,
        node.ry * 2,
        nodeOptions,
      );
    case 'rectangle':
      return generator.path(roundedRectanglePath(node), nodeOptions);
  }
}

function paths(drawable: Drawable): GeneratedIconPath[] {
  return drawable.sets.map((set) => ({
    d: generator.opsToPath(set, 3),
    fill: set.type === 'fillPath' ? drawable.options.fill || 'none' : 'none',
    stroke: set.type === 'fillPath' ? 'none' : 'currentColor',
    strokeWidth: drawable.options.strokeWidth,
  }));
}

export function transformIcon(
  icon: NormalizedIconSource,
  input: RoughIconOptions = {},
) {
  const options = normalizeRoughOptions(input);
  const baseSeed = resolveIconSeed(icon.name, options.seed);
  const generatedPaths = icon.nodes.flatMap((node, index) =>
    paths(
      drawNode(node, {
        roughness: options.roughness,
        bowing: options.bowing,
        maxRandomnessOffset: options.maxRandomnessOffset,
        preserveVertices: options.preserveVertices,
        disableMultiStroke: !options.multipleStrokes,
        seed: resolveIconSeed(
          icon.name,
          `${baseSeed}:${index}:${JSON.stringify(node)}`,
        ),
        stroke: 'currentColor',
        strokeWidth: 2,
      }),
    ),
  );
  return {
    name: icon.name,
    width: icon.width,
    height: icon.height,
    paths: generatedPaths,
  };
}
