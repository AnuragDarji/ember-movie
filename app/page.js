import Hero from '@/components/Hero';
import Row from '@/components/Row';
import SetupNotice from '@/components/SetupNotice';
import { ContinueWatching, Recommended, RecentlyViewed } from '@/components/HomePersonal';
import { getAnimeCollections, normalizeAnime } from '@/lib/anilist';
import { getRecentlyReleased, getTitle, hasTmdbKey, tmdbList } from '@/lib/tmdb';

export const revalidate = 3600;

export default async function Home() {
  const hasKey = hasTmdbKey();
  // The hero's detail fetch starts as soon as the trending list is back,
  // in parallel with the other rows instead of after them.
  const heroPromise = tmdbList('/trending/all/week').then(async (trendingAll) => {
    const pick = trendingAll.find((i) => i.backdrop && i.overview);
    return pick ? (await getTitle(pick.type, pick.id)) || pick : null;
  });
  const [tmdbHero, trendingMovies, popularTv, recent, topRated, anime] = await Promise.all([
    heroPromise,
    tmdbList('/trending/movie/week', {}, 'movie'),
    tmdbList('/tv/popular', {}, 'tv'),
    getRecentlyReleased(),
    tmdbList('/movie/top_rated', {}, 'movie'),
    getAnimeCollections(),
  ]);

  let hero = tmdbHero;
  if (!hero) {
    const raw = anime.trendingRaw.find((m) => m.bannerImage);
    if (raw) hero = normalizeAnime(raw);
  }

  return (
    <>
      <Hero item={hero} />
      <div className={hero ? 'rows rows--overlap' : 'rows rows--top'}>
        {!hasKey && <SetupNotice />}
        <ContinueWatching />
        <Row title="Trending Movies" items={trendingMovies} more="/movies" />
        <Row title="Popular TV Shows" items={popularTv} more="/tv" />
        <Row title="Trending Anime" items={anime.trending} more="/anime" />
        <Row title="Recently Released" items={recent} more="/movies?sort=latest" />
        <Row title="Top Rated" items={topRated} more="/top-rated" />
        <Recommended />
        <RecentlyViewed />
      </div>
    </>
  );
}
