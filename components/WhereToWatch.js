'use client';
import { useCollection } from '@/lib/library';
import { ExternalIcon } from './Icons';

export default function WhereToWatch({ item, options }) {
  const { push } = useCollection('continue');
  const { groups, link, region, source } = options;
  const started = (provider) => push(item, { progress: `Watching on ${provider}` });

  return (
    <section id="watch" className="watch pad" aria-labelledby="watch-h">
      <div className="watch__head">
        <h2 id="watch-h" className="row__title">Where to watch</h2>
        {region && <span className="watch__region">{regionName(region)}</span>}
      </div>

      {groups.length === 0 ? (
        <p className="watch__empty">
          {source === 'anilist'
            ? 'AniList doesn’t list an official stream for this title yet. Check back closer to release, or add it to your watchlist.'
            : `This title isn’t on any streaming, rental or purchase service in ${regionName(region)} right now. Add it to your watchlist and check back.`}
        </p>
      ) : (
        <div className="watch__groups">
          {groups.map((g) => (
            <div key={g.label} className="watch__group">
              <h3>{g.label}</h3>
              <ul className="providers">
                {g.items.map((p) => (
                  <li key={p.id}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="provider" onClick={() => started(p.name)}>
                      {p.logo ? (
                        <img src={p.logo} alt="" loading="lazy" style={source === 'anilist' && p.color ? { background: p.color } : undefined} />
                      ) : (
                        <span className="provider__blank" style={p.color ? { background: p.color, color: '#fff' } : undefined}>{p.name[0]}</span>
                      )}
                      <span>{p.name}</span>
                      <ExternalIcon width={14} height={14} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="watch__credit">
        {source === 'anilist' ? (
          'Official streaming links from AniList. Availability varies by country.'
        ) : (
          <>
            Availability from JustWatch via TMDB.{' '}
            {link && <a href={link} target="_blank" rel="noopener noreferrer">See all options</a>}
          </>
        )}
      </p>
    </section>
  );
}

function regionName(code) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}
