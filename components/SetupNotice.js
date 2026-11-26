export default function SetupNotice() {
  return (
    <div className="notice">
      <strong>Add your TMDB key to load movies and TV shows.</strong>
      <p>
        Copy <code>.env.example</code> to <code>.env.local</code>, paste your TMDB read access token,
        then restart <code>npm run dev</code>. Anime from AniList works without a key.
      </p>
    </div>
  );
}
