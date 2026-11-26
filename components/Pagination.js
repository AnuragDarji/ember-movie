import Link from 'next/link';
import { ChevronLeft, ChevronRight } from './Icons';

export default function Pagination({ page, totalPages, basePath, params = {} }) {
  if (totalPages <= 1) return null;
  const href = (p) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
    if (p > 1) q.set('page', p); else q.delete('page');
    const s = q.toString();
    return `${basePath}${s ? `?${s}` : ''}`;
  };
  const pages = [];
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, page + 2);
  for (let p = from; p <= to; p++) pages.push(p);

  return (
    <nav className="pager" aria-label="Pages">
      {page > 1 ? <Link href={href(page - 1)} className="pager__btn" aria-label="Previous page"><ChevronLeft /></Link> : <span className="pager__btn is-off"><ChevronLeft /></span>}
      {from > 1 && <><Link href={href(1)} className="pager__num">1</Link>{from > 2 && <span className="pager__gap">…</span>}</>}
      {pages.map((p) => (
        <Link key={p} href={href(p)} className={`pager__num ${p === page ? 'is-current' : ''}`} aria-current={p === page ? 'page' : undefined}>{p}</Link>
      ))}
      {to < totalPages && <>{to < totalPages - 1 && <span className="pager__gap">…</span>}<Link href={href(totalPages)} className="pager__num">{totalPages}</Link></>}
      {page < totalPages ? <Link href={href(page + 1)} className="pager__btn" aria-label="Next page"><ChevronRight /></Link> : <span className="pager__btn is-off"><ChevronRight /></span>}
    </nav>
  );
}
