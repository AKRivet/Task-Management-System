import type { TaskPriority } from '../types';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  Low: '#4b5563',
  Medium: '#2563eb',
  High: '#d97706',
  Critical: '#dc2626',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className="badge" style={{ backgroundColor: PRIORITY_COLORS[priority] }}>
      {priority}
    </span>
  );
}
