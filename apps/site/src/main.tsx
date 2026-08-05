import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import type {
  GeneratedIcon,
  NormalizedIconSource,
  RoughFillStyle,
} from '@rough-lucide/core';

type Record = {
  id: string;
  name: string;
  iconSet: 'lucide' | 'tabler';
  iconStyle: 'outline' | 'filled';
  aliases: string[];
  categories: string[];
  tags: string[];
  searchText: string;
};
const base = import.meta.env.BASE_URL;

function useUrlState() {
  const initial = new URLSearchParams(location.search);
  const [query, setQuery] = useState(initial.get('q') ?? '');
  const [selected, setSelected] = useState(initial.get('icon'));
  const [iconSet, setIconSet] = useState<'all' | 'lucide' | 'tabler'>(
    initial.get('set') === 'lucide' || initial.get('set') === 'tabler'
      ? (initial.get('set') as 'lucide' | 'tabler')
      : 'all',
  );
  const [iconStyle, setIconStyle] = useState<'all' | 'outline' | 'filled'>(
    initial.get('sourceStyle') === 'outline' ||
      initial.get('sourceStyle') === 'filled'
      ? (initial.get('sourceStyle') as 'outline' | 'filled')
      : 'all',
  );
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selected) params.set('icon', selected);
    if (iconSet !== 'all') params.set('set', iconSet);
    if (iconStyle !== 'all') params.set('sourceStyle', iconStyle);
    history.replaceState(
      null,
      '',
      `${location.pathname}${params.size ? `?${params}` : ''}`,
    );
  }, [query, selected, iconSet, iconStyle]);
  return {
    query,
    setQuery,
    selected,
    setSelected,
    iconSet,
    setIconSet,
    iconStyle,
    setIconStyle,
  };
}

