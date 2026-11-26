import Grid from '@/components/Grid';
import PageHeader from '@/components/PageHeader';
import SearchBox from '@/components/SearchBox';
import { searchAnime } from '@/lib/anilist';
import { searchTmdb } from '@/lib/tmdb';

export const metadata = { title: 'Search — Ember' };

const TABS = [['all', 'All'], ['movie', 'Movies'], ['tv', 'TV Shows'], ['anime', 'Anime']];

export default async function Search({ searchParams }) {
  const q = (searchParams?.q || '').trim();
  const type = TABS.some(([v]) => v === searchParams?.type) ? searchParams.type : 'all';
  const [titles, anime] = q
    ? await Promise.all([type === 'anime' ? [] : searchTmdb(q), type === 'movie' || type === 'tv' ? [] : searchAnime(q)])
    : [[], []];
  const shown = type === 'movie' || type === 'tv' ? titles.filter((t) => t.type === type) : titles;

  return (
    <div className="rows rows--top">
      <PageHeader title={q ? `Results for “${q}”` : 'Search'} />
      <div className="pad search-page">
        <SearchBox key={q} initial={q} variant="page" autoFocus={!q} />
        {q && (
          <nav className="genre-pills" aria-label="Result type">
            {TABS.map(([v, l]) => (
              <a key={v} href={`/search?q=${encodeURIComponent(q)}${v === 'all' ? '' : `&type=${v}`}`} className={`pill ${type === v ? 'is-on' : ''}`} aria-current={type === v ? 'page' : undefined}>{l}</a>
            ))}
          </nav>
        )}
      </div>
      {q && !shown.length && !anime.length && (
        <div className="empty"><p>No matches for “{q}”. Check the spelling or try the original title.</p></div>
      )}
      {shown.length > 0 && (
        <section className="pad"><h2 className="row__title">Movies &amp; TV</h2><Grid items={shown} /></section>
      )}
      {anime.length > 0 && (
        <section className="pad"><h2 className="row__title">Anime</h2><Grid items={anime} /></section>
      )}
    </div>
  );
}
