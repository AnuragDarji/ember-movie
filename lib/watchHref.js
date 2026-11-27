// Link to the full-screen watch page. The backdrop/poster rides along so the
// loading state can show the title's artwork immediately, with no extra fetch.
export function watchHref(item, ep) {
  const img = item.backdrop || item.poster;
  const p = [];
  if (img) p.push(`bg=${encodeURIComponent(img)}`);
  if (ep) p.push(`s=${ep.season}`, `ep=${ep.episode}`);
  return `/watch/${item.type}/${item.id}${p.length ? `?${p.join('&')}` : ''}`;
}
