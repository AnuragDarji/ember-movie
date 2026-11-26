import { notFound } from 'next/navigation';
import DetailView from '@/components/DetailView';
import { getTitle } from '@/lib/tmdb';

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const d = await getTitle(params.type, params.id);
  return { title: d ? `${d.title} — Ember` : 'Not found — Ember' };
}

export default async function TitlePage({ params }) {
  const d = await getTitle(params.type, params.id);
  if (!d) notFound();
  return <DetailView d={d} />;
}
