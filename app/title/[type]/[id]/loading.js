export default function Loading() {
  return (
    <div className="detail" aria-busy="true" aria-label="Loading">
      <div className="detail__main">
        <div className="skeleton detail__poster" />
        <div>
          <div className="skeleton" style={{ height: 56, width: '60%', marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 80, width: '90%' }} />
        </div>
      </div>
    </div>
  );
}
