// /watch/{movie|tv|anime}/{id}: a bare HTML page with a server picker + the player.
// It deliberately bypasses the site layout (no navbar/footer/React). The user first picks a
// server (Vidrift / Vidly / Vidy); only then is that server's iframe loaded.
// AniList id for anime, TMDB id for movies/TV.
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
  const vidy = 'https://www.vidy.st'; // TMDB ids only
  const vidrift = 'https://embed.vidrift.net/embed'; // TMDB ids only
  // Player accent follows the site theme (--accent #f97316). Hex, no '#'.
  const color = '?color=F97316';
  const sources =
    type === 'anime'
      ? [{ name: 'Vidly', tag: 'Sub / Dub', url: `${vidly}/anime/${id}/${ep}/${q.get('dub') ? 'dub' : 'sub'}${color}` }]
      : type === 'tv'
        ? [
            { name: 'Vidrift', tag: 'Fastest', url: `${vidrift}/tv/${id}/${s}/${ep}` },
            { name: 'Vidly', tag: 'HD', url: `${vidly}/tv/${id}/${s}/${ep}${color}` },
            { name: 'Vidy', tag: 'Backup', url: `${vidy}/tv/${id}/${s}/${ep}${color}` },
          ]
        : [
            { name: 'Vidrift', tag: 'Fastest', url: `${vidrift}/movie/${id}` },
            { name: 'Vidly', tag: 'HD', url: `${vidly}/movie/${id}${color}` },
            { name: 'Vidy', tag: 'Backup', url: `${vidy}/movie/${id}${color}` },
          ];
  const bg = safeImage(q.get('bg'));
  const data = JSON.stringify(sources).replace(/</g, '\\u003c');

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#08090d">
<meta name="referrer" content="origin">
<title>Watch — Ember</title>
<link rel="preconnect" href="${vidly}">
<style>
  :root{--bg:#08090d;--surface:#12131a;--surface-2:#1b1d26;--text:#f6f3ef;--muted:#a9a6b2;--accent:#f97316;--accent-hi:#fb923c;--accent-deep:#ea580c;--line:rgba(255,255,255,.1)}
  *{box-sizing:border-box}
  html,body{margin:0;height:100%;background:var(--bg);overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:var(--text)}
  iframe{position:fixed;inset:0;width:100%;height:100%;border:0;background:#000}

  /* ---------- server picker (fits the viewport, never scrolls) ---------- */
  #pick{position:fixed;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;padding:clamp(12px,3svh,28px) 16px;overflow:hidden;transition:opacity .35s,visibility .35s}
  #pick.hide{opacity:0;visibility:hidden;pointer-events:none}
  #pick .bgimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.32;filter:blur(10px) saturate(1.2);transform:scale(1.1)}
  #pick::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(8,9,13,.55),rgba(8,9,13,.94) 85%)}
  .orb{position:absolute;z-index:1;border-radius:50%;filter:blur(70px);pointer-events:none;animation:float 9s ease-in-out infinite}
  .orb.a{width:46vmax;height:46vmax;left:-14vmax;top:-18vmax;background:rgba(249,115,22,.30)}
  .orb.b{width:34vmax;height:34vmax;right:-12vmax;bottom:-16vmax;background:rgba(234,88,12,.24);animation-delay:-4s}
  .box{position:relative;z-index:2;width:min(500px,100%);max-height:100%;padding:clamp(16px,3.4svh,30px) clamp(14px,4vw,28px);text-align:center;
    border-radius:24px;border:1px solid rgba(255,255,255,.1);background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02)),rgba(18,19,26,.6);
    backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3);box-shadow:0 30px 80px -30px rgba(0,0,0,.9),0 0 0 1px rgba(249,115,22,.08) inset;animation:rise .5s both}
  .mark{width:clamp(40px,7svh,54px);aspect-ratio:1;margin:0 auto clamp(8px,1.6svh,14px);border-radius:16px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,var(--accent-hi),var(--accent-deep));box-shadow:0 12px 30px -8px rgba(249,115,22,.75),0 0 0 6px rgba(249,115,22,.12)}
  .mark svg{width:46%;height:46%;margin-left:3px}
  .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent-hi);font-weight:700}
  .eyebrow i{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 12px var(--accent);animation:pulse 1.6s ease-in-out infinite}
  h1{margin:clamp(4px,.8svh,8px) 0 4px;font-size:clamp(1.3rem,4.4vw,1.8rem);font-weight:800;letter-spacing:-.01em}
  .sub{margin:0 0 clamp(12px,2.4svh,20px);color:var(--muted);font-size:clamp(.78rem,2.6vw,.9rem);line-height:1.4}
  .list{display:grid;gap:clamp(8px,1.4svh,10px)}
  .srv{position:relative;display:flex;align-items:center;gap:12px;width:100%;padding:clamp(9px,1.8svh,13px) 14px;text-align:left;font:inherit;color:inherit;cursor:pointer;overflow:hidden;
    background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:14px;
    transition:transform .18s,border-color .18s,box-shadow .18s,background .18s;animation:rise .5s both}
  .srv::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(249,115,22,.16),transparent 70%);transform:translateX(-120%);transition:transform .6s}
  .srv:nth-child(1){animation-delay:.08s}.srv:nth-child(2){animation-delay:.15s}.srv:nth-child(3){animation-delay:.22s}
  .srv:hover,.srv:focus-visible{transform:translateY(-2px);border-color:var(--accent);background:rgba(249,115,22,.08);box-shadow:0 14px 34px -14px rgba(249,115,22,.6);outline:0}
  .srv:hover::after,.srv:focus-visible::after{transform:translateX(120%)}
  .srv:active{transform:scale(.99)}
  .ico{position:relative;z-index:1;flex:none;width:clamp(36px,6svh,42px);aspect-ratio:1;border-radius:12px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,var(--accent-hi),var(--accent-deep));box-shadow:0 8px 20px -8px rgba(249,115,22,.7)}
  .ico svg{width:18px;height:18px;margin-left:2px}
  .meta{position:relative;z-index:1;flex:1;min-width:0}
  .nm{display:block;font-size:1rem;font-weight:700}
  .ds{display:block;margin-top:1px;font-size:.76rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tag{position:relative;z-index:1;flex:none;font-size:.66rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:3px 9px;border-radius:999px;color:var(--accent-hi);background:rgba(249,115,22,.14);border:1px solid rgba(249,115,22,.35)}
  .arrow{position:relative;z-index:1;flex:none;width:16px;height:16px;color:var(--muted);transition:transform .18s,color .18s}
  .srv:hover .arrow{transform:translateX(3px);color:var(--accent-hi)}
  .hint{margin:clamp(10px,2svh,16px) 0 0;font-size:.72rem;color:var(--muted)}
  @media (max-height:520px){.sub,.hint{display:none}.mark{display:none}}
  @media (max-width:380px){.tag{display:none}}
  @keyframes float{50%{transform:translate(3vmax,2vmax) scale(1.08)}}

  /* ---------- loader ---------- */
  #ld{position:fixed;inset:0;z-index:4;pointer-events:none;background:var(--bg);transition:opacity .4s}
  #ld.done{opacity:0}
  #ld img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.45}
  #ld::before{content:"";position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at center,rgba(0,0,0,.15),rgba(0,0,0,.85))}
  .sh{position:absolute;z-index:2;top:0;bottom:0;left:0;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);animation:sheen 1.8s ease-in-out infinite}
  .st{position:absolute;z-index:3;left:50%;top:50%;transform:translate(-50%,-50%);width:min(320px,70vw);text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;text-shadow:0 2px 12px rgba(0,0,0,.8)}
  #pct{font-size:clamp(2.4rem,8vw,4rem);font-weight:800;font-variant-numeric:tabular-nums}
  #msg{font-size:.9rem;color:rgba(255,255,255,.75)}
  .bar{width:100%;height:4px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden}
  #bar{height:100%;width:0;background:linear-gradient(90deg,var(--accent-deep),var(--accent),var(--accent-hi));border-radius:4px;transition:width .15s linear}
  .alt{margin-top:8px;pointer-events:auto;font:inherit;font-size:.85rem;font-weight:600;color:#fff;background:rgba(255,255,255,.1);border:1px solid var(--line);padding:8px 16px;border-radius:999px;cursor:pointer}
  .alt:hover{border-color:var(--accent);color:var(--accent-hi)}

  /* ---------- switch-server chip (over the player) ---------- */
  #sw{position:fixed;z-index:6;top:12px;left:12px;display:none;align-items:center;gap:8px;font:inherit;font-size:.8rem;font-weight:600;color:#fff;cursor:pointer;
    padding:8px 14px 8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(8,9,13,.7);backdrop-filter:blur(10px);opacity:.0;transition:opacity .25s,border-color .2s,color .2s}
  #sw.on{display:inline-flex}
  #sw svg{width:16px;height:16px;color:var(--accent-hi)}
  body:hover #sw.on,#sw:focus-visible{opacity:1}
  #sw:hover{border-color:var(--accent);color:var(--accent-hi)}
  @media (hover:none){#sw.on{opacity:.85}}

  @keyframes sheen{from{transform:translateX(-100%) skewX(-18deg)}to{transform:translateX(260%) skewX(-18deg)}}
  @keyframes pulse{50%{opacity:.35;transform:scale(.8)}}
  @keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){.sh,.eyebrow i,.srv{animation:none}}
