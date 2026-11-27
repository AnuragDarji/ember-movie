import Rating from './Rating';
import Row from './Row';
import TitleActions from './TitleActions';
import SeasonPicker from './SeasonPicker';
import AnimeEpisodes from './AnimeEpisodes';
import TrackView from './TrackView';
import BackButton from './BackButton';
import TrailerPlayer from './TrailerPlayer';

export default function DetailView({ d }) {
  const isAnime = d.type === 'anime';

  return (
    <article className="detail">
      <TrackView item={d} />
      <BackButton fallback={isAnime ? '/anime' : d.type === 'tv' ? '/tv' : '/movies'} />
      <div className="detail__backdrop">
        {(d.backdrop || d.poster) && <img src={d.backdrop || d.poster} alt="" />}
        <div className="detail__shade" />
      </div>
      <div className="detail__main">
        <img className="detail__poster" src={d.poster} alt={`${d.title} poster`} />
        <div className="detail__body">
          <h1 className="detail__title">{d.title}</h1>
          {d.tagline && <p className="detail__tagline">{d.tagline}</p>}
          <div className="meta">
            <Rating value={d.rating} label={isAnime ? 'AniList' : 'TMDB'} />
            {d.malScore ? <Rating value={d.malScore} label="MAL" /> : null}
            {d.year && <span>{d.year}</span>}
            {d.runtime && <span>{d.runtime}</span>}
          </div>
          <div className="chips">
            {d.genres.map((g) => <span key={g} className="chip">{g}</span>)}
          </div>
          <p className="detail__overview">{d.overview || 'No synopsis available yet.'}</p>
          <TitleActions item={d} trailerUrl={d.trailerUrl} />
        </div>
      </div>

      <TrailerPlayer url={d.trailerUrl} title={d.title} poster={d.backdrop || d.poster} />

      <div className="facts pad">
        {d.facts?.length > 0 && (
          <dl className="facts__list">
            {d.facts.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        )}
        {d.crew?.length > 0 && (
          <dl className="facts__list facts__list--crew">
            {d.crew.map((c) => (
              <div key={c.label}><dt>{c.label}</dt><dd>{c.names.join(', ')}</dd></div>
            ))}
          </dl>
        )}
      </div>

      {d.type === 'tv' && <SeasonPicker item={d} seasons={d.seasons} />}
      {isAnime && <AnimeEpisodes item={d} episodes={d.officialEpisodes} nextEpisode={d.nextEpisode} />}

      {d.cast?.length > 0 && (
        <section className="row" aria-label={isAnime ? 'Characters' : 'Cast'}>
          <div className="row__head"><h2 className="row__title">{isAnime ? 'Characters' : 'Cast'}</h2></div>
          <div className="row__track cast">
            {d.cast.map((c) => (
              <div className="cast__item" key={c.id}>
                {c.photo ? <img src={c.photo} alt="" loading="lazy" /> : <span className="cast__blank">{c.name?.[0]}</span>}
                <p className="cast__name">{c.name}</p>
                {c.role && <p className="cast__role">{c.role}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <Row title="More like this" items={d.similar} />
    </article>
  );
}
