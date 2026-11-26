import PageHeader from '@/components/PageHeader';
import Row from '@/components/Row';
import SetupNotice from '@/components/SetupNotice';
import { getAnimeCollections } from '@/lib/anilist';
import { hasTmdbKey, tmdbList } from '@/lib/tmdb';

export const revalidate = 3600;
export const metadata = { title: 'Trending — Ember' };

export default async function Trending() {
  const [today, movies, tv, anime] = await Promise.all([
    tmdbList('/trending/all/day'),
    tmdbList('/trending/movie/week', {}, 'movie'),
    tmdbList('/trending/tv/week', {}, 'tv'),
    getAnimeCollections(),
  ]);
  return (
    <div className="rows rows--top">
      <PageHeader title="Trending">What people are watching right now.</PageHeader>
      {!hasTmdbKey() && <SetupNotice />}
      <Row title="Today" items={today} />
      <Row title="Movies This Week" items={movies} />
      <Row title="TV This Week" items={tv} />
      <Row title="Anime This Season" items={anime.trending} />
    </div>
  );
}
