'use client';
import { useEffect } from 'react';
import { useCollection } from '@/lib/library';

// Adds the title to "Recently viewed" when its detail page opens.
export default function TrackView({ item }) {
  const { push } = useCollection('recent');
  useEffect(() => {
    push(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.key]);
  return null;
}
