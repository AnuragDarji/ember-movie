'use client';
import { useCollection } from '@/lib/library';
import { BookmarkIcon, CheckIcon, HeartIcon, PlusIcon } from './Icons';

export function WatchlistButton({ item, compact = false }) {
  const { has, toggle, ready } = useCollection('watchlist');
  const on = ready && has(item.key);
  if (compact) {
    return (
      <button
        type="button"
        className={`quick ${on ? 'is-on' : ''}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(item); }}
        aria-pressed={on}
        aria-label={on ? `Remove ${item.title} from watchlist` : `Add ${item.title} to watchlist`}
        title={on ? 'In watchlist' : 'Add to watchlist'}
      >
        {on ? <CheckIcon width={16} height={16} /> : <PlusIcon width={16} height={16} />}
      </button>
    );
  }
  return (
    <button type="button" className={`btn btn--ghost ${on ? 'is-added' : ''}`} onClick={() => toggle(item)} aria-pressed={on}>
      {on ? <CheckIcon /> : <BookmarkIcon />}
      {on ? 'In Watchlist' : 'Add to Watchlist'}
    </button>
  );
}

export function FavoriteButton({ item }) {
  const { has, toggle, ready } = useCollection('favorites');
  const on = ready && has(item.key);
  return (
    <button
      type="button"
      className={`icon-btn icon-btn--ring ${on ? 'is-fav' : ''}`}
      onClick={() => toggle(item)}
      aria-pressed={on}
      aria-label={on ? 'Remove from favorites' : 'Add to favorites'}
      title={on ? 'Favorited' : 'Add to favorites'}
    >
      <HeartIcon fill={on ? 'currentColor' : 'none'} />
    </button>
  );
}
