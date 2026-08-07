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
  const collectionCounts = useMemo(
    () => ({
      lucide: icons.filter((icon) => icon.iconSet === 'lucide').length,
      tabler: icons.filter((icon) => icon.iconSet === 'tabler').length,
    }),
    [icons],
  );
  const showCollection = (collection: 'lucide' | 'tabler') => {
    state.setIconSet(collection);
    document.getElementById('icons')?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => setLimit(120), [query, iconSet, iconStyle]);
  return (
    <>
      <header>
        <a className="brand" href={base}>
          <span className="brand-mark" aria-hidden="true">
            〰
          </span>
          Rough Icons
        </a>
        <nav>
          <a href="#collections">Collections</a>
          <a href="#icons">Explorer</a>
          <a href="https://github.com/I-LIKE-ROUGH/rough-icons">GitHub</a>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Lucide + Tabler, redrawn by hand</p>
            <h1>
              Two languages.
              <em>One hand.</em>
            </h1>
            <p className="lede">
              Thousands of familiar Lucide and Tabler icons, transformed into
              deterministic, expressive marks for React and SVG.
            </p>
            <div className="actions">
              <a className="button primary" href="#icons">
                Explore all icons <span aria-hidden="true">↘</span>
              </a>
              <a
                className="text-link"
                href="https://github.com/I-LIKE-ROUGH/rough-icons"
              >
                View on GitHub
              </a>
            </div>
            <div className="hero-installs" aria-label="Package downloads">
              <p>Install your icon language</p>
              <div>
                <a
                  className="hero-install lucide-install"
                  href="https://www.npmjs.com/package/@rough-lucide/react"
                >
                  <span>Lucide</span>
                  <code>pnpm add @rough-lucide/react</code>
                  <b aria-hidden="true">↗</b>
                </a>
                <a
                  className="hero-install tabler-install"
                  href="https://www.npmjs.com/package/@rough-tabler/react"
                >
                  <span>Tabler</span>
                  <code>pnpm add @rough-tabler/react</code>
                  <b aria-hidden="true">↗</b>
                </a>
              </div>
            </div>
          </div>
          <div className="hero-board" aria-hidden="true">
            <p>Same idea. Different vocabulary.</p>
            <div className="hero-pair hero-pair-lucide">
              <span>Lucide / house</span>
              <img src={`${base}icons/lucide/outline/house.svg`} />
            </div>
            <div className="hero-pair hero-pair-tabler">
              <span>Tabler / home</span>
              <img src={`${base}icons/tabler/outline/home.svg`} />
            </div>
            <div className="hero-swarm">
              {[
                ['lucide', 'outline', 'sparkles'],
                ['tabler', 'filled', 'heart'],
                ['tabler', 'outline', 'coffee'],
                ['lucide', 'outline', 'rocket'],
                ['tabler', 'filled', 'flower'],
                ['lucide', 'outline', 'wand-sparkles'],
              ].map(([set, style, name]) => (
                <img
                  key={`${set}-${style}-${name}`}
                  src={`${base}icons/${set}/${style}/${name}.svg`}
                />
              ))}
            </div>
          </div>
        </section>
        <section className="marquee" aria-label="Project qualities">
          <p>
            <span>STATIC FIRST</span> · <span>RUNTIME READY</span> ·{' '}
            <span>DETERMINISTIC</span> · <span>OPEN SOURCE</span> ·{' '}
            <span>7,900+ ICONS</span>
          </p>
        </section>
        <section id="collections" className="collections">
          <div className="section-intro">
            <p className="eyebrow">Choose your visual language</p>
            <h2>Built from icons you already know.</h2>
            <p>
              Keep the source library's personality. Add the warmth and
              variation of a hand-drawn line.
            </p>
          </div>
          <div className="collection-cards">
            <article className="collection-card lucide-card">
              <div className="card-number">01</div>
              <div className="card-icons" aria-hidden="true">
                {['circle', 'triangle', 'square', 'pentagon'].map((name) => (
                  <img
                    key={name}
                    src={`${base}icons/lucide/outline/${name}.svg`}
                  />
                ))}
              </div>
              <p className="eyebrow">Crisp · Minimal · Familiar</p>
              <h3>Lucide</h3>
              <p>
                A clean outline system with a restrained vocabulary, now with
                just enough wobble.
              </p>
              <div className="card-meta">
                <span>{collectionCounts.lucide.toLocaleString()} icons</span>
                <button onClick={() => showCollection('lucide')}>
                  Browse Lucide <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
            <article className="collection-card tabler-card">
              <div className="card-number">02</div>
              <div className="card-icons" aria-hidden="true">
                {['circle', 'triangle', 'square', 'pentagon'].map((name) => (
                  <img
                    key={name}
                    src={`${base}icons/tabler/filled/${name}.svg`}
                  />
                ))}
              </div>
              <p className="eyebrow">Expansive · Versatile · Filled</p>
              <h3>Tabler</h3>
              <p>
                A broad collection in outline and filled styles, roughened
                without losing its range.
              </p>
              <div className="card-meta">
                <span>{collectionCounts.tabler.toLocaleString()} icons</span>
                <button onClick={() => showCollection('tabler')}>
                  Browse Tabler <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          </div>
        </section>
        <section className="principles">
          <article>
            <b>01 / SHIP LIGHT</b>
            <h3>Pre-generated</h3>
            <p>Small static SVG paths. No RoughJS in your bundle by default.</p>
          </article>
          <article>
            <b>02 / MAKE IT YOURS</b>
            <h3>Runtime-ready</h3>
            <p>Tune roughness, bowing, fill patterns, and seed when needed.</p>
          </article>
          <article>
            <b>03 / STAY CONSISTENT</b>
            <h3>Reproducible</h3>
            <p>The same source and seed always produce the same mark.</p>
          </article>
        </section>
        <section id="icons" className="explorer">
          <div className="explorer-head">
            <div>
              <p className="eyebrow">The complete library</p>
              <h2>Find your mark.</h2>
            </div>
            <label>
              <span className="sr-only">Search icons</span>
              <span className="search-glyph" aria-hidden="true">
                ⌕
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search 7,900+ icons…"
              />
            </label>
          </div>
          <div className="filters" aria-label="Icon filters">
            <div className="filter-group">
              <span>Collection</span>
              {(['all', 'lucide', 'tabler'] as const).map((value) => (
                <button
                  key={value}
                  className={iconSet === value ? 'active' : ''}
                  onClick={() => state.setIconSet(value)}
                >
                  {value === 'all'
                    ? 'All icons'
                    : value[0]!.toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <span>Style</span>
              {(['all', 'outline', 'filled'] as const).map((value) => (
                <button
                  key={value}
                  className={iconStyle === value ? 'active' : ''}
                  onClick={() => state.setIconStyle(value)}
                >
                  {value[0]!.toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
            <p className="result-count">
              {filtered.length.toLocaleString()} results
            </p>
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
                <small>
                  {icon.iconSet} · {icon.iconStyle}
                </small>
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
        <section id="install" className="usage">
          <div className="usage-intro">
            <p className="eyebrow">Bring a little imperfection</p>
            <h2>
              Pick a library.
              <br />
              Start drawing.
            </h2>
            <p>
              Static components stay tiny. Runtime entry points unlock live
              roughness, bowing, seeds, and patterned fills.
            </p>
          </div>
          <div className="install-stack">
            <article>
              <div>
                <span className="package-dot lucide-dot" />
                <b>Lucide for React</b>
              </div>
              <code>pnpm add @rough-lucide/react</code>
              <pre>
                <code>{`import { House } from '@rough-lucide/react';\n\n<House size={24} />`}</code>
              </pre>
            </article>
            <article>
              <div>
                <span className="package-dot tabler-dot" />
                <b>Tabler for React</b>
              </div>
              <code>pnpm add @rough-tabler/react</code>
              <pre>
                <code>{`import { IconHomeFilled } from '@rough-tabler/react';\n\n<IconHomeFilled size={24} />`}</code>
              </pre>
            </article>
          </div>
        </section>
      </main>
      <footer>
        <div className="footer-intro">
          <p className="eyebrow">One rough edge, two starting points</p>
          <h2>Use the names you already know.</h2>
          <p>
            Switch collections without switching ideas. Both packages share the
            same deterministic drawing engine and lightweight defaults.
          </p>
        </div>
        <div className="footer-examples">
          <article className="footer-example lucide-example">
            <div>
              <span>Lucide / outline</span>
              <img
                src={`${base}icons/lucide/outline/house.svg`}
                alt="Rough Lucide house icon"
              />
            </div>
            <pre>
              <code>{`import { House } from '@rough-lucide/react';\n\n<House size={32} />`}</code>
            </pre>
          </article>
          <article className="footer-example tabler-example">
            <div>
              <span>Tabler / filled</span>
              <img
                src={`${base}icons/tabler/filled/heart.svg`}
                alt="Rough Tabler filled heart icon"
              />
            </div>
            <pre>
              <code>{`import { IconHeartFilled } from '@rough-tabler/react';\n\n<IconHeartFilled size={32} />`}</code>
            </pre>
          </article>
        </div>
        <div className="footer-bottom">
          <a className="brand" href={base}>
            <span className="brand-mark" aria-hidden="true">
              〰
            </span>{' '}
            Rough Icons
          </a>
          <p>Lucide ISC · Tabler MIT · RoughJS MIT</p>
          <p>Open source · Built for React + SVG</p>
        </div>
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
