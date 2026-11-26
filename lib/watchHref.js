// Link to the full-screen watch page. The backdrop/poster rides along so the
// loading state can show the title's artwork immediately, with no extra fetch.
export function watchHref(item) {
  const img = item.backdrop || item.poster;
  return `/watch/${item.type}/${item.id}${img ? `?bg=${encodeURIComponent(img)}` : ''}`;
}
