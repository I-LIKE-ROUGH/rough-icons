# Rough Lucide

Deterministic, hand-drawn Lucide icons generated with RoughJS. This is an unofficial derivative project.

## Install

```sh
pnpm add @rough-lucide/react
```

```tsx
import { House } from '@rough-lucide/react';

<House size={24} strokeWidth={1.8} />;
```

Runtime customization is opt-in:

```tsx
import { House } from '@rough-lucide/react/runtime';

<House variant="sidebar" rough={{ roughness: 0.8, bowing: 1.1 }} />;
```

## Workspace

- `@rough-lucide/core` — deterministic framework-independent transformer
- `@rough-lucide/icons` — pre-generated paths and normalized Lucide source data
- `@rough-lucide/react` — static and runtime React components
- `@rough-lucide/site` — searchable GitHub Pages explorer

Turbo orchestrates workspace builds and type checks, while tsdown builds the library packages. Run `pnpm generate`, `pnpm test`, `pnpm typecheck`, and `pnpm build`. Use `pnpm lint` and `pnpm format:check` for Oxlint and Oxfmt validation. Generated package source and `manifests/generation.json` are committed so upstream changes remain reviewable.

Original icon designs are provided by Lucide contributors under the ISC License. Hand-drawn paths are generated using RoughJS under the MIT License. See `NOTICE` and `LICENSES/`.
