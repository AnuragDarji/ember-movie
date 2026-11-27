/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    // Only these hosts may be framed on our pages, so an injected ad iframe is refused.
    // Not applied to /watch/*: the player may redirect across its own domains.
    const frames = [
      "'self'",
      'https://embed.vidrift.net',
      'https://vidly.pro',
      'https://www.vidy.st',
      'https://www.youtube-nocookie.com',
      'https://www.dailymotion.com',
    ].join(' ');
    return [{ source: '/((?!watch/).*)', headers: [{ key: 'Content-Security-Policy', value: `frame-src ${frames}` }] }];
  },
  async redirects() {
    return [{ source: '/my-list', destination: '/watchlist', permanent: true }];
  },
};
export default nextConfig;
