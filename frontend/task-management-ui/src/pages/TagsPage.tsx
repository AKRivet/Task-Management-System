import { useEffect, useState } from 'react';
import { Badge, Button, CloseButton, Group, Text, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { createTag, deleteTag, getTags } from '../api/endpoints';
import type { Tag } from '../types';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function TagsPage() {
  const { isAdmin } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => getTags().then(setTags);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTag(name);
      setName('');
      await load();
    } catch (err) {
      notifications.show({
        title: 'Could not create tag',
        message: err instanceof ApiError ? err.message : 'Something went wrong.',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    try {
      await deleteTag(tag.id);
      notifications.show({ message: `Deleted "${tag.name}"`, color: 'green' });
      await load();
    } catch (err) {
      notifications.show({
        title: 'Could not delete tag',
        message: err instanceof ApiError ? err.message : 'Something went wrong.',
        color: 'red',
      });
    }
  };

  if (loading) return <Text>Loading…</Text>;

  return (
    <div>
      <Title mb="xs">Tags</Title>
      <Text c="dimmed" mb="md">
        Free-form labels you can attach to work items, e.g. "urgent" or "bug".
      </Text>

      <form onSubmit={handleCreate}>
        <Group mb="md">
          <TextInput
            placeholder="New tag name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            maxLength={50}
          />
          <Button type="submit" loading={saving}>
            Add tag
          </Button>
        </Group>
      </form>

      <Group gap="xs">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            size="lg"
            rightSection={
              isAdmin ? <CloseButton size="xs" onClick={() => handleDelete(tag)} /> : undefined
            }
          >
            {tag.name}
          </Badge>
        ))}
        {tags.length === 0 && <Text c="dimmed">No tags yet — add one above.</Text>}
      </Group>
    </div>
  );
}
