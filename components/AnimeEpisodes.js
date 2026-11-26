'use client';
import { useCollection } from '@/lib/library';
import { ClockIcon, ExternalIcon } from './Icons';

export default function AnimeEpisodes({ item, episodes, nextEpisode }) {
  const { push } = useCollection('continue');
  if (!episodes.length && !nextEpisode) return null;

  // AniList lists newest first for some shows; sort by the episode number in the title.
  const num = (t) => Number((t.match(/Episode\s+(\d+)/i) || [])[1]) || 0;
  const sorted = [...episodes].sort((a, b) => num(a.title) - num(b.title));

  return (
    <section className="episodes pad" aria-labelledby="aeps-h">
      <div className="episodes__head">
        <h2 id="aeps-h" className="row__title">Episodes</h2>
        {nextEpisode && (
          <span className="watch__region"><ClockIcon width={14} height={14} /> Episode {nextEpisode.number} {airsIn(nextEpisode.airingAt)}</span>
        )}
      </div>
      {sorted.length > 0 ? (
        <ul className="ep-grid">
          {sorted.map((ep) => (
            <li key={ep.url}>
              <a className="ep-card" href={ep.url} target="_blank" rel="noopener noreferrer" onClick={() => push(item, { progress: ep.title })}>
                <div className="ep__still">{ep.thumbnail && <img src={ep.thumbnail} alt="" loading="lazy" />}</div>
                <p className="ep__title">{ep.title}</p>
                <p className="ep__meta">Watch on {ep.site} <ExternalIcon width={12} height={12} /></p>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="watch__empty">Episode links appear here once an official streaming service lists them.</p>
      )}
    </section>
  );
}

function airsIn(ts) {
  const diff = ts * 1000 - Date.now();
  if (diff <= 0) return 'is airing now';
  const h = Math.round(diff / 36e5);
  if (h < 24) return `airs in ${h} hour${h === 1 ? '' : 's'}`;
  const d = Math.round(h / 24);
  return `airs in ${d} day${d === 1 ? '' : 's'}`;
}
