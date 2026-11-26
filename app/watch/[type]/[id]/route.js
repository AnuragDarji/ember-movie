// /watch/{movie|tv|anime}/{id}: a bare HTML page with only the player.
// It deliberately bypasses the site layout (no navbar/footer/React), so the iframe
// starts loading immediately. AniList id for anime, TMDB id for movies/TV.
const IMAGE_HOSTS = ['image.tmdb.org', 's4.anilist.co', 'img.anili.st'];

function safeImage(u) {
  try {
    const url = new URL(u);
    const ok = url.protocol === 'https:' && (IMAGE_HOSTS.includes(url.hostname) || url.hostname.endsWith('.anilist.co'));
    return ok ? url.href : '';
  } catch {
    return '';
  }
}

const num = (v, d) => (/^\d{1,4}$/.test(v || '') ? v : d);
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function GET(req, { params }) {
  const { type, id } = params;
  if (!/^\d+$/.test(id) || !['movie', 'tv', 'anime'].includes(type)) return new Response('Not found', { status: 404 });

  const q = req.nextUrl.searchParams;
  const s = num(q.get('s'), '1');
  const ep = num(q.get('ep'), '1');
  const vidly = 'https://vidly.pro';
  const vidy = 'https://www.vidy.st'; // fallback, TMDB ids only
  // Player accent follows the site theme (--accent #7c5cff). Hex, no '#'.
  const color = '?color=7C5CFF';
  const sources =
    type === 'anime'
      ? [`${vidly}/anime/${id}/${ep}/${q.get('dub') ? 'dub' : 'sub'}${color}`]
      : type === 'tv'
        ? [`${vidly}/tv/${id}/${s}/${ep}${color}`, `${vidy}/tv/${id}/${s}/${ep}${color}`]
        : [`${vidly}/movie/${id}${color}`, `${vidy}/movie/${id}${color}`];
  const bg = safeImage(q.get('bg'));
  const data = JSON.stringify(sources).replace(/</g, '\u003c');

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#000000">
<meta name="referrer" content="origin">
<title>Watch — Ember</title>
<link rel="preconnect" href="${vidly}">
<style>
  html,body{margin:0;height:100%;background:#000;overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#fff}
  iframe{position:fixed;inset:0;width:100%;height:100%;border:0;background:#000}
  #ld{position:fixed;inset:0;z-index:2;pointer-events:none;background:#000;transition:opacity .4s}
  #ld.done{opacity:0}
  #ld img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.5}
  #ld::before{content:"";position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at center,rgba(0,0,0,.15),rgba(0,0,0,.85))}
  .sh{position:absolute;z-index:2;top:0;bottom:0;left:0;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent);animation:sheen 1.8s ease-in-out infinite}
  @keyframes sheen{from{transform:translateX(-100%) skewX(-18deg)}to{transform:translateX(260%) skewX(-18deg)}}
  .st{position:absolute;z-index:3;left:50%;top:50%;transform:translate(-50%,-50%);width:min(320px,70vw);text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;text-shadow:0 2px 12px rgba(0,0,0,.8)}
  #pct{font-size:clamp(2.4rem,8vw,4rem);font-weight:800;font-variant-numeric:tabular-nums}
  #msg{font-size:.9rem;color:rgba(255,255,255,.75)}
  .bar{width:100%;height:4px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden}
  #bar{height:100%;width:0;background:linear-gradient(90deg,#22d3ee,#6366f1,#a855f7);border-radius:4px;transition:width .15s linear}
  @media (prefers-reduced-motion:reduce){.sh{animation:none}}
</style>
</head><body>
<div id="ld" role="status" aria-live="polite">
  ${bg ? `<img src="${esc(bg)}" alt="">` : ''}
  <div class="sh"></div>
  <div class="st"><span id="pct">0%</span><span id="msg">Loading player…</span><div class="bar"><div id="bar"></div></div></div>
</div>
<iframe id="pl" title="Player" allow="encrypted-media; autoplay *; fullscreen *; picture-in-picture" allowfullscreen referrerpolicy="origin"></iframe>
<script>
(function () {
  var sources = ${data}, i = 0, done = false, pct = 0;
  var f = document.getElementById('pl'), ld = document.getElementById('ld');
  var P = document.getElementById('pct'), B = document.getElementById('bar'), M = document.getElementById('msg');
  function show(n) { pct = n; var v = Math.floor(n); P.textContent = v + '%'; B.style.width = v + '%'; }
  function load() { f.src = sources[i]; }
  // Estimated progress: browsers can't report real load progress for a cross-origin iframe.
  var tick = setInterval(function () { if (!done && pct < 90) show(pct + Math.max(1, (90 - pct) * 0.08)); }, 150);
  var timer = setTimeout(next, 8000);
  function next() {
    if (done || i >= sources.length - 1) return;
    i++; show(0); M.textContent = 'Trying another server…'; load(); timer = setTimeout(next, 8000);
  }
  f.addEventListener('load', function () {
    if (!f.getAttribute('src')) return;
    done = true; clearTimeout(timer); clearInterval(tick); show(100);
    setTimeout(function () { ld.className = 'done'; setTimeout(function () { ld.remove(); }, 450); }, 250);
  });
  load();
})();
</script>
</body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'origin' },
  });
}