</style>
</head><body>

<div id="pick" role="dialog" aria-labelledby="pt">
  ${bg ? `<img class="bgimg" src="${esc(bg)}" alt="">` : ''}
  <div class="orb a"></div><div class="orb b"></div>
  <div class="box">
    <div class="mark"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
    <span class="eyebrow"><i></i>Ember Player</span>
    <h1 id="pt">Choose a server</h1>
    <p class="sub">Pick a player to start watching. If one is slow or has no video, switch to another.</p>
    <div class="list" id="list"></div>
    <p class="hint">Tip: move your mouse over the player to switch servers any time.</p>
  </div>
</div>

<div id="ld" role="status" aria-live="polite" hidden>
  ${bg ? `<img src="${esc(bg)}" alt="">` : ''}
  <div class="sh"></div>
  <div class="st"><span id="pct">0%</span><span id="msg">Loading player…</span><div class="bar"><div id="bar"></div></div>
    <button type="button" class="alt" id="alt">Choose another server</button></div>
</div>

<button type="button" id="sw" aria-label="Switch server">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h13l-3-3M20 17H7l3 3"/></svg>
  <span id="swn">Server</span>
</button>

<iframe id="pl" title="Player" allow="encrypted-media; autoplay *; fullscreen *; picture-in-picture" allowfullscreen referrerpolicy="origin" hidden></iframe>

