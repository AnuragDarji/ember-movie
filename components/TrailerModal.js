'use client';
import { useEffect } from 'react';
import { CloseIcon } from './Icons';

export default function TrailerModal({ url, title, label = 'trailer', onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={`${title} ${label}`} onClick={onClose}>
      <div className="modal__frame" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn modal__close" onClick={onClose} aria-label={`Close ${label}`} autoFocus>
          <CloseIcon />
        </button>
        <iframe src={url} title={`${title} ${label}`} width="100%" height="100%" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />      </div>
    </div>
  );
}
