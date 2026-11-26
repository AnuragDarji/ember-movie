import Card from './Card';
export default function Grid({ items }) {
  return (
    <div className="grid">
      {items.map((item) => (
        <Card key={item.key} item={item} />
      ))}
    </div>
  );
}
