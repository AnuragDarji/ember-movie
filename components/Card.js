import Link from 'next/link';
import { StarIcon } from './Icons';
import { WatchlistButton } from './LibraryButtons';

const TYPE = { movie: 'Movie', tv: 'TV', anime: 'Anime' };

export default function Card({ item, progress }) {
  const sub = [TYPE[item.type], item.year, item.episodes ? `${item.episodes} eps` : null].filter(Boolean).join(' / ');
  return (
    <div className="card">
      <Link href={item.href} className="card__link" aria-label={`${item.title}${item.year ? `, ${item.year}` : ''}`}>
        <div className="card__poster">
          {item.poster ? <img src={item.poster} alt="" loading="lazy" decoding="async" /> : <span className="card__noimg">{item.title}</span>}
          {item.badge && <span className="card__badge">{item.badge}</span>}
          {item.rating ? <span className="card__score"><StarIcon width={11} height={11} /> {item.rating.toFixed(1)}</span> : null}
          <div className="card__overlay">
            <p className="card__otitle">{item.title}</p>
            <div className="card__info">
              {item.rating ? (
                <span className="card__rating"><StarIcon width={12} height={12} /> {item.rating.toFixed(1)}</span>
              ) : null}
              <span>{sub}</span>
            </div>
          </div>
        </div>
        <p className="card__title">{item.title}</p>
        <p className="card__meta">{[item.year, TYPE[item.type]].filter(Boolean).join(' • ')}</p>
        {progress && <p className="card__progress">{progress}</p>}
      </Link>
      <WatchlistButton item={item} compact />
    </div>
  );
}
