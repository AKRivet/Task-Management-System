import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createTask,
  deleteTask,
  getProject,
  getStatuses,
  getTags,
  getTasks,
  getUsers,
  updateTask,
} from '../api/endpoints';
import type { Project, Status, Tag, TaskItem, TaskPriority, User } from '../types';
import { TASK_PRIORITIES } from '../types';
import { TaskForm } from '../components/TaskForm';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ApiError } from '../api/client';

export function ProjectTasksPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<number | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  const loadStatic = () =>
    Promise.all([getProject(id), getStatuses(), getUsers(), getTags()]).then(([p, s, u, t]) => {
      setProject(p);
      setStatuses(s);
      setUsers(u);
      setTags(t);
    });

  const loadTasks = () =>
    getTasks({
      projectId: id,
      statusId: statusFilter === '' ? undefined : statusFilter,
      priority: priorityFilter === '' ? undefined : priorityFilter,
    }).then(setTasks);

  useEffect(() => {
    Promise.all([loadStatic(), loadTasks()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!loading) loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter]);

  const handleDelete = async (task: TaskItem) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      await loadTasks();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not delete task.');
    }
  };

  if (loading || !project) return <p>Loading…</p>;

  return (
    <div>
      <p>
        <Link to="/">&larr; All projects</Link>
      </p>
      <div className="page-header">
        <div>
          <h1>{project.name}</h1>
          <p className="muted">{project.description || 'No description'}</p>
        </div>
        {!showCreate && <button onClick={() => setShowCreate(true)}>+ New task</button>}
      </div>

      {showCreate && (
        <TaskForm
          statuses={statuses}
          users={users}
          tags={tags}
          onCancel={() => setShowCreate(false)}
          onSubmit={async (data) => {
            await createTask(id, data);
            setShowCreate(false);
            await loadTasks();
          }}
        />
      )}

      <div className="filters">
        <label>
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}>
            <option value="">All</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="task-list">
        {tasks.map((task) =>
          editingId === task.id ? (
            <li key={task.id}>
              <TaskForm
                statuses={statuses}
                users={users}
                tags={tags}
                initial={task}
                onCancel={() => setEditingId(null)}
                onSubmit={async (data) => {
                  await updateTask(task.id, data);
                  setEditingId(null);
                  await loadTasks();
                }}
              />
            </li>
          ) : (
            <li
              key={task.id}
              className="card task-card clickable-card"
              onClick={() => navigate(`/projects/${id}/tasks/${task.id}`)}
            >
              <div className="task-main">
                <span className="task-title">{task.title}</span>
                <div className="badge-row">
                  <StatusBadge name={task.statusName} />
                  <PriorityBadge priority={task.priority} />
                  {task.tags.map((t) => (
                    <span key={t.id} className="badge badge-outline">
                      {t.name}
                    </span>
                  ))}
                </div>
                <p className="muted">
                  {task.assignedUserName ? `Assigned to ${task.assignedUserName}` : 'Unassigned'}
                  {task.dueDate ? ` · Due ${task.dueDate}` : ''}
                </p>
              </div>
              <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                <button className="secondary" onClick={() => setEditingId(task.id)}>
                  Edit
                </button>
                <button className="link-danger" onClick={() => handleDelete(task)}>
                  Delete
                </button>
              </div>
            </li>
          )
        )}
        {tasks.length === 0 && <li className="empty-text">No tasks match — create one above or clear filters.</li>}
      </ul>
    </div>
  );
}
