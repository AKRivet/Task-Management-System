import { useEffect, useState } from 'react';
import { Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { deleteUser, getUsers } from '../api/endpoints';
import type { User } from '../types';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function UsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => getUsers().then(setUsers);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleDelete = (u: User) => {
    modals.openConfirmModal({
      title: 'Delete person',
      children: <Text size="sm">Delete "{u.name}"?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteUser(u.id);
          notifications.show({ message: `Deleted "${u.name}"`, color: 'green' });
          await load();
        } catch (err) {
          notifications.show({
            title: 'Could not delete person',
            message: err instanceof ApiError ? err.message : 'Something went wrong.',
            color: 'red',
            autoClose: 8000,
          });
        }
      },
    });
  };

  if (loading) return <Text>Loading…</Text>;

  return (
    <div>
      <Title mb="xs">People</Title>
      <Text c="dimmed" mb="md">
        Everyone who has registered an account. New people sign up on the Register page.
      </Text>

      <Stack gap="xs">
        {users.map((u) => (
          <Group key={u.id} justify="space-between" p="sm" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}>
            <Group gap="xs">
              <Text fw={600}>{u.name}</Text>
              <Text c="dimmed" size="sm">
                {u.email}
              </Text>
              <Badge color={u.role === 'Admin' ? 'grape' : 'gray'} variant="light">
                {u.role}
              </Badge>
            </Group>
            {isAdmin && (
              <Button variant="light" color="red" size="xs" onClick={() => handleDelete(u)}>
                Delete
              </Button>
            )}
          </Group>
        ))}
        {users.length === 0 && <Text c="dimmed">No people yet.</Text>}
      </Stack>
    </div>
  );
}
