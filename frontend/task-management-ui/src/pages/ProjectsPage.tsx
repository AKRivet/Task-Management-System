import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Group,
  Modal,
  Pagination,
  Select,
  SimpleGrid,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { createProject, deleteProject, getProjects, getUsers, updateProject } from '../api/endpoints';
import type { ProjectQuery } from '../api/endpoints';
import type { Project, User } from '../types';
import { ProjectForm } from '../components/ProjectForm';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 9;

export function ProjectsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<'create' | Project | null>(null);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<ProjectQuery['sortBy']>('name');
  const [sortDir, setSortDir] = useState<ProjectQuery['sortDir']>('asc');
  const [page, setPage] = useState(1);

  const load = () =>
    getProjects({ search: search || undefined, sortBy, sortDir, page, pageSize: PAGE_SIZE }).then((res) => {
      setProjects(res.items);
      setTotalCount(res.totalCount);
    });

  useEffect(() => {
    Promise.all([load(), getUsers().then(setUsers)]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy, sortDir, page]);

  const handleDelete = (project: Project) => {
    modals.openConfirmModal({
      title: 'Delete project',
      children: <Text size="sm">Delete "{project.name}"? This also deletes all of its work items.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteProject(project.id);
          notifications.show({ message: `Deleted "${project.name}"`, color: 'green' });
          await load();
        } catch (err) {
          notifications.show({
            title: 'Could not delete project',
            message: err instanceof ApiError ? err.message : 'Something went wrong.',
            color: 'red',
          });
        }
      },
    });
  };

  if (loading) return <Text>Loading…</Text>;

  if (users.length === 0) {
    return (
      <div>
        <Title mb="sm">Projects</Title>
        <Text c="dimmed">Add at least one person on the People page first — projects need at least one member.</Text>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title>Projects</Title>
        {isAdmin && <Button onClick={() => setModalState('create')}>+ New project</Button>}
      </Group>

      <Group mb="md">
        <TextInput
          placeholder="Search projects…"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
          w={260}
        />
        <Select
          data={[
            { value: 'name', label: 'Name' },
            { value: 'createdAt', label: 'Created date' },
            { value: 'workItemCount', label: 'Work item count' },
          ]}
          value={sortBy}
          onChange={(v) => setSortBy((v as ProjectQuery['sortBy']) ?? 'name')}
          w={170}
        />
        <Select
          data={[
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' },
          ]}
          value={sortDir}
          onChange={(v) => setSortDir((v as ProjectQuery['sortDir']) ?? 'asc')}
          w={140}
        />
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {projects.map((project) => (
          <Card
            key={project.id}
            withBorder
            radius="md"
            padding="md"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <Text fw={700}>{project.name}</Text>
            <Text c="dimmed" size="sm" lineClamp={2}>
              {project.description || 'No description'}
            </Text>
            <Text size="xs" c="dimmed" mt="xs" lineClamp={1}>
              {project.members.map((m) => m.name).join(', ')} · {project.workItemCount} work item
              {project.workItemCount === 1 ? '' : 's'}
            </Text>
            <Group justify="flex-end" mt="sm" onClick={(e) => e.stopPropagation()}>
              <Button variant="default" size="xs" onClick={() => setModalState(project)}>
                Edit
              </Button>
              {isAdmin && (
                <Button variant="light" color="red" size="xs" onClick={() => handleDelete(project)}>
                  Delete
                </Button>
              )}
            </Group>
          </Card>
        ))}
        {projects.length === 0 && <Text c="dimmed">No projects match — create one above.</Text>}
      </SimpleGrid>

      {totalPages > 1 && (
        <Group justify="center" mt="lg">
          <Pagination value={page} onChange={setPage} total={totalPages} />
        </Group>
      )}

      <Modal
        opened={modalState !== null}
        onClose={() => setModalState(null)}
        title={modalState === 'create' ? 'New project' : modalState ? 'Edit project' : undefined}
      >
        {modalState === 'create' && (
          <ProjectForm
            users={users}
            onCancel={() => setModalState(null)}
            onSubmit={async (data) => {
              await createProject(data);
              setModalState(null);
              notifications.show({ message: 'Project created', color: 'green' });
              await load();
            }}
          />
        )}
        {modalState !== null && modalState !== 'create' && (
          <ProjectForm
            users={users}
            initial={modalState}
            onCancel={() => setModalState(null)}
            onSubmit={async (data) => {
              await updateProject(modalState.id, data);
              setModalState(null);
              notifications.show({ message: 'Project updated', color: 'green' });
              await load();
            }}
          />
        )}
      </Modal>
    </div>
  );
}
