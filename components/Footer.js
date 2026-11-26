'use client';
import Link from 'next/link';
import { useState } from 'react';
import Logo from './Logo';
import { InstagramIcon, TiktokIcon, XIcon, YoutubeIcon } from './Icons';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setStatus('error');
    // Connect this to your email provider (Mailchimp, Resend, etc.)
    setStatus('done');
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <Link href="/" aria-label="Ember home"><Logo size={34} /></Link>
          <p>Find your next movie, series or anime, see where it’s streaming, and keep track of what you’re watching.</p>
          <div className="socials">
            <a href="#" aria-label="Instagram"><InstagramIcon /></a>
            <a href="#" aria-label="X"><XIcon /></a>
            <a href="#" aria-label="YouTube"><YoutubeIcon /></a>
            <a href="#" aria-label="TikTok"><TiktokIcon /></a>
          </div>
        </div>
        <nav className="footer__col" aria-label="Browse">
          <h3>Browse</h3>
          <Link href="/movies">Movies</Link>
          <Link href="/tv">TV Shows</Link>
          <Link href="/anime">Anime</Link>
          <Link href="/trending">Trending</Link>
          <Link href="/popular">Popular</Link>
          <Link href="/top-rated">Top Rated</Link>
          <Link href="/watchlist">Watchlist</Link>
        </nav>
        <nav className="footer__col" aria-label="Help">
          <h3>Help</h3>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </nav>
        <form className="footer__news" onSubmit={submit}>
          <h3>Weekly picks</h3>
          <p>One email every Friday with what’s new and worth watching.</p>
          <div className="news__field">
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }} placeholder="you@example.com" aria-label="Email address" />
            <button className="btn btn--primary" type="submit">Subscribe</button>
          </div>
          {status === 'error' && <p className="news__msg news__msg--err">Enter a valid email address.</p>}
          {status === 'done' && <p className="news__msg">Subscribed. Look out for Friday’s email.</p>}
        </form>
      </div>
      <p className="footer__credit">
        Movie and TV data from TMDB. Streaming availability from JustWatch. Anime data from AniList, MAL scores via Jikan. This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </footer>
  );
}
