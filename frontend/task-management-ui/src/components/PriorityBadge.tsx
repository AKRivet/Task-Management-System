import { Badge } from '@mantine/core';
import type { WorkItemPriority } from '../types';

const PRIORITY_COLORS: Record<WorkItemPriority, string> = {
  Low: 'gray',
  Medium: 'blue',
  High: 'orange',
  Critical: 'red',
};

export function PriorityBadge({ priority }: { priority: WorkItemPriority }) {
  return (
    <Badge color={PRIORITY_COLORS[priority]} variant="light">
      {priority}
    </Badge>
  );
}
