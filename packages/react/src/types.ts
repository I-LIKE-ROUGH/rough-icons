import type { SVGProps } from 'react';
import type { RoughIconOptions } from '@rough-lucide/core';

export type RoughIconProps = Omit<SVGProps<SVGSVGElement>, 'color'> & {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
  title?: string;
};

export type RuntimeRoughIconProps = RoughIconProps & {
  rough?: RoughIconOptions;
  preset?: 'editorial' | 'subtle' | 'sketch';
  variant?: string;
};
