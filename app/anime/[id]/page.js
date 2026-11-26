import { notFound } from 'next/navigation';
import DetailView from '@/components/DetailView';
import { getAnime } from '@/lib/anilist';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const d = await getAnime(params.id);
  return { title: d ? `${d.title} — Ember` : 'Not found — Ember' };
}

export default async function AnimePage({ params }) {
  const d = await getAnime(params.id);
  if (!d) notFound();
  return <DetailView d={d} />;
}
