import { useState } from 'react';
import { Button, Group, MultiSelect, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { WORK_ITEM_PRIORITIES, WORK_ITEM_TYPES } from '../types';
import type { Status, Tag, User, WorkItem, WorkItemPriority, WorkItemType } from '../types';
import type { WorkItemInput } from '../api/endpoints';

// A Story's parent should be a Feature; a Task/Bug's parent should be a
// Story or another Task (for sub-tasks); a Feature has no parent. This is
// soft UI guidance, not a hard rule — the backend only rejects cycles.
function eligibleParentTypes(type: WorkItemType): WorkItemType[] {
  switch (type) {
    case 'Story':
      return ['Feature'];
    case 'Task':
    case 'Bug':
      return ['Story', 'Task', 'Bug'];
    default:
      return [];
  }
}

interface WorkItemFormProps {
  statuses: Status[];
  users: User[];
  tags: Tag[];
  allWorkItems: WorkItem[];
  initial?: WorkItem;
  onCancel: () => void;
  onSubmit: (data: WorkItemInput) => Promise<void>;
}

export function WorkItemForm({ statuses, users, tags, allWorkItems, initial, onCancel, onSubmit }: WorkItemFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [type, setType] = useState<WorkItemType>(initial?.type ?? 'Task');
  const [statusId, setStatusId] = useState<string | null>(String(initial?.statusId ?? statuses[0]?.id ?? ''));
  const [priority, setPriority] = useState<WorkItemPriority>(initial?.priority ?? 'Medium');
  const [assignedUserId, setAssignedUserId] = useState<string | null>(
    initial?.assignedUserId ? String(initial.assignedUserId) : null
  );
  const [parentWorkItemId, setParentWorkItemId] = useState<string | null>(
    initial?.parentWorkItemId ? String(initial.parentWorkItemId) : null
  );
  const [dueDate, setDueDate] = useState<string | null>(initial?.dueDate ?? null);
  const [tagIds, setTagIds] = useState<string[]>(initial?.tags.map((t) => String(t.id)) ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eligibleParents = allWorkItems.filter(
    (w) => eligibleParentTypes(type).includes(w.type) && w.id !== initial?.id
  );

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title,
        description: description || null,
        type,
        statusId: Number(statusId),
        priority,
        assignedUserId: assignedUserId ? Number(assignedUserId) : null,
        parentWorkItemId: parentWorkItemId ? Number(parentWorkItemId) : null,
        dueDate,
        tagIds: tagIds.map(Number),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack>
      <TextInput label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required maxLength={200} />
      <Textarea label="Description" value={description} onChange={(e) => setDescription(e.currentTarget.value)} rows={2} />
      <Group grow>
        <Select
          label="Type"
          data={WORK_ITEM_TYPES.map((t) => ({ value: t, label: t }))}
          value={type}
          onChange={(v) => {
            setType(v as WorkItemType);
            setParentWorkItemId(null);
          }}
          required
        />
        <Select
          label="Status"
          data={statuses.map((s) => ({ value: String(s.id), label: s.name }))}
          value={statusId}
          onChange={setStatusId}
          required
        />
      </Group>
      <Group grow>
        <Select
          label="Priority"
          data={WORK_ITEM_PRIORITIES.map((p) => ({ value: p, label: p }))}
          value={priority}
          onChange={(v) => setPriority(v as WorkItemPriority)}
          required
        />
        <Select
          label="Assignee"
          placeholder="Unassigned"
          data={users.map((u) => ({ value: String(u.id), label: u.name }))}
          value={assignedUserId}
          onChange={setAssignedUserId}
          clearable
        />
      </Group>
      {eligibleParentTypes(type).length > 0 && (
        <Select
          label="Parent"
          placeholder="None (top-level)"
          description={`Pick a ${eligibleParentTypes(type).join(' or ')} this belongs under`}
          data={eligibleParents.map((w) => ({ value: String(w.id), label: `${w.type}: ${w.title}` }))}
          value={parentWorkItemId}
          onChange={setParentWorkItemId}
          clearable
          searchable
        />
      )}
      <DateInput
        label="Due date"
        placeholder="Pick a date"
        value={dueDate}
        onChange={(v) => setDueDate(v as unknown as string | null)}
        valueFormat="YYYY-MM-DD"
        clearable
      />
      {tags.length > 0 && (
        <MultiSelect
          label="Tags"
          data={tags.map((t) => ({ value: String(t.id), label: t.name }))}
          value={tagIds}
          onChange={setTagIds}
        />
      )}
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={saving} disabled={!title || !statusId}>
          {initial ? 'Save changes' : 'Create work item'}
        </Button>
      </Group>
    </Stack>
  );
}
