import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="rows rows--top empty">
      <h1 className="page-header__h">We couldn’t find that title.</h1>
      <p>It may have been removed, or the link is wrong.</p>
      <Link href="/" className="btn btn--primary">Back to home</Link>
    </div>
  );
}
