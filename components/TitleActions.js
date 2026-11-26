'use client';
import { useState } from 'react';
import { FilmIcon, PlayIcon } from './Icons';
import { FavoriteButton, WatchlistButton } from './LibraryButtons';
import TrailerModal from './TrailerModal';

import { watchHref } from '@/lib/watchHref';

export default function TitleActions({ item, trailerUrl }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="actions">
      <a href={watchHref(item)} target="_blank" rel="noopener" className="btn btn--primary">
        <PlayIcon /> Watch Now
      </a>
      {trailerUrl && (
        <button className="btn btn--ghost" onClick={() => setOpen(true)}>
          <FilmIcon /> Trailer
        </button>
      )}
      <WatchlistButton item={item} />
      <FavoriteButton item={item} />
      {open && <TrailerModal url={trailerUrl} title={item.title} onClose={() => setOpen(false)} />}
    </div>
  );
}
