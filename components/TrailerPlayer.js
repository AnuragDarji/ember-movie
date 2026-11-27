'use client';
import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './Icons';

// Hidden until the Trailer button is clicked; then it appears on the page, plays, and scrolls into view.
export default function TrailerPlayer({ url, title }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onPlay = () => setOpen(true);
    window.addEventListener('play-trailer', onPlay);
    return () => window.removeEventListener('play-trailer', onPlay);
  }, []);

  useEffect(() => {
    if (open) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [open]);

  if (!url || !open) return null;
  return (
    <section className="trailer pad" id="trailer" ref={ref} aria-label={`${title} trailer`}>
      <div className="trailer__head">
        <h2 className="row__title">Trailer</h2>
        <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close trailer"><CloseIcon /></button>
      </div>
      <div className="trailer__frame">
        <iframe
          src={url}
          title={`${title} trailer`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    </section>
  );
}
