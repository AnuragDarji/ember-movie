import { Space_Grotesk, Manrope, Pacifico } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TabBar from '@/components/TabBar';
import './globals.css';

// Headlines: Space Grotesk (sharp, techy, distinctive numerals; suits the blue-flame theme).
// Body/UI: Manrope (smooth, modern, highly readable).
const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display', display: 'swap' });
const body = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body', display: 'swap' });

const script = Pacifico({ subsets: ['latin'], weight: '400', variable: '--font-script', display: 'swap' });

export const metadata = {
  title: 'Ember — Movies, TV & Anime',
  description: 'Discover movies, TV shows and anime, see where to watch them, and keep a watchlist.',
};

export const viewport = { themeColor: '#080A0F', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-side="collapsed" suppressHydrationWarning className={`${display.variable} ${body.variable} ${script.variable}`}>
      <head>
        {/* Warm connections so posters and the player start sooner. */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://vidly.pro" />
        <link rel="dns-prefetch" href="https://www.vidy.st" />
        <link rel="dns-prefetch" href="https://s4.anilist.co" />
      </head>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <TabBar />
      </body>
    </html>
  );
}
