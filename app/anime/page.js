import Link from 'next/link';
import Grid from '@/components/Grid';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import Row from '@/components/Row';
import { ANIME_GENRES, getAnimeByGenre, getAnimeCollections } from '@/lib/anilist';

export const metadata = { title: 'Anime — Ember' };

export default async function Anime({ searchParams }) {
  const genre = ANIME_GENRES.includes(searchParams?.genre) ? searchParams.genre : '';

  const genreNav = (
    <nav className="genre-pills pad" aria-label="Anime genres">
      <Link href="/anime" className={`pill ${!genre ? 'is-on' : ''}`} aria-current={!genre ? 'page' : undefined}>All</Link>
      {ANIME_GENRES.map((g) => (
        <Link key={g} href={`/anime?genre=${encodeURIComponent(g)}`} className={`pill ${genre === g ? 'is-on' : ''}`} aria-current={genre === g ? 'page' : undefined}>{g}</Link>
      ))}
    </nav>
  );

  if (genre) {
    const result = await getAnimeByGenre(genre, searchParams.page);
    return (
      <div className="rows rows--top">
        <PageHeader title={`${genre} anime`}>Most popular first, from AniList.</PageHeader>
        {genreNav}
        <section className="pad">
          {result.items.length ? <Grid items={result.items} /> : <AniListDown />}
          <Pagination page={result.page} totalPages={result.totalPages} basePath="/anime" params={{ genre }} />
        </section>
      </div>
    );
  }

  const a = await getAnimeCollections();
  const empty = !a.trending.length && !a.popular.length;
  return (
    <div className="rows rows--top">
      <PageHeader title="Anime">Simulcasts, classics and what’s coming next season.</PageHeader>
      {genreNav}
      {empty && <AniListDown />}
      <Row title="Latest Episodes" items={a.latest} />
      <Row title="Trending Now" items={a.trending} />
      <Row title="Popular" items={a.popular} />
      <Row title="Upcoming" items={a.upcoming} />
      <Row title="Highest Rated" items={a.top} />
      <Row title="Anime Movies" items={a.movies} />
    </div>
  );
}

function AniListDown() {
  return (
    <div className="notice">
      <strong>AniList didn’t respond.</strong>
      <p>Refresh in a minute; the API limits how often it can be called.</p>
    </div>
  );
}
