'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Logo, { LogoMark } from './Logo';
import SearchBox from './SearchBox';
import { BookmarkIcon, ChevronLeft, CloseIcon, MenuIcon, SearchIcon } from './Icons';
import { useCollection } from '@/lib/library';

const ico = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const HomeI = () => (<svg {...ico}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></svg>);
const FilmI = () => (<svg {...ico}><path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" /><path d="m4 8-.8-3.4 14.6-2.2.6 3.6M8.5 5.8l1.3 3.2M13.2 5.1l1.3 3.2" /><path d="m10 12.5 4 2.5-4 2.5Z" fill="currentColor" /></svg>);
const TvI = () => (<svg {...ico}><rect x="2.5" y="5" width="19" height="13" rx="2.5" /><path d="M8 21.5h8M12 18v3.5" /><path d="m10.5 9 4 2.5-4 2.5Z" fill="currentColor" /></svg>);
const AnimeI = () => (<svg {...ico}><circle cx="12" cy="12" r="9" /><path d="M8.5 10.5h.01M15.5 10.5h.01" strokeWidth="2.6" /><path d="M8.5 14.5c1 1.6 2.2 2.3 3.5 2.3s2.5-.7 3.5-2.3" /><path d="m6 4.5 1.5 2M18 4.5l-1.5 2" /></svg>);
const SIDE_ICONS = { '/': HomeI, '/movies': FilmI, '/tv': TvI, '/anime': AnimeI };

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV Shows' },
  { href: '/anime', label: 'Anime' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Collapsed by default; the user's choice is remembered and applied on <html> so the layout follows it.
  const [collapsed, setCollapsed] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [mobileSide, setMobileSide] = useState(false); // slide-in drawer on small screens
  useEffect(() => {
    try { if (localStorage.getItem('ember:sidebar') === 'open') setCollapsed(false); } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    document.documentElement.dataset.side = collapsed ? 'collapsed' : 'open';
    try { localStorage.setItem('ember:sidebar', collapsed ? 'collapsed' : 'open'); } catch {}
  }, [collapsed, loaded]);
  const inputRef = useRef(null);
  const { list } = useCollection('watchlist');

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setMobileSide(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus({ preventScroll: true });
  }, [searchOpen]);

  // "/" focuses search, like most streaming sites.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement?.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
    <button
      className={`sidebar__open ${mobileSide ? 'is-hidden' : ''}`}
      aria-label="Open sidebar" title="Open sidebar"
      onClick={() => (window.matchMedia('(max-width: 860px)').matches ? setMobileSide(true) : setCollapsed(false))}
    >
      <ChevronLeft width={16} height={16} />
    </button>
    {mobileSide && <div className="sidebar__scrim" onClick={() => setMobileSide(false)} />}
    <aside className={`sidebar ${mobileSide ? 'is-mobile-open' : ''}`} aria-label="Primary" aria-hidden={collapsed && !mobileSide}>
      <button className="sidebar__toggle" aria-label="Collapse sidebar" title="Collapse sidebar" onClick={() => setCollapsed(true)} tabIndex={collapsed ? -1 : 0}>
        <ChevronLeft width={20} height={20} />
      </button>
      <Link href="/" aria-label="Ember home" className="sidebar__logo" tabIndex={collapsed ? -1 : 0}><LogoMark size={30} /></Link>
      <nav className="sidebar__links" aria-label="Main">
        {LINKS.map((l) => {
          const I = SIDE_ICONS[l.href];
          return (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? 'is-active' : ''} aria-label={l.label} title={l.label}>
              {I && <I />}
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar__bottom">
        <Link href="/watchlist" className={isActive('/watchlist') ? 'is-active' : ''} aria-label="Watchlist" title="Watchlist">
          <BookmarkIcon width={22} height={22} />
          <span>My List</span>
        </Link>
        <p className="sidebar__by"><small>made by</small><strong>Anurag</strong></p>
      </div>
    </aside>
    <header className={`nav ${solid || menuOpen || searchOpen ? 'nav--solid' : ''} ${searchOpen ? 'nav--searching' : ''}`}>
      <div className="nav__inner">
        <button className="icon-btn nav__burger" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Link href="/" aria-label="Ember home" className="nav__logo"><Logo byline="made by anurag" /></Link>

        <nav className={`nav__links ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? 'is-active' : ''}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav__actions">
          <div className={`nav__search ${searchOpen ? 'is-open' : ''}`}>
            <SearchBox ref={inputRef} onDone={() => setSearchOpen(false)} />
          </div>
          <button className="icon-btn" aria-label={searchOpen ? 'Close search' : 'Search'} onClick={() => setSearchOpen((o) => !o)}>
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
          </button>
          <Link href="/watchlist" className="icon-btn nav__wl" aria-label={`Watchlist, ${list.length} saved`}>
            <BookmarkIcon />
            {list.length > 0 && <span className="nav__count">{list.length > 99 ? '99+' : list.length}</span>}
          </Link>
        </div>
      </div>
    </header>
    </>
  );
}
