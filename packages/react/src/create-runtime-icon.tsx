import { forwardRef, useMemo } from 'react';
import {
  editorialPreset,
  sketchPreset,
  subtlePreset,
  transformIcon,
} from '@rough-lucide/core';
import type {
  GeneratedIcon,
  NormalizedIconSource,
  RoughIconOptions,
} from '@rough-lucide/core';
import { createStaticIcon } from './create-static-icon.js';
import type { RuntimeRoughIconProps } from './types.js';

const cache = new Map<string, GeneratedIcon>();
const presets = {
  editorial: editorialPreset,
  subtle: subtlePreset,
  sketch: sketchPreset,
};

function generate(source: NormalizedIconSource, options: RoughIconOptions) {
  const key = `${source.name}:${JSON.stringify(options)}`;
  const found = cache.get(key);
  if (found) return found;
  const generated = transformIcon(source, options);
  cache.set(key, generated);
  if (cache.size > 128) cache.delete(cache.keys().next().value!);
  return generated;
}

export function createRuntimeIcon(source: NormalizedIconSource) {
  const Icon = forwardRef<SVGSVGElement, RuntimeRoughIconProps>(
    function RuntimeRoughLucideIcon(
      { rough, preset = 'editorial', variant, ...props },
      ref,
    ) {
      const options = {
        ...presets[preset],
        ...rough,
        seed: rough?.seed ?? variant,
      };
      const data = useMemo(
        () => generate(source, options),
        [JSON.stringify(options)],
      );
      const StaticIcon = useMemo(() => createStaticIcon(data), [data]);
      return <StaticIcon ref={ref} {...props} />;
    },
  );
  Icon.displayName = `${source.name}Runtime`;
  return Icon;
}
