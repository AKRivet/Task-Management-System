import { Badge } from '@mantine/core';
import type { WorkItemType } from '../types';

const TYPE_COLORS: Record<WorkItemType, string> = {
  Feature: 'grape',
  Story: 'teal',
  Task: 'indigo',
  Bug: 'red',
};

export function TypeBadge({ type }: { type: WorkItemType }) {
  return (
    <Badge color={TYPE_COLORS[type]} variant="outline">
      {type}
    </Badge>
  );
}
