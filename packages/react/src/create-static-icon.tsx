import { forwardRef } from 'react';
import type { GeneratedIcon } from '@rough-lucide/core';
import type { RoughIconProps } from './types.js';

export function createStaticIcon(data: GeneratedIcon) {
  const Icon = forwardRef<SVGSVGElement, RoughIconProps>(
    function RoughLucideIcon(
      {
        size = 24,
        color = 'currentColor',
        strokeWidth = 2,
        absoluteStrokeWidth = false,
        title,
        ...props
      },
      ref,
    ) {
      const resolvedStrokeWidth =
        absoluteStrokeWidth && typeof size === 'number'
          ? (strokeWidth * 24) / size
          : strokeWidth;
      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox={`0 0 ${data.width} ${data.height}`}
          fill="none"
          color={color}
          role={title ? 'img' : undefined}
          aria-hidden={title ? undefined : true}
          {...props}
        >
          {title ? <title>{title}</title> : null}
          {data.paths.map((path, index) => (
            <path
              key={index}
              d={path.d}
              fill={path.fill}
              stroke={path.stroke}
              strokeWidth={resolvedStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      );
    },
  );
  Icon.displayName = data.name
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join('');
  return Icon;
}
