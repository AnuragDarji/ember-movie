'use client';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from './Icons';

export default function BackButton({ fallback = '/' }) {
  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallback);
  };
  return (
    <button type="button" className="backbtn" onClick={goBack} aria-label="Go back">
      <ChevronLeft width={20} height={20} /> <span>Back</span>
    </button>
  );
}
