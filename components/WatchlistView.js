'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCollection } from '@/lib/library';
import Grid from './Grid';
import PageHeader from './PageHeader';

const TABS = [
  { id: 'watchlist', label: 'Watchlist', empty: 'Nothing saved yet. Choose “Add to Watchlist” on any title, or the + on a poster.' },
  { id: 'favorites', label: 'Favorites', empty: 'Tap the heart on a title page to keep your favorites here.' },
  { id: 'continue', label: 'Continue Watching', empty: 'Titles you start on a streaming service, or episodes you mark, show up here.' },
  { id: 'recent', label: 'Recently Viewed', empty: 'Titles you open will appear here.' },
];

export default function WatchlistView() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = TABS.find((t) => t.id === params.get('tab')) || TABS[0];
  const { list, ready, clear } = useCollection(tab.id);

  return (
    <div className="rows rows--top">
      <PageHeader title="Your library">Saved in this browser. Nothing is sent to a server.</PageHeader>
      <div className="tabs pad" role="tablist" aria-label="Library">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === tab.id}
            className={`tab ${t.id === tab.id ? 'is-on' : ''}`}
            onClick={() => router.replace(t.id === 'watchlist' ? '/watchlist' : `/watchlist?tab=${t.id}`, { scroll: false })}
          >
            {t.label}
          </button>
        ))}
      </div>
      <section className="pad" role="tabpanel" aria-label={tab.label}>
        {ready && list.length === 0 && (
          <div className="empty empty--flush">
            <p>{tab.empty}</p>
            <Link href="/trending" className="btn btn--primary">Browse trending</Link>
          </div>
        )}
        {list.length > 0 && (
          <>
            <div className="tabs__bar">
              <span>{list.length} title{list.length > 1 ? 's' : ''}</span>
              {tab.id !== 'watchlist' && tab.id !== 'favorites' && (
                <button className="link-btn" onClick={clear}>Clear {tab.label.toLowerCase()}</button>
              )}
            </div>
            <Grid items={list} />
          </>
        )}
      </section>
    </div>
  );
}
