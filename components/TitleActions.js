'use client';
import { FilmIcon, PlayIcon } from './Icons';
import { FavoriteButton, WatchlistButton } from './LibraryButtons';

import { watchHref } from '@/lib/watchHref';

export default function TitleActions({ item, trailerUrl }) {
  return (
    <div className="actions">
      <a href={watchHref(item)} target="_blank" rel="noopener" className="btn btn--primary">
        <PlayIcon /> Watch Now
      </a>
      {trailerUrl && (
        <button className="btn btn--ghost" onClick={() => window.dispatchEvent(new Event('play-trailer'))}>
          <FilmIcon /> Trailer
        </button>
      )}
      <WatchlistButton item={item} />
      <FavoriteButton item={item} />
    </div>
  );
}
