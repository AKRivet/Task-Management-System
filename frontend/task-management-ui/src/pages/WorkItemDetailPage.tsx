import { useEffect, useState } from 'react';
import { Anchor, Breadcrumbs, Button, Card, Group, List, Stack, Text, Title } from '@mantine/core';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  createComment,
  deleteWorkItem,
  getComments,
  getStatuses,
  getTags,
  getUsers,
  getWorkItem,
  getWorkItems,
  updateWorkItem,
} from '../api/endpoints';
import type { Comment, Status, Tag, User, WorkItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TypeBadge } from '../components/TypeBadge';
import { WorkItemForm } from '../components/WorkItemForm';
import { CommentSection } from '../components/CommentSection';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

async function fetchAncestors(item: WorkItem): Promise<WorkItem[]> {
  const ancestors: WorkItem[] = [];
  let currentParentId = item.parentWorkItemId;
  while (currentParentId) {
    const parent = await getWorkItem(currentParentId);
    ancestors.unshift(parent);
    currentParentId = parent.parentWorkItemId;
  }
  return ancestors;
}

export function WorkItemDetailPage() {
  const { projectId, workItemId } = useParams<{ projectId: string; workItemId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const id = Number(workItemId);

  const [item, setItem] = useState<WorkItem | null>(null);
  const [ancestors, setAncestors] = useState<WorkItem[]>([]);
  const [children, setChildren] = useState<WorkItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [allWorkItems, setAllWorkItems] = useState<WorkItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const workItem = await getWorkItem(id);
    const [ancestorChain, childItems, commentList, statusList, userList, tagList, projectItems] = await Promise.all([
      fetchAncestors(workItem),
      getWorkItems({ parentWorkItemId: id }),
      getComments(id),
      getStatuses(),
      getUsers(),
      getTags(),
      getWorkItems({ projectId: workItem.projectId }),
    ]);
    setItem(workItem);
    setAncestors(ancestorChain);
    setChildren(childItems);
    setComments(commentList);
    setStatuses(statusList);
    setUsers(userList);
    setTags(tagList);
    setAllWorkItems(projectItems);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = () => {
    if (!item) return;
    modals.openConfirmModal({
      title: 'Delete work item',
      children: (
        <Text size="sm">
          Delete "{item.title}"?
          {item.childCount > 0 ? ` This also deletes its ${item.childCount} child work item(s).` : ''}
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteWorkItem(id);
          notifications.show({ message: `Deleted "${item.title}"`, color: 'green' });
          navigate(`/projects/${projectId}`);
        } catch (err) {
          notifications.show({
            title: 'Could not delete work item',
            message: err instanceof ApiError ? err.message : 'Something went wrong.',
            color: 'red',
          });
        }
      },
    });
  };

  if (loading || !item || !user) return <Text>Loading…</Text>;

  return (
    <div>
      <Breadcrumbs mb="xs">
        <Anchor component={Link} to={`/projects/${projectId}`} size="sm">
          Project backlog
        </Anchor>
        {ancestors.map((a) => (
          <Anchor key={a.id} component={Link} to={`/projects/${projectId}/workitems/${a.id}`} size="sm">
            {a.title}
          </Anchor>
        ))}
        <Text size="sm">{item.title}</Text>
      </Breadcrumbs>

      {editing ? (
        <Card withBorder radius="md" p="md" mb="lg">
          <WorkItemForm
            statuses={statuses}
            users={users}
            tags={tags}
            allWorkItems={allWorkItems}
            initial={item}
            onCancel={() => setEditing(false)}
            onSubmit={async (data) => {
              await updateWorkItem(id, data);
              setEditing(false);
              notifications.show({ message: 'Work item updated', color: 'green' });
              await load();
            }}
          />
        </Card>
      ) : (
        <Card withBorder radius="md" p="md" mb="lg">
          <Group justify="space-between" mb="xs">
            <Title order={2}>{item.title}</Title>
            <Group>
              <Button variant="default" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="light" color="red" onClick={handleDelete}>
                Delete
              </Button>
            </Group>
          </Group>
          <Text mb="sm">{item.description || 'No description'}</Text>
          <Group gap="xs" mb="xs">
            <TypeBadge type={item.type} />
            <StatusBadge name={item.statusName} />
            <PriorityBadge priority={item.priority} />
            {item.tags.map((t) => (
              <Text key={t.id} size="xs" c="dimmed">
                #{t.name}
              </Text>
            ))}
          </Group>
          <Text size="sm" c="dimmed">
            {item.assignedUserName ? `Assigned to ${item.assignedUserName}` : 'Unassigned'}
            {item.dueDate ? ` · Due ${item.dueDate}` : ''}
          </Text>

          {children.length > 0 && (
            <>
              <Title order={5} mt="md" mb="xs">
                Children
              </Title>
              <List spacing="xs">
                {children.map((child) => (
                  <List.Item key={child.id}>
                    <Anchor component={Link} to={`/projects/${projectId}/workitems/${child.id}`}>
                      {child.type}: {child.title}
                    </Anchor>{' '}
                    <StatusBadge name={child.statusName} />
                  </List.Item>
                ))}
              </List>
            </>
          )}
        </Card>
      )}

      <Stack>
        <CommentSection
          comments={comments}
          currentUserId={user.id}
          onAdd={async (data) => {
            await createComment(id, data);
            await load();
          }}
        />
      </Stack>
    </div>
  );
}
