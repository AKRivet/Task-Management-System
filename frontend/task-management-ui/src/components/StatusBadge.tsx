import { Badge } from '@mantine/core';

const STATUS_COLORS: Record<string, string> = {
  'To Do': 'gray',
  'In Progress': 'blue',
  Done: 'green',
  Blocked: 'red',
};

export function StatusBadge({ name }: { name: string }) {
  return (
    <Badge color={STATUS_COLORS[name] ?? 'gray'} variant="filled">
      {name}
    </Badge>
  );
}
