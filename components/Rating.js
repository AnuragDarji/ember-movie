import { StarIcon } from './Icons';
export default function Rating({ value, label }) {
  if (!value) return null;
  return (
    <span className="rating" aria-label={`${label ? `${label} ` : ''}rating ${value.toFixed(1)} out of 10`}>
      <StarIcon width={14} height={14} /> {value.toFixed(1)}
      {label && <span className="rating__src">{label}</span>}
    </span>
  );
}