<script>
(function () {
  var sources = ${data}, timer, tick, pct = 0, cur = -1;
  var $ = function (x) { return document.getElementById(x); };
  var f = $('pl'), ld = $('ld'), pick = $('pick'), list = $('list'), sw = $('sw');
  var P = $('pct'), B = $('bar'), M = $('msg');
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  var ARR = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
  var DESC = { Vidrift: 'Quick start, clean player', Vidly: 'High quality, multiple sources', Vidy: 'Use if the others fail' };

  sources.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'srv';
    b.innerHTML = '<span class="ico">' + PLAY + '</span><span class="meta"><span class="nm"></span><span class="ds"></span></span><span class="tag"></span>' + ARR;
    b.querySelector('.nm').textContent = s.name;
    b.querySelector('.ds').textContent = DESC[s.name] || 'Stream this title';
    b.querySelector('.tag').textContent = s.tag;
    b.addEventListener('click', function () { play(i); });
    list.appendChild(b);
  });

  function show(n) { pct = n; var v = Math.floor(n); P.textContent = v + '%'; B.style.width = v + '%'; }

  function play(i) {
    cur = i; clearInterval(tick); clearTimeout(timer);
    pick.className = 'hide'; sw.className = ''; ld.hidden = false; ld.className = ''; ld.style.display = '';
    show(0); M.textContent = 'Loading ' + sources[i].name + '…';
    f.hidden = false; f.removeAttribute('src'); f.src = sources[i].url;
    // Estimated progress: browsers can't report real load progress for a cross-origin iframe.
    tick = setInterval(function () { if (pct < 90) show(pct + Math.max(1, (90 - pct) * 0.08)); }, 150);
    timer = setTimeout(function () { M.textContent = sources[i].name + ' is taking long — try another server'; }, 8000);
  }

  function back() {
    clearInterval(tick); clearTimeout(timer);
    f.removeAttribute('src'); f.hidden = true;
    ld.hidden = true; sw.className = '';
    pick.className = '';
  }

  f.addEventListener('load', function () {
    if (!f.getAttribute('src')) return;
    clearTimeout(timer); clearInterval(tick); show(100);
    $('swn').textContent = sources[cur].name + ' · Switch';
    setTimeout(function () { ld.className = 'done'; sw.className = 'on'; setTimeout(function () { ld.style.display = 'none'; }, 450); }, 250);
  });
  $('alt').addEventListener('click', back);
  sw.addEventListener('click', back);
})();
</script>
</body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'origin' },
  });
}