function App() {
  const [icons, setIcons] = useState<Record[]>([]);
  const [limit, setLimit] = useState(120);
  const state = useUrlState();
  const { query, setQuery, selected, setSelected, iconSet, iconStyle } = state;
  useEffect(() => {
    fetch(`${base}data/icons-index.json`)
      .then((response) => response.json())
      .then(setIcons);
  }, []);
  const filtered = useMemo(() => {
    const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return icons.filter(
      (icon) =>
        (iconSet === 'all' || icon.iconSet === iconSet) &&
        (iconStyle === 'all' || icon.iconStyle === iconStyle) &&
        tokens.every((token) => icon.searchText.includes(token)),
    );
  }, [icons, query, iconSet, iconStyle]);
  useEffect(() => setLimit(120), [query, iconSet, iconStyle]);
  return (
    <>
      <header>
        <a className="brand" href={base}>
          〰 Rough Lucide
        </a>
        <nav>
          <a href="https://github.com/sung-yein/rough-lucide">GitHub</a>
          <a href="https://www.npmjs.com/package/@rough-lucide/react">npm</a>
        </nav>
      </header>
      <main>
        <section className="hero">
          <p className="eyebrow">Lucide, with a human hand.</p>
          <h1>
            Hand-drawn
            <br />
            <em>Lucide icons.</em>
          </h1>
          <p className="lede">
            Deterministic by default, customizable when needed. No runtime cost
            unless you ask for it.
          </p>
          <div className="actions">
            <a className="button primary" href="#icons">
              Browse icons
            </a>
            <code>pnpm add @rough-lucide/react</code>
          </div>
          <div className="hero-icons" aria-hidden="true">
            {['sparkles', 'heart', 'coffee', 'rocket', 'house', 'flower-2'].map(
              (name) => (
                <img
                  key={name}
                  src={`${base}icons/lucide/outline/${name}.svg`}
                />
              ),
            )}
          </div>
        </section>
        <section className="features">
          <article>
            <b>01</b>
            <h2>Pre-generated</h2>
            <p>Small static SVG paths with no RoughJS in your bundle.</p>
          </article>
          <article>
            <b>02</b>
            <h2>Runtime-ready</h2>
            <p>Tune roughness, bowing and seed when expression matters.</p>
          </article>
          <article>
            <b>03</b>
            <h2>Reproducible</h2>
            <p>The same source and seed always produce the same mark.</p>
          </article>
        </section>
        <section id="icons" className="explorer">
          <div className="explorer-head">
            <div>
              <p className="eyebrow">The collection</p>
              <h2>{filtered.length.toLocaleString()} icons</h2>
            </div>
            <label>
              <span className="sr-only">Search icons</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search icons…"
              />
            </label>
          </div>
          <div className="filters" aria-label="Icon filters">
            <label>
              Icon set
              <select
                value={iconSet}
                onChange={(event) =>
                  state.setIconSet(event.target.value as typeof iconSet)
                }
              >
                <option value="all">All sets</option>
                <option value="lucide">Lucide</option>
                <option value="tabler">Tabler</option>
              </select>
            </label>
            <label>
              Source style
              <select
                value={iconStyle}
                onChange={(event) =>
                  state.setIconStyle(event.target.value as typeof iconStyle)
                }
              >
                <option value="all">All styles</option>
                <option value="outline">Outline</option>
                <option value="filled">Filled</option>
              </select>
            </label>
          </div>
          <div className="grid">
            {filtered.slice(0, limit).map((icon) => (
              <button
                key={icon.id}
                onClick={() => setSelected(icon.id)}
                aria-label={`Open ${icon.name} icon`}
              >
                <img
                  src={`${base}icons/${icon.iconSet}/${icon.iconStyle}/${icon.name}.svg`}
                  loading="lazy"
                  alt=""
                />
                <span>{icon.name}</span>
              </button>
            ))}
          </div>
          {limit < filtered.length ? (
            <button
              className="load"
              onClick={() => setLimit((value) => value + 120)}
            >
              Load more
            </button>
          ) : null}
        </section>
        <section className="usage">
          <p className="eyebrow">Use it your way</p>
          <h2>
            Static first.
            <br />
            Rough on demand.
          </h2>
          <pre>
            <code>{`import { House } from '@rough-lucide/react';\n\n<House size={24} strokeWidth={1.8} />`}</code>
          </pre>
        </section>
      </main>
      <footer>
        <span>Rough Lucide</span>
        <p>
          An unofficial derivative of Lucide Icons. Paths generated with
          RoughJS.
        </p>
      </footer>
      {selected ? (
        <Drawer
          icon={icons.find((record) => record.id === selected)}
          close={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}

function Drawer({ icon, close }: { icon?: Record; close: () => void }) {
  const panel = useRef<HTMLElement>(null);
  const [roughness, setRoughness] = useState(0.75);
  const [bowing, setBowing] = useState(0.85);
  const [seed, setSeed] = useState('preview');
  const [fillStyle, setFillStyle] = useState<RoughFillStyle>('source');
  const [fillGap, setFillGap] = useState(2);
  const [fillAngle, setFillAngle] = useState(-41);
  const [data, setData] = useState<GeneratedIcon | null>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && close();
    document.addEventListener('keydown', escape);
    panel.current?.focus();
    return () => document.removeEventListener('keydown', escape);
  }, []);
  useEffect(() => {
    let live = true;
    if (!icon) return;
    const sourceMapPromise =
      icon.iconSet === 'lucide'
        ? import('@rough-lucide/icons/source/dynamic')
        : icon.iconStyle === 'filled'
          ? import('@rough-tabler/icons/source/dynamic/filled')
          : import('@rough-tabler/icons/source/dynamic/outline');
    Promise.all([import('@rough-lucide/core/runtime'), sourceMapPromise]).then(
      async ([core, sourceMap]) => {
        const module = await sourceMap.sourceIconImports[icon.name]?.();
        const source =
          module &&
          (Object.values(module)[0] as NormalizedIconSource | undefined);
        if (live && source)
          setData(
            core.transformIcon(source, {
              roughness,
              bowing,
              seed,
              fill: {
                style: fillStyle,
                gap: fillGap,
                angle: fillAngle,
              },
            }),
          );
      },
    );
    return () => {
      live = false;
    };
  }, [icon?.id, roughness, bowing, seed, fillStyle, fillGap, fillAngle]);
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setNotice('Copied to clipboard');
  };
  if (!icon) return null;
  const clipPrefix = 'rough-preview';
  const defs = data?.clips?.length
    ? `<defs>${data.clips.map((clip) => `<clipPath id="${clipPrefix}-${clip.key}">${clip.shapes.map((shape) => `<path d="${shape.d}" clip-rule="${shape.clipRule}"/>`).join('')}</clipPath>`).join('')}</defs>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${defs}${data?.paths.map((path) => `<path d="${path.d}" fill="${path.fill}" stroke="${path.stroke}" stroke-width="${path.strokeWidth}"${path.clip ? ` clip-path="url(#${clipPrefix}-${path.clip})"` : ''}/>`).join('') ?? ''}</svg>`;
  return (
    <div
      className="scrim"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <aside
        className="drawer"
        ref={panel}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
        aria-labelledby="drawer-title"
      >
        <button className="close" onClick={close} aria-label="Close">
          ×
        </button>
        <p className="eyebrow">Icon playground</p>
        <h2 id="drawer-title">{icon.name}</h2>
        <p className="source-label">
          {icon.iconSet} · {icon.iconStyle}
        </p>
        <div className="preview">
          {data ? (
            <svg viewBox="0 0 24 24">
              {data.clips?.length ? (
                <defs>
                  {data.clips.map((clip) => (
                    <clipPath id={`${clipPrefix}-${clip.key}`} key={clip.key}>
                      {clip.shapes.map((shape, index) => (
                        <path
                          key={index}
                          d={shape.d}
                          clipRule={shape.clipRule}
                        />
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
                  strokeWidth={path.strokeWidth}
                  fillRule={path.fillRule}
                  opacity={path.opacity}
                  clipPath={
                    path.clip ? `url(#${clipPrefix}-${path.clip})` : undefined
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>
          ) : (
            <span>Loading runtime…</span>
          )}
        </div>
        <label>
          Roughness <output>{roughness}</output>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={roughness}
            onChange={(e) => setRoughness(+e.target.value)}
          />
        </label>
        {icon.iconStyle === 'filled' ? (
          <>
            <label>
              Fill style
              <select
                value={fillStyle}
                onChange={(event) =>
                  setFillStyle(event.target.value as RoughFillStyle)
                }
              >
                {[
                  'source',
                  'none',
                  'solid',
                  'hachure',
                  'cross-hatch',
                  'zigzag',
                  'dots',
                  'dashed',
                  'zigzag-line',
                ].map((style) => (
                  <option value={style} key={style}>
                    {style}
                  </option>
                ))}
              </select>
            </label>
            {!['source', 'none', 'solid'].includes(fillStyle) ? (
              <>
                <label>
                  Fill gap <output>{fillGap}</output>
                  <input
                    type="range"
                    min="0.5"
                    max="6"
                    step="0.1"
                    value={fillGap}
                    onChange={(event) => setFillGap(+event.target.value)}
                  />
                </label>
                {fillStyle !== 'dots' ? (
                  <label>
                    Fill angle <output>{fillAngle}</output>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={fillAngle}
                      onChange={(event) => setFillAngle(+event.target.value)}
                    />
                  </label>
                ) : null}
              </>
            ) : null}
          </>
        ) : null}
        <label>
          Bowing <output>{bowing}</output>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={bowing}
            onChange={(e) => setBowing(+e.target.value)}
          />
        </label>
        <label>
          Seed
          <input value={seed} onChange={(e) => setSeed(e.target.value)} />
        </label>
        <div className="copy">
          <button
            onClick={() =>
              copy(
                `import { ${icon.iconSet === 'tabler' ? 'Icon' : ''}${icon.name
                  .split('-')
                  .map((part) => part[0]!.toUpperCase() + part.slice(1))
                  .join(
                    '',
                  )}${icon.iconStyle === 'filled' ? 'Filled' : ''} } from '@rough-${icon.iconSet}/react';`,
              )
            }
          >
            Copy React import
          </button>
          <button onClick={() => copy(svg)}>Copy SVG</button>
        </div>
        <p aria-live="polite">{notice}</p>
      </aside>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
