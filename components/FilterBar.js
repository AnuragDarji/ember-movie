'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

// Every filter lives in the URL, so results are shareable and the back button works.
export default function FilterBar({ fields }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const set = (name, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    next.delete('page');
    startTransition(() => router.push(`${pathname}${next.toString() ? `?${next}` : ''}`, { scroll: false }));
  };

  const activeCount = fields.filter((f) => f.name !== 'sort' && params.get(f.name)).length;
  const active = activeCount > 0;

  return (
    <div className={`filters ${pending ? 'is-pending' : ''} ${open ? 'is-open' : ''}`} role="group" aria-label="Filters">
      <button type="button" className="filters__toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
        Filters
        {activeCount > 0 && <span className="filters__count">{activeCount}</span>}
        <svg className="filters__chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <div className="filters__fields">
        {fields.map((f) => (
          <label key={f.name} className={`select ${params.get(f.name) && f.name !== 'sort' ? 'is-set' : ''}`}>
            <span className="select__label">{f.label}</span>
            <select value={params.get(f.name) || ''} onChange={(e) => set(f.name, e.target.value)}>
              {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        ))}
        {active && (
          <button type="button" className="link-btn filters__clear" onClick={() => startTransition(() => router.push(pathname, { scroll: false }))}>
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
