import { Suspense } from 'react';
import FilterBar from '@/components/FilterBar';
import Grid from '@/components/Grid';
import PageHeader from '@/components/PageHeader';
import LoadMore from '@/components/LoadMore';
import Row from '@/components/Row';
import SetupNotice from '@/components/SetupNotice';
import { discover, getGenreList, hasTmdbKey, LANGUAGES, SORTS } from '@/lib/tmdb';

// Shared by /movies and /tv: a featured row, then a filterable, paginated grid.
export default async function TmdbBrowse({ type, title, intro, featured, searchParams }) {
  const f = {
    genre: searchParams.genre || '',
    year: searchParams.year || '',
    lang: searchParams.lang || '',
    rating: searchParams.rating || '',
    sort: searchParams.sort || 'trending',
    page: searchParams.page || '1',
  };
  const [genres, result] = await Promise.all([getGenreList(type), discover(type, f)]);
  const thisYear = new Date().getFullYear();
  const filtered = f.genre || f.year || f.lang || f.rating || f.sort !== 'trending' || f.page !== '1';

  const fields = [
    { name: 'sort', label: 'Sort', options: Object.entries(SORTS).map(([k, v]) => [k === 'trending' ? '' : k, v.label]) },
    { name: 'genre', label: 'Genre', options: [['', 'All genres'], ...genres.map((g) => [String(g.id), g.name])] },
    { name: 'year', label: 'Year', options: [['', 'Any year'], ...Array.from({ length: thisYear - 1969 }, (_, i) => String(thisYear - i)).map((y) => [y, y])] },
    { name: 'lang', label: 'Language', options: [['', 'Any language'], ...LANGUAGES] },
    { name: 'rating', label: 'Rating', options: [['', 'Any rating'], ['8', '8+'], ['7', '7+'], ['6', '6+'], ['5', '5+']] },
  ];

  return (
    <div className="rows rows--top">
      <PageHeader title={title}>{intro}</PageHeader>
      {!hasTmdbKey() && <SetupNotice />}
      {!filtered && <Suspense fallback={null}>{featured}</Suspense>}
      <section className="pad browse" aria-label={`Browse ${title}`}>
        <Suspense><FilterBar fields={fields} /></Suspense>
        {result.items.length ? (
          <>
            <div className="row__head row__head--flush">
              <h2 className="row__title">{filtered ? 'Results' : `All ${title}`}</h2>
              {filtered && <span className="row__count">{result.items.length}+ titles</span>}
            </div>
            <Grid items={result.items} />
            <LoadMore
              key={JSON.stringify(f)}
              type={type}
              filters={{ genre: f.genre, year: f.year, lang: f.lang, rating: f.rating, sort: f.sort }}
              startPage={result.page + 1}
              totalPages={result.totalPages}
            />
          </>
        ) : (
          hasTmdbKey() && <p className="empty empty--flush">Nothing matches these filters. Widen the year or rating, or clear the filters.</p>
        )}
      </section>
      {filtered && <Suspense fallback={null}>{featured}</Suspense>}
    </div>
  );
}

// `items` may be a promise: the row streams in while the grid renders.
export async function FeaturedRow({ title, items }) {
  const resolved = await items;
  return <Row title={title} items={resolved} />;
}
