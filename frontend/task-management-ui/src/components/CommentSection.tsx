import { useState } from 'react';
import { Avatar, Button, Group, Paper, Stack, Text, Textarea, Title } from '@mantine/core';
import type { Comment } from '../types';

interface CommentSectionProps {
  comments: Comment[];
  currentUserId: number;
  onAdd: (data: { userId: number; body: string }) => Promise<void>;
}

export function CommentSection({ comments, currentUserId, onAdd }: CommentSectionProps) {
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onAdd({ userId: currentUserId, body });
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack mt="lg">
      <Title order={4}>Comments</Title>
      {comments.length === 0 && (
        <Text c="dimmed" size="sm" fs="italic">
          No comments yet.
        </Text>
      )}
      {comments.map((c) => (
        <Paper key={c.id} withBorder p="sm" radius="md">
          <Group justify="space-between" mb={4}>
            <Group gap="xs">
              <Avatar size="sm" color="indigo" radius="xl">
                {c.userName.charAt(0).toUpperCase()}
              </Avatar>
              <Text fw={600} size="sm">
                {c.userName}
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {new Date(c.createdAt).toLocaleString()}
            </Text>
          </Group>
          <Text size="sm">{c.body}</Text>
        </Paper>
      ))}
      <Textarea
        placeholder="Add a comment…"
        value={body}
        onChange={(e) => setBody(e.currentTarget.value)}
        maxLength={2000}
        autosize
        minRows={2}
      />
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      <Group justify="flex-end">
        <Button onClick={handleSubmit} loading={saving} disabled={!body.trim()}>
          Post
        </Button>
      </Group>
    </Stack>
  );
}
