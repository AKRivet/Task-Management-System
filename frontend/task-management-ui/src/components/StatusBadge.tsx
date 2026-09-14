const STATUS_COLORS: Record<string, string> = {
  'To Do': '#6b7280',
  'In Progress': '#2563eb',
  Done: '#16a34a',
  Blocked: '#dc2626',
};

export function StatusBadge({ name }: { name: string }) {
  const color = STATUS_COLORS[name] ?? '#6b7280';
  return (
    <span className="badge" style={{ backgroundColor: color }}>
      {name}
    </span>
  );
}
