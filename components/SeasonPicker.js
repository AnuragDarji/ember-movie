'use client';
import { useEffect, useState } from 'react';
import { useCollection } from '@/lib/library';
import { CheckIcon, StarIcon } from './Icons';

export default function SeasonPicker({ item, seasons }) {
  const [season, setSeason] = useState(seasons[0]?.number);
  const [state, setState] = useState({ status: 'loading', data: null });
  const { list, push } = useCollection('continue');
  const current = list.find((i) => i.key === item.key);

  // Open on the season the viewer was last on.
  useEffect(() => {
    if (current?.season && seasons.some((s) => s.number === current.season)) setSeason(current.season);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.season]);

  useEffect(() => {
    if (season == null) return;
    let alive = true;
    setState({ status: 'loading', data: null });
    fetch(`/api/season?id=${item.id}&s=${season}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch(() => alive && setState({ status: 'error', data: null }));
    return () => { alive = false; };
  }, [item.id, season]);

  if (!seasons.length) return null;

  const mark = (ep) => push(item, { season, episode: ep.number, progress: `S${season} E${ep.number}: ${ep.name}` });

  return (
    <section className="episodes pad" aria-labelledby="eps-h">
      <div className="episodes__head">
        <h2 id="eps-h" className="row__title">Episodes</h2>
        <label className="select">
          <span className="sr-only">Season</span>
          <select value={season} onChange={(e) => setSeason(Number(e.target.value))}>
            {seasons.map((s) => (
              <option key={s.number} value={s.number}>
                {s.name} ({s.count} ep{s.count > 1 ? 's' : ''}{s.year ? `, ${s.year}` : ''})
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.status === 'loading' && (
        <ul className="ep-list">{[0, 1, 2].map((i) => <li key={i} className="ep skeleton ep--skeleton" />)}</ul>
      )}
      {state.status === 'error' && <p className="watch__empty">This season didn’t load. Pick it again to retry.</p>}
      {state.status === 'ready' && (
        <ul className="ep-list">
          {state.data.episodes.map((ep) => {
            const isCurrent = current?.season === season && current?.episode === ep.number;
            return (
              <li key={ep.number} className={`ep ${isCurrent ? 'is-current' : ''}`}>
                <div className="ep__still">
                  {ep.still ? <img src={ep.still} alt="" loading="lazy" /> : <span>{ep.number}</span>}
                </div>
                <div className="ep__body">
                  <h3 className="ep__title">{ep.number}. {ep.name}</h3>
                  <p className="ep__meta">
                    {[ep.airDate, ep.runtime].filter(Boolean).join(' / ')}
                    {ep.rating ? <span className="card__rating"><StarIcon width={11} height={11} /> {ep.rating.toFixed(1)}</span> : null}
                  </p>
                  {ep.overview && <p className="ep__overview">{ep.overview}</p>}
                </div>
                {!ep.upcoming && (
                  <button className={`btn btn--small ${isCurrent ? 'btn--on' : 'btn--ghost'}`} onClick={() => mark(ep)} aria-pressed={isCurrent}>
                    {isCurrent ? <><CheckIcon width={14} height={14} /> Up to here</> : 'I’m up to this'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
