# Rough Lucide + Tabler

Deterministic, hand-drawn Lucide icons generated with RoughJS. This is an unofficial derivative project.

The same pipeline also ships all Tabler outline icons and topology-safe Tabler filled icons.

## Install

```sh
pnpm add @rough-lucide/react
```

```tsx
import { House } from '@rough-lucide/react';

<House size={24} strokeWidth={1.8} />;
```

Tabler outline and filled packages use Tabler's `Icon` naming convention:

```sh
pnpm add @rough-tabler/react
```

```tsx
import { IconHome, IconHomeFilled } from '@rough-tabler/react';

<IconHome />;
<IconHomeFilled />;
```

Runtime customization is opt-in:

```tsx
import { House } from '@rough-lucide/react/runtime';

<House variant="sidebar" rough={{ roughness: 0.8, bowing: 1.1 }} />;
```

Filled patterns are generated at runtime and clipped against the untouched Tabler source path, preserving compound paths and holes:

```tsx
import { IconHomeFilled } from '@rough-tabler/react/runtime';

<IconHomeFilled
  rough={{
    fill: { style: 'cross-hatch', angle: -35, gap: 2, edge: 'rough' },
  }}
/>;
```

Supported runtime fills are `solid`, `hachure`, `cross-hatch`, `zigzag`, `dots`, `dashed`, and `zigzag-line`. Dots use a project-owned seeded engine rather than RoughJS's nondeterministic dot placement.

## Workspace

- `@rough-lucide/core` — deterministic framework-independent transformer
- `@rough-lucide/icons` — pre-generated paths and normalized Lucide source data
- `@rough-lucide/react` — static and runtime React components
- `@rough-lucide/site` — searchable GitHub Pages explorer
- `@rough-tabler/icons` — Tabler outline/filled source and pre-generated paths
- `@rough-tabler/react` — static and runtime Tabler components

Turbo orchestrates workspace builds and type checks, while tsdown builds the library packages. Run `pnpm generate`, `pnpm test`, `pnpm typecheck`, and `pnpm build`. Use `pnpm lint` and `pnpm format:check` for Oxlint and Oxfmt validation. Generated package source and `manifests/generation.json` are committed so upstream changes remain reviewable.

Original icon designs are provided by Lucide contributors under the ISC License and Tabler Icons under the MIT License. Hand-drawn paths are generated using RoughJS under the MIT License. See `NOTICE` and `LICENSES/`.
