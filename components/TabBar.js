'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookmarkIcon, SearchIcon } from './Icons';

const svg = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const HomeIcon = () => (<svg {...svg}><path d="M4 11 12 4l8 7v9H4Z" /></svg>);
const FilmTab = () => (<svg {...svg}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 4v16M16 4v16M4 9h4M4 15h4M16 9h4M16 15h4" /></svg>);
const TvTab = () => (<svg {...svg}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="m9 3 3 3 3-3" /></svg>);

const TABS = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/movies', label: 'Movies', Icon: FilmTab },
  { href: '/tv', label: 'TV', Icon: TvTab },
  { href: '/search', label: 'Search', Icon: SearchIcon },
  { href: '/watchlist', label: 'My List', Icon: BookmarkIcon },
];

// Thumb-reach navigation on phones; hidden on larger screens via CSS.
export default function TabBar() {
  const pathname = usePathname();
  if (pathname.startsWith('/watch/')) return null;
  const on = (h) => (h === '/' ? pathname === '/' : pathname.startsWith(h));
  return (
    <nav className="tabbar" aria-label="Quick navigation">
      {TABS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className={on(href) ? 'is-active' : ''} aria-current={on(href) ? 'page' : undefined}>
          <Icon />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
