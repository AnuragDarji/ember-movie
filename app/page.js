import Hero from '@/components/Hero';
import Row from '@/components/Row';
import SetupNotice from '@/components/SetupNotice';
import { ContinueWatching, Recommended, RecentlyViewed } from '@/components/HomePersonal';
import { getAnimeCollections, normalizeAnime } from '@/lib/anilist';
import { getTitle, hasTmdbKey, tmdbList } from '@/lib/tmdb';

export const revalidate = 3600;

export default async function Home() {
  const hasKey = hasTmdbKey();
  // The hero's detail fetch starts as soon as the trending list is back,
  // in parallel with the other rows instead of after them.
  const heroPromise = tmdbList('/trending/all/week').then(async (trendingAll) => {
    const picks = trendingAll.filter((i) => i.backdrop && i.overview).slice(0, 6);
    if (!picks.length) return [];
    const first = (await getTitle(picks[0].type, picks[0].id)) || picks[0];
    return [first, ...picks.slice(1)];
  });
  const [heroItems, trendingMovies, nowPlaying, asianTv, trendingTv, anime] = await Promise.all([
    heroPromise,
    tmdbList('/trending/movie/week', {}, 'movie'),
    tmdbList('/movie/now_playing', {}, 'movie'),
    tmdbList('/discover/tv', { with_origin_country: 'KR|JP|CN|TH', sort_by: 'popularity.desc' }, 'tv'),
    tmdbList('/trending/tv/week', {}, 'tv'),
    getAnimeCollections(),
  ]);

  let heroes = heroItems;
  if (!heroes.length) {
    const raw = anime.trendingRaw.find((m) => m.bannerImage);
    if (raw) heroes = [normalizeAnime(raw)];
  }

  return (
    <>
      <Hero items={heroes} />
      <div className={heroes.length ? 'rows rows--overlap' : 'rows rows--top'}>
        {!hasKey && <SetupNotice />}
        <ContinueWatching />
        <Row title="Trending Movies" items={trendingMovies} more="/movies" />
        <Row title="Top 10 Movies This Week" items={trendingMovies.slice(0, 10)} more="/movies?sort=top" ranked />
        <Row title="Now Playing in Theaters" items={nowPlaying} more="/movies?sort=latest" />
        <Row title="Asian TV Shows" items={asianTv} more="/tv" />
        <Row title="Trending TV Shows" items={trendingTv} more="/tv" />
        <Row title="Top 10 Series This Week" items={trendingTv.slice(0, 10)} more="/tv?sort=top" ranked />
        <Row title="Popular Anime" items={anime.popular} more="/anime" />
        <Recommended />
        <RecentlyViewed />
      </div>
    </>
  );
}
