'use client';
// Personal library kept in localStorage: watchlist, favorites, recently viewed,
// continue watching and search history. One hook, many collections.
import { useCallback, useEffect, useState } from 'react';

const PREFIX = 'ember:';
const EVENT = 'ember-library-change';
const LIMITS = { recent: 24, continue: 20, searches: 8 };

// Carry over a list saved by the earlier "Marquee" version of the site.
function migrate() {
  try {
    const old = localStorage.getItem('marquee-my-list');
    if (old && !localStorage.getItem(PREFIX + 'watchlist')) localStorage.setItem(PREFIX + 'watchlist', old);
    if (old) localStorage.removeItem('marquee-my-list');
  } catch {}
}

export function readCollection(name) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + name) || '[]');
  } catch {
    return [];
  }
}

function write(name, list) {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT, { detail: name }));
}

// The fields worth keeping for a title card.
export const slim = ({ key, id, type, title, year, rating, poster, backdrop, href }) => ({
  key, id, type, title, year, rating, poster, backdrop: backdrop || null, href,
});

export function useCollection(name) {
  const [list, setList] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    migrate();
    const sync = (e) => {
      if (!e?.detail || e.detail === name || e.type === 'storage') setList(readCollection(name));
    };
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [name]);

  const has = useCallback((key) => list.some((i) => (i.key ?? i) === key), [list]);

  const toggle = useCallback(
    (item) => {
      const current = readCollection(name);
      const exists = current.some((i) => i.key === item.key);
      write(name, exists ? current.filter((i) => i.key !== item.key) : [{ ...slim(item), addedAt: Date.now() }, ...current]);
    },
    [name]
  );

  // Move an entry to the front (used for recently viewed, continue watching).
  const push = useCallback(
    (item, extra = {}) => {
      const current = readCollection(name).filter((i) => i.key !== item.key);
      const next = [{ ...slim(item), ...extra, at: Date.now() }, ...current].slice(0, LIMITS[name] || 200);
      write(name, next);
    },
    [name]
  );

  const remove = useCallback((key) => write(name, readCollection(name).filter((i) => i.key !== key)), [name]);
  const clear = useCallback(() => write(name, []), [name]);

  return { list, ready, has, toggle, push, remove, clear };
}

// Search history stores plain strings.
export function useSearchHistory() {
  const [list, setList] = useState([]);
  useEffect(() => {
    const sync = () => setList(readCollection('searches'));
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  const add = useCallback((q) => {
    const term = q.trim();
    if (!term) return;
    const next = [term, ...readCollection('searches').filter((s) => s.toLowerCase() !== term.toLowerCase())];
    write('searches', next.slice(0, LIMITS.searches));
  }, []);
  const remove = useCallback((q) => write('searches', readCollection('searches').filter((s) => s !== q)), []);
  const clear = useCallback(() => write('searches', []), []);
  return { list, add, remove, clear };
}
