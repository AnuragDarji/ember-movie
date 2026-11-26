import { watchHref } from '@/lib/watchHref';
import Link from 'next/link';
import Rating from './Rating';
import { InfoIcon, PlayIcon } from './Icons';
import { WatchlistButton } from './LibraryButtons';

const TYPE_LABEL = { movie: 'Movie', tv: 'Series', anime: 'Anime' };

export default function Hero({ item }) {
  if (!item) return null;
  return (
    <section className="hero">
      {item.backdrop && <img className="hero__bg" src={item.backdrop} alt="" fetchPriority="high" />}
      <div className="hero__shade" />
      <div className="hero__content">
        <p className="hero__kicker">Trending {TYPE_LABEL[item.type]?.toLowerCase()} this week</p>
        <h1 className="hero__title">
          <Link href={item.href}>{item.title}</Link>
        </h1>
        <div className="meta">
          <Rating value={item.rating} />
          {item.year && <span>{item.year}</span>}
          {item.runtime && <span>{item.runtime}</span>}
          {item.genres.slice(0, 3).map((g) => (
            <span key={g} className="chip">{g}</span>
          ))}
        </div>
        <p className="hero__overview">{item.overview}</p>
        <div className="actions">
          <a href={watchHref(item)} target="_blank" rel="noopener" className="btn btn--primary"><PlayIcon /> Watch Now</a>
          <Link href={item.href} className="btn btn--ghost"><InfoIcon /> More Info</Link>
          <WatchlistButton item={item} />
        </div>
      </div>
    </section>
  );
}
