'use client';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

// OTT platform chips + region. Each page (/movies, /tv) only ever filters its own type.
// State lives in the URL (?ott=8&region=IN).
export default function OttBar({ providers, regions, region }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const ott = params.get('ott') || '';

  const go = (patch) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    next.delete('page');
    startTransition(() => router.push(`${pathname}${next.toString() ? `?${next}` : ''}`, { scroll: false }));
  };

  return (
    <div className={`ott ${pending ? 'is-pending' : ''}`} role="group" aria-label="Streaming platforms">
      <div className="ott__chips">
        <button type="button" className={`chip ${ott ? '' : 'is-on'}`} aria-pressed={!ott} onClick={() => go({ ott: '' })}>All</button>
        {providers.map((p) => (
          <button key={p.id} type="button" title={p.name} className={`chip ${ott === p.id ? 'is-on' : ''}`} aria-pressed={ott === p.id} onClick={() => go({ ott: ott === p.id ? '' : p.id })}>
            {p.logo && <Image src={p.logo} alt="" width={20} height={20} unoptimized />}
            {p.name}
          </button>
        ))}
      </div>
      <label className="ott__region" title="Region">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
        <select value={region} aria-label="Region" onChange={(e) => go({ region: e.target.value, ott: '' })}>
          {regions.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
        </select>
      </label>
    </div>
  );
}
