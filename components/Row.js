'use client';
import Link from 'next/link';
import { useRef } from 'react';
import Card from './Card';
import { ChevronLeft, ChevronRight } from './Icons';

export default function Row({ title, items, more, progressFor, action }) {
  const ref = useRef(null);
  if (!items?.length) return null;
  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };
  return (
    <section className="row" aria-label={title}>
      <div className="row__head">
        <h2 className="row__title">{title}</h2>
        {more && <Link href={more} className="row__more">See all</Link>}
        {action}
      </div>
      <div className="row__viewport">
        <button className="row__arrow row__arrow--left" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}>
          <ChevronLeft />
        </button>
        <div className="row__track" ref={ref}>
          {items.map((item) => (
            <Card key={item.key} item={item} progress={progressFor?.(item)} />
          ))}
        </div>
        <button className="row__arrow row__arrow--right" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}>
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
