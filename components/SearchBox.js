'use client';
import { useRouter } from 'next/navigation';
import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { useSearchHistory } from '@/lib/library';
import { ClockIcon, CloseIcon, SearchIcon } from './Icons';

const FILTERS = [['all', 'All'], ['movie', 'Movies'], ['tv', 'TV'], ['anime', 'Anime']];

const SearchBox = forwardRef(function SearchBox({ initial = '', onDone, autoFocus = false, variant = 'nav' }, ref) {
  const router = useRouter();
  const listId = useId();
  const history = useSearchHistory();
  const [q, setQ] = useState(initial);
  const [type, setType] = useState('all');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(term)}&type=${type}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => { setResults(d.results || []); setActive(-1); setLoading(false); })
        .catch((e) => { if (e.name !== 'AbortError') { setResults([]); setLoading(false); } });
    }, 220);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, type]);

  useEffect(() => {
    const close = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const go = (href, term) => {
    if (term) history.add(term);
    setOpen(false);
    onDone?.();
    router.push(href);
  };

  const submit = (e) => {
    e.preventDefault();
    if (active >= 0 && results[active]) return go(results[active].href, q);
    const term = q.trim();
    if (term) go(`/search?q=${encodeURIComponent(term)}${type !== 'all' ? `&type=${type}` : ''}`, term);
  };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
    else if (e.key === 'Escape') { setOpen(false); onDone?.(); }
  };

  const showHistory = open && q.trim().length < 2 && history.list.length > 0;
  const showResults = open && q.trim().length >= 2;

  return (
    <div className={`searchbox searchbox--${variant}`} ref={boxRef}>
      <form onSubmit={submit} role="search">
        <SearchIcon className="searchbox__icon" width={18} height={18} />
        <input
          ref={ref}
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search movies, shows, anime"
          aria-label="Search"
          role="combobox"
          aria-expanded={showResults || showHistory}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        />
      </form>

      {(showResults || showHistory) && (
        <div className="suggest" id={listId} role="listbox">
          {showResults && (
            <div className="suggest__filters" role="group" aria-label="Filter suggestions">
              {FILTERS.map(([v, l]) => (
                <button key={v} type="button" className={`pill ${type === v ? 'is-on' : ''}`} onClick={() => setType(v)} aria-pressed={type === v}>{l}</button>
              ))}
            </div>
          )}

          {showHistory && (
            <>
              <div className="suggest__label">
                <span>Recent searches</span>
                <button type="button" className="link-btn" onClick={history.clear}>Clear</button>
              </div>
              {history.list.map((term) => (
                <div key={term} className="suggest__hist">
                  <button type="button" onClick={() => { setQ(term); }}>
                    <ClockIcon width={16} height={16} /> {term}
                  </button>
                  <button type="button" className="icon-btn icon-btn--sm" aria-label={`Remove ${term}`} onClick={() => history.remove(term)}>
                    <CloseIcon width={14} height={14} />
                  </button>
                </div>
              ))}
            </>
          )}

          {showResults && loading && results.length === 0 && <p className="suggest__msg">Searching…</p>}
          {showResults && !loading && results.length === 0 && <p className="suggest__msg">No matches. Try the original title.</p>}
          {showResults && results.map((r, i) => (
            <button
              type="button"
              key={r.key}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`suggest__item ${i === active ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r.href, q)}
            >
              {r.poster ? <img src={r.poster} alt="" /> : <span className="suggest__noimg" />}
              <span className="suggest__text">
                <span className="suggest__title">{r.title}</span>
                <span className="suggest__sub">{[r.type, r.year, r.rating ? `★ ${r.rating.toFixed(1)}` : null].filter(Boolean).join('  ')}</span>
              </span>
            </button>
          ))}
          {showResults && results.length > 0 && (
            <button type="submit" className="suggest__all" onClick={submit}>See all results for “{q.trim()}”</button>
          )}
        </div>
      )}
    </div>
  );
});

export default SearchBox;
