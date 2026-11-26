'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

// Every filter lives in the URL, so results are shareable and the back button works.
export default function FilterBar({ fields }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const set = (name, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    next.delete('page');
    startTransition(() => router.push(`${pathname}${next.toString() ? `?${next}` : ''}`, { scroll: false }));
  };

  const active = fields.some((f) => f.name !== 'sort' && params.get(f.name));

  return (
    <div className={`filters ${pending ? 'is-pending' : ''}`} role="group" aria-label="Filters">
      {fields.map((f) => (
        <label key={f.name} className="select">
          <span className="select__label">{f.label}</span>
          <select value={params.get(f.name) || ''} onChange={(e) => set(f.name, e.target.value)}>
            {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      ))}
      {active && (
        <button type="button" className="link-btn" onClick={() => startTransition(() => router.push(pathname, { scroll: false }))}>
          Clear filters
        </button>
      )}
    </div>
  );
}
