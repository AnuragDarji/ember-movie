'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import SearchBox from './SearchBox';
import { BookmarkIcon, CloseIcon, MenuIcon, SearchIcon } from './Icons';
import { useCollection } from '@/lib/library';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV Shows' },
  { href: '/anime', label: 'Anime' },
  { href: '/trending', label: 'Trending' },
  { href: '/popular', label: 'Popular' },
  { href: '/top-rated', label: 'Top Rated' },
  { href: '/watchlist', label: 'Watchlist' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
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
    <header className={`nav ${solid || menuOpen || searchOpen ? 'nav--solid' : ''}`}>
      <div className="nav__inner">
        <button className="icon-btn nav__burger" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Link href="/" aria-label="Ember home" className="nav__logo"><Logo /></Link>

        <nav className={`nav__links ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? 'is-active' : ''}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav__actions">
          <div className={`nav__search ${searchOpen ? 'is-open' : ''}`}>
            {searchOpen && <SearchBox ref={inputRef} onDone={() => setSearchOpen(false)} />}
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
  );
}
