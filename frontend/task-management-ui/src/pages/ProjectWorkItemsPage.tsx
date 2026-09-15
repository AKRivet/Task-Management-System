import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Anchor,
  Button,
  Group,
  Modal,
  Pagination,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
  createWorkItem,
  deleteWorkItem,
  getProject,
  getStatuses,
  getTags,
  getUsers,
  getWorkItems,
  updateWorkItem,
} from '../api/endpoints';
import type { Project, Status, Tag, User, WorkItem, WorkItemPriority, WorkItemType } from '../types';
import { WORK_ITEM_PRIORITIES, WORK_ITEM_TYPES } from '../types';
import { WorkItemForm } from '../components/WorkItemForm';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TypeBadge } from '../components/TypeBadge';
import { ApiError } from '../api/client';

const PAGE_SIZE = 15;
const PRIORITY_ORDER: Record<WorkItemPriority, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };

type SortKey = 'createdAt' | 'title' | 'priority' | 'dueDate';

function flattenHierarchy(items: WorkItem[], sortKey: SortKey): { item: WorkItem; depth: number }[] {
  const byParent = new Map<number | null, WorkItem[]>();
  for (const item of items) {
    const key = item.parentWorkItemId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(item);
  }

  const compare = (a: WorkItem, b: WorkItem) => {
    switch (sortKey) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'priority':
        return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      case 'dueDate':
        return (a.dueDate ?? '9999-99-99').localeCompare(b.dueDate ?? '9999-99-99');
      default:
        return a.createdAt.localeCompare(b.createdAt);
    }
  };

  const rows: { item: WorkItem; depth: number }[] = [];
  const visit = (parentId: number | null, depth: number) => {
    const children = (byParent.get(parentId) ?? []).slice().sort(compare);
    for (const child of children) {
      rows.push({ item: child, depth });
      visit(child.id, depth + 1);
    }
  };
  visit(null, 0);
  return rows;
}

export function ProjectWorkItemsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const id = Number(projectId);

  const [project, setProject] = useState<Project | null>(null);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<'create' | WorkItem | null>(null);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<WorkItemPriority | null>(null);
  const [typeFilter, setTypeFilter] = useState<WorkItemType | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [page, setPage] = useState(1);

  const loadStatic = () =>
    Promise.all([getProject(id), getStatuses(), getUsers(), getTags()]).then(([p, s, u, t]) => {
      setProject(p);
      setStatuses(s);
      setUsers(u);
      setTags(t);
    });

  const loadWorkItems = () =>
    getWorkItems({
      projectId: id,
      statusId: statusFilter ? Number(statusFilter) : undefined,
      priority: priorityFilter ?? undefined,
      type: typeFilter ?? undefined,
    }).then(setWorkItems);

  useEffect(() => {
    Promise.all([loadStatic(), loadWorkItems()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!loading) loadWorkItems();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, typeFilter]);

  const handleDelete = (item: WorkItem) => {
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
          await deleteWorkItem(item.id);
          notifications.show({ message: `Deleted "${item.title}"`, color: 'green' });
          await loadWorkItems();
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

  if (loading || !project) return <Text>Loading…</Text>;

  const searchLower = search.trim().toLowerCase();
  const isSearching = searchLower.length > 0;

  const rows = isSearching
    ? workItems.filter((w) => w.title.toLowerCase().includes(searchLower)).map((item) => ({ item, depth: 0 }))
    : flattenHierarchy(workItems, sortKey);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <Anchor component={Link} to="/projects" size="sm">
        &larr; All projects
      </Anchor>

      <Group justify="space-between" mt="xs" mb="md">
        <div>
          <Title>{project.name}</Title>
          <Text c="dimmed">{project.description || 'No description'}</Text>
        </div>
        <Button onClick={() => setModalState('create')}>+ New work item</Button>
      </Group>

      <Group mb="md">
        <TextInput
          placeholder="Search work items…"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
          w={220}
        />
        <Select
          placeholder="Type"
          data={WORK_ITEM_TYPES.map((t) => ({ value: t, label: t }))}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as WorkItemType | null)}
          clearable
          w={140}
        />
        <Select
          placeholder="Status"
          data={statuses.map((s) => ({ value: String(s.id), label: s.name }))}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          w={140}
        />
        <Select
          placeholder="Priority"
          data={WORK_ITEM_PRIORITIES.map((p) => ({ value: p, label: p }))}
          value={priorityFilter}
          onChange={(v) => setPriorityFilter(v as WorkItemPriority | null)}
          clearable
          w={140}
        />
        {!isSearching && (
          <Select
            placeholder="Sort by"
            data={[
              { value: 'createdAt', label: 'Created date' },
              { value: 'title', label: 'Title' },
              { value: 'priority', label: 'Priority' },
              { value: 'dueDate', label: 'Due date' },
            ]}
            value={sortKey}
            onChange={(v) => setSortKey((v as SortKey) ?? 'createdAt')}
            w={150}
          />
        )}
      </Group>

      <Stack gap="xs">
        {pageRows.map(({ item, depth }) => (
          <Group
            key={item.id}
            justify="space-between"
            wrap="nowrap"
            p="sm"
            style={{
              marginLeft: depth * 28,
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: 8,
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/projects/${id}/workitems/${item.id}`)}
          >
            <Group gap="xs" wrap="wrap">
              <TypeBadge type={item.type} />
              <Text fw={600}>{item.title}</Text>
              <StatusBadge name={item.statusName} />
              <PriorityBadge priority={item.priority} />
              {item.tags.map((t) => (
                <Text key={t.id} size="xs" c="dimmed">
                  #{t.name}
                </Text>
              ))}
              <Text size="xs" c="dimmed">
                {item.assignedUserName ? `· ${item.assignedUserName}` : '· Unassigned'}
                {item.dueDate ? ` · Due ${item.dueDate}` : ''}
                {item.childCount > 0 ? ` · ${item.childCount} child item(s)` : ''}
              </Text>
            </Group>
            <Group gap="xs" onClick={(e) => e.stopPropagation()}>
              <Button variant="default" size="xs" onClick={() => setModalState(item)}>
                Edit
              </Button>
              <Button variant="light" color="red" size="xs" onClick={() => handleDelete(item)}>
                Delete
              </Button>
            </Group>
          </Group>
        ))}
        {pageRows.length === 0 && (
          <Text c="dimmed">No work items match — create one above or clear filters.</Text>
        )}
      </Stack>

      {totalPages > 1 && (
        <Group justify="center" mt="lg">
          <Pagination value={page} onChange={setPage} total={totalPages} />
        </Group>
      )}

      <Modal
        opened={modalState !== null}
        onClose={() => setModalState(null)}
        title={modalState === 'create' ? 'New work item' : modalState ? 'Edit work item' : undefined}
        size="lg"
      >
        {modalState === 'create' && (
          <WorkItemForm
            statuses={statuses}
            users={users}
            tags={tags}
            allWorkItems={workItems}
            onCancel={() => setModalState(null)}
            onSubmit={async (data) => {
              await createWorkItem(id, data);
              setModalState(null);
              notifications.show({ message: 'Work item created', color: 'green' });
              await loadWorkItems();
            }}
          />
        )}
        {modalState !== null && modalState !== 'create' && (
          <WorkItemForm
            statuses={statuses}
            users={users}
            tags={tags}
            allWorkItems={workItems}
            initial={modalState}
            onCancel={() => setModalState(null)}
            onSubmit={async (data) => {
              await updateWorkItem(modalState.id, data);
              setModalState(null);
              notifications.show({ message: 'Work item updated', color: 'green' });
              await loadWorkItems();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
