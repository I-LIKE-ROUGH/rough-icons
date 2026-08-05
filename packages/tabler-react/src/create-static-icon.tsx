import { forwardRef, useId } from 'react';
import type { GeneratedIcon } from '@rough-lucide/core';
import type { RoughTablerIconProps } from './types.js';

export function createStaticIcon(data: GeneratedIcon) {
  const Icon = forwardRef<SVGSVGElement, RoughTablerIconProps>(
    function RoughTablerIcon(
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
      const instanceId = `rough-${useId().replaceAll(':', '')}`;
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
          {data.clips?.length ? (
            <defs>
              {data.clips.map((clip) => (
                <clipPath id={`${instanceId}-${clip.key}`} key={clip.key}>
                  {clip.shapes.map((shape, index) => (
                    <path key={index} d={shape.d} clipRule={shape.clipRule} />
                  ))}
                </clipPath>
              ))}
            </defs>
          ) : null}
          {data.paths.map((path, index) => (
            <path
              key={index}
              d={path.d}
              fill={path.fill}
              stroke={path.stroke}
              strokeWidth={(path.strokeWidth / 2) * resolvedStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fillRule={path.fillRule}
              clipPath={
                path.clip ? `url(#${instanceId}-${path.clip})` : undefined
              }
              opacity={path.opacity}
            />
          ))}
        </svg>
      );
    },
  );
  Icon.displayName = `Icon${data.name
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join('')}`;
  return Icon;
}
