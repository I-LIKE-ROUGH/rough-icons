import type { NormalizedIconNode, NormalizedIconSource } from '@rough-lucide/core';
import type { LucideIconData, LucideIconNode } from '@lucide/icons';

const number = (value: string | undefined, field: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid numeric ${field}: ${value}`);
  return parsed;
};

const points = (value: string | undefined): [number, number][] => {
  if (!value) throw new Error('Missing points');
  const values = value.trim().split(/[\s,]+/).map((item) => number(item, 'point'));
  if (values.length % 2 !== 0) throw new Error(`Invalid points: ${value}`);
  const result: [number, number][] = [];
  for (let index = 0; index < values.length; index += 2) result.push([values[index]!, values[index + 1]!]);
  return result;
};

function assertAttributes(tag: string, attributes: Record<string, string>, allowed: string[]) {
  const unknown = Object.keys(attributes).filter((key) => key !== 'key' && !allowed.includes(key));
  if (unknown.length) throw new Error(`Unsupported ${tag} attributes: ${unknown.join(', ')}`);
}

function normalizeNode(node: LucideIconNode): NormalizedIconNode {
  if (node.length !== 2) throw new Error(`Unsupported nested SVG element: ${node[0]}`);
  const [tag, attributes] = node;
  switch (tag) {
    case 'path':
      assertAttributes(tag, attributes, ['d']);
      if (!attributes.d) throw new Error('Path is missing d');
      return { type: 'path', d: attributes.d };
    case 'line':
      assertAttributes(tag, attributes, ['x1', 'y1', 'x2', 'y2']);
      return { type: 'line', x1: number(attributes.x1, 'x1'), y1: number(attributes.y1, 'y1'), x2: number(attributes.x2, 'x2'), y2: number(attributes.y2, 'y2') };
    case 'polyline':
    case 'polygon':
      assertAttributes(tag, attributes, ['points']);
      return { type: tag, points: points(attributes.points) };
    case 'circle':
      assertAttributes(tag, attributes, ['cx', 'cy', 'r', 'fill']);
      if (attributes.fill && attributes.fill !== 'currentColor') throw new Error(`Unsupported fill: ${attributes.fill}`);
      return { type: 'circle', cx: number(attributes.cx, 'cx'), cy: number(attributes.cy, 'cy'), r: number(attributes.r, 'r'), ...(attributes.fill ? { fill: 'currentColor' as const } : {}) };
    case 'ellipse':
      assertAttributes(tag, attributes, ['cx', 'cy', 'rx', 'ry']);
      return { type: 'ellipse', cx: number(attributes.cx, 'cx'), cy: number(attributes.cy, 'cy'), rx: number(attributes.rx, 'rx'), ry: number(attributes.ry, 'ry') };
    case 'rect':
      assertAttributes(tag, attributes, ['x', 'y', 'width', 'height', 'rx', 'ry']);
      return { type: 'rectangle', x: number(attributes.x, 'x'), y: number(attributes.y, 'y'), width: number(attributes.width, 'width'), height: number(attributes.height, 'height'), ...(attributes.rx ? { rx: number(attributes.rx, 'rx') } : {}), ...(attributes.ry ? { ry: number(attributes.ry, 'ry') } : {}) };
    default:
      throw new Error(`Unsupported SVG element: ${tag}`);
  }
}

export function normalizeLucideIcon(icon: LucideIconData): NormalizedIconSource {
  try {
    const width = 'size' in icon ? icon.size : icon.width;
    const height = 'size' in icon ? icon.size : icon.height;
    return { name: icon.name, width, height, nodes: icon.node.map(normalizeNode) };
  } catch (error) {
    throw new Error(`Failed to normalize ${icon.name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
