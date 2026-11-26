'use client';
import { useEffect, useState } from 'react';
import { useCollection } from '@/lib/library';
import Row from './Row';

// "Continue watching" and "Recommended for you" are built from this device's activity.
export function ContinueWatching() {
  const { list, ready, clear } = useCollection('continue');
  if (!ready || !list.length) return null;
  const byKey = Object.fromEntries(list.map((i) => [i.key, i.progress]));
  return (
    <Row
      title="Continue Watching"
      items={list}
      progressFor={(i) => byKey[i.key]}
      action={<button className="link-btn row__more" onClick={clear}>Clear</button>}
    />
  );
}

export function RecentlyViewed() {
  const { list, ready } = useCollection('recent');
  if (!ready || list.length < 2) return null;
  return <Row title="Recently Viewed" items={list} more="/watchlist?tab=recent" />;
}

export function Recommended() {
  const watch = useCollection('watchlist');
  const favs = useCollection('favorites');
  const recent = useCollection('recent');
  const [data, setData] = useState(null);

  const ready = watch.ready && favs.ready && recent.ready;
  const seeds = [...favs.list, ...watch.list, ...recent.list]
    .filter((v, i, a) => a.findIndex((x) => x.key === v.key) === i)
    .slice(0, 4)
    .map((i) => `${i.type}:${i.id}`)
    .join(',');

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    fetch(`/api/recommend?seeds=${seeds}`)
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(null));
    return () => { alive = false; };
  }, [ready, seeds]);

  if (!data?.items?.length) return null;
  return <Row title={data.personalized ? 'Recommended For You' : 'Picks to Start With'} items={data.items} />;
}
