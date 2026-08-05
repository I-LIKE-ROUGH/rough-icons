import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import type { NormalizedIconSource } from '@rough-lucide/core';

type Record = {
  name: string;
  aliases: string[];
  categories: string[];
  tags: string[];
  searchText: string;
};
type Path = { d: string; fill: string; stroke: string; strokeWidth: number };
const base = import.meta.env.BASE_URL;

function useUrlState() {
  const initial = new URLSearchParams(location.search);
  const [query, setQuery] = useState(initial.get('q') ?? '');
  const [selected, setSelected] = useState(initial.get('icon'));
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selected) params.set('icon', selected);
    history.replaceState(
      null,
      '',
      `${location.pathname}${params.size ? `?${params}` : ''}`,
    );
  }, [query, selected]);
  return { query, setQuery, selected, setSelected };
}

function App() {
  const [icons, setIcons] = useState<Record[]>([]);
  const [limit, setLimit] = useState(120);
  const { query, setQuery, selected, setSelected } = useUrlState();
  useEffect(() => {
    fetch(`${base}data/icons-index.json`)
      .then((response) => response.json())
      .then(setIcons);
  }, []);
  const filtered = useMemo(() => {
    const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return icons.filter((icon) =>
      tokens.every((token) => icon.searchText.includes(token)),
    );
  }, [icons, query]);
  useEffect(() => setLimit(120), [query]);
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
                <img key={name} src={`${base}icons/${name}.svg`} />
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
          <div className="grid">
            {filtered.slice(0, limit).map((icon) => (
              <button
                key={icon.name}
                onClick={() => setSelected(icon.name)}
                aria-label={`Open ${icon.name} icon`}
              >
                <img
                  src={`${base}icons/${icon.name}.svg`}
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
        <Drawer name={selected} close={() => setSelected(null)} />
      ) : null}
    </>
  );
}

function Drawer({ name, close }: { name: string; close: () => void }) {
  const panel = useRef<HTMLElement>(null);
  const [roughness, setRoughness] = useState(0.75);
  const [bowing, setBowing] = useState(0.85);
  const [seed, setSeed] = useState('preview');
  const [paths, setPaths] = useState<Path[] | null>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && close();
    document.addEventListener('keydown', escape);
    panel.current?.focus();
    return () => document.removeEventListener('keydown', escape);
  }, []);
  useEffect(() => {
    let live = true;
    Promise.all([
      import('@rough-lucide/core/runtime'),
      import('@rough-lucide/icons/source/dynamic'),
    ]).then(async ([core, sourceMap]) => {
      const module = await sourceMap.sourceIconImports[name]?.();
      const source =
        module &&
        (Object.values(module)[0] as NormalizedIconSource | undefined);
      if (live && source)
        setPaths(core.transformIcon(source, { roughness, bowing, seed }).paths);
    });
    return () => {
      live = false;
    };
  }, [name, roughness, bowing, seed]);
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setNotice('Copied to clipboard');
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${paths?.map((path) => `<path d="${path.d}" fill="${path.fill}" stroke="currentColor" stroke-width="2"/>`).join('') ?? ''}</svg>`;
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
        <h2 id="drawer-title">{name}</h2>
        <div className="preview">
          {paths ? (
            <svg viewBox="0 0 24 24">
              {paths.map((path, index) => (
                <path
                  key={index}
                  {...path}
                  strokeWidth="2"
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
                `import { ${name
                  .split('-')
                  .map((part) => part[0]!.toUpperCase() + part.slice(1))
                  .join('')} } from '@rough-lucide/react';`,
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
