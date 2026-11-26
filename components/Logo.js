// Ember logo: a flame whose core is a play button.
export function LogoMark({ size = 30, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="ember-flame" x1="0.3" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#9BE7FF" />
          <stop offset="0.45" stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B3FE8" />
        </linearGradient>
      </defs>
      <path
        d="M16.6 1.6c.5 3.9 3.3 6.3 5.6 8.9 2.2 2.5 3.8 5.1 3.8 8.7A10 10 0 0 1 16 29.2 10 10 0 0 1 6 19.2c0-3.3 1.5-5.9 3.4-7.8.2 2.2 1.2 3.7 2.8 4.5-.6-5.7 1.4-10.6 4.4-14.3Z"
        fill="url(#ember-flame)"
      />
      <path d="M13.4 16.4v8.2a.9.9 0 0 0 1.35.78l6.6-4.1a.9.9 0 0 0 0-1.55l-6.6-4.1a.9.9 0 0 0-1.35.78Z" fill="#08090D" />
    </svg>
  );
}

export default function Logo({ size = 30 }) {
  return (
    <span className="logo">
      <LogoMark size={size} className="logo__mark" />
      <span className="logo__word">ember</span>
    </span>
  );
}
