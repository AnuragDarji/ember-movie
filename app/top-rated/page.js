import PageHeader from '@/components/PageHeader';
import Row from '@/components/Row';
import SetupNotice from '@/components/SetupNotice';
import { getAnimeCollections } from '@/lib/anilist';
import { hasTmdbKey, tmdbList } from '@/lib/tmdb';

export const revalidate = 3600;
export const metadata = { title: 'Top Rated — Ember' };

export default async function TopRated() {
  const [movies, tv, anime] = await Promise.all([
    tmdbList('/movie/top_rated', {}, 'movie'),
    tmdbList('/tv/top_rated', {}, 'tv'),
    getAnimeCollections(),
  ]);
  return (
    <div className="rows rows--top">
      <PageHeader title="Top Rated">The best-reviewed films, series and anime of all time.</PageHeader>
      {!hasTmdbKey() && <SetupNotice />}
      <Row title="Top Rated Movies" items={movies} more="/movies?sort=top" />
      <Row title="Top Rated TV Shows" items={tv} more="/tv?sort=top" />
      <Row title="Top Rated Anime" items={anime.top} more="/anime" />
    </div>
  );
}
