import { useState } from 'react';
import { Button, Group, MultiSelect, Stack, Text, Textarea, TextInput } from '@mantine/core';
import type { ProjectInput } from '../api/endpoints';
import type { Project, User } from '../types';

interface ProjectFormProps {
  users: User[];
  initial?: Project;
  onCancel: () => void;
  onSubmit: (data: ProjectInput) => Promise<void>;
}

export function ProjectForm({ users, initial, onCancel, onSubmit }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [memberIds, setMemberIds] = useState<string[]>(
    initial ? initial.members.map((m) => String(m.id)) : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name, description: description || null, memberUserIds: memberIds.map(Number) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack>
      <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required maxLength={150} />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        rows={2}
      />
      <MultiSelect
        label="Members"
        description="People who can see and work on this project"
        placeholder={memberIds.length === 0 ? 'Select at least one person' : undefined}
        data={users.map((u) => ({ value: String(u.id), label: u.name }))}
        value={memberIds}
        onChange={setMemberIds}
        searchable
        required
      />
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={saving} disabled={!name || memberIds.length === 0}>
          {initial ? 'Save changes' : 'Create project'}
        </Button>
      </Group>
    </Stack>
  );
}
