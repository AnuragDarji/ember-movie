'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Card from './Card';

// Appends the next pages under the server-rendered first page. Loads
// automatically as the sentinel nears the viewport; the button is the fallback.
export default function LoadMore({ type, filters, startPage, totalPages }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(startPage - 1);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinel = useRef(null);
  const seen = useRef(new Set());
  const done = page >= totalPages;

  const load = useCallback(async () => {
    if (busy || done) return;
    setBusy(true);
    setFailed(false);
    try {
      const qs = new URLSearchParams({ ...filters, type, page: String(page + 1) });
      const res = await fetch(`/api/discover?${qs}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const fresh = data.items.filter((i) => !seen.current.has(i.key) && seen.current.add(i.key));
      setItems((prev) => [...prev, ...fresh]);
      setPage(page + 1);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }, [busy, done, filters, page, type]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done || failed) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && load(), { rootMargin: '800px' });
    io.observe(el);
    return () => io.disconnect();
  }, [load, done, failed]);

  return (
    <>
      {items.length > 0 && (
        <div className="grid" style={{ marginTop: 26 }}>
          {items.map((item) => <Card key={item.key} item={item} />)}
        </div>
      )}
      {busy && (
        <div className="grid" style={{ marginTop: 26 }} aria-busy="true" aria-label="Loading more">
          {Array.from({ length: 10 }).map((_, i) => <div className="skeleton skeleton--card" key={i} />)}
        </div>
      )}
      {!done && (
        <div ref={sentinel} style={{ textAlign: 'center', padding: '28px 0' }}>
          <button className="btn btn--ghost" onClick={load} disabled={busy}>
            {busy ? 'Loading…' : failed ? 'Retry' : 'Load more'}
          </button>
        </div>
      )}
    </>
  );
}
