'use client';
import { useEffect, useState } from 'react';
import { watchHref } from '@/lib/watchHref';
import Link from 'next/link';
import Rating from './Rating';
import { InfoIcon, PlayIcon } from './Icons';
import { WatchlistButton } from './LibraryButtons';

const TYPE_LABEL = { movie: 'Movie', tv: 'Series', anime: 'Anime' };
const INTERVAL = 8000;

// Hero banner. Pass `items` for a carousel (indicators + thumbnail previews) or a single `item`.
export default function Hero({ item, items }) {
  const slides = (items?.length ? items : item ? [item] : []).filter(Boolean);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), INTERVAL);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  if (!slides.length) return null;
  const cur = slides[i] || slides[0];

  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {cur.backdrop && <img key={cur.key} className="hero__bg" src={cur.backdrop} alt="" fetchPriority="high" />}
      <div className="hero__shade" />
      <div className="hero__content" key={cur.key}>
        <div className="hero__badges">
          <span className="hero__badge hero__badge--hot">Trending</span>
          <span className="hero__badge">{TYPE_LABEL[cur.type] || 'Title'}</span>
        </div>
        <h1 className="hero__title">
          <Link href={cur.href}>{cur.title}</Link>
        </h1>
        <div className="meta">
          <Rating value={cur.rating} />
          {cur.year && <span>{cur.year}</span>}
          {cur.runtime && <span>{cur.runtime}</span>}
          {cur.genres.slice(0, 3).map((g) => (
            <span key={g} className="chip">{g}</span>
          ))}
        </div>
        <p className="hero__overview">{cur.overview}</p>
        <div className="actions">
          <a href={watchHref(cur)} target="_blank" rel="noopener" className="btn btn--primary"><PlayIcon /> Play Now</a>
          <Link href={cur.href} className="btn btn--ghost"><InfoIcon /> More Info</Link>
          <WatchlistButton item={cur} />
        </div>
      </div>

      {slides.length > 1 && (
        <div className="hero__nav">
          <div className="hero__dots" role="tablist" aria-label="Featured titles">
            {slides.map((s, n) => (
              <button key={s.key} role="tab" aria-selected={n === i} aria-label={s.title} className={n === i ? 'is-on' : ''} onClick={() => setI(n)} />
            ))}
          </div>
          <div className="hero__thumbs">
            {slides.map((s, n) => (
              <button key={s.key} className={n === i ? 'is-on' : ''} onClick={() => setI(n)} aria-label={`Show ${s.title}`}>
                {s.poster && <img src={s.poster} alt="" loading="lazy" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
