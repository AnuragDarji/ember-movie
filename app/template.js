// Re-mounts on every navigation, which replays the soft page-in animation (see .page-in).
export default function Template({ children }) {
  return <div className="page-in">{children}</div>;
}
