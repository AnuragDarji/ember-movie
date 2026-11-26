export default function Loading() {
  return (
    <div className="rows rows--top" aria-busy="true" aria-label="Loading">
      {[0, 1, 2].map((r) => (
        <div className="row" key={r}>
          <div className="skeleton skeleton--title" />
          <div className="row__track">
            {Array.from({ length: 8 }).map((_, i) => <div className="skeleton skeleton--card" key={i} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
