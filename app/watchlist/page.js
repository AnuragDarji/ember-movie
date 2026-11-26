import { Suspense } from 'react';
import WatchlistView from '@/components/WatchlistView';

export const metadata = { title: 'Watchlist — Ember' };

export default function Watchlist() {
  return (
    <Suspense>
      <WatchlistView />
    </Suspense>
  );
}
