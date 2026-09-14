import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createComment,
  deleteTask,
  getComments,
  getStatuses,
  getTags,
  getTask,
  getUsers,
  updateTask,
} from '../api/endpoints';
import type { Comment, Status, Tag, TaskItem, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TaskForm } from '../components/TaskForm';
import { CommentSection } from '../components/CommentSection';

export function TaskDetailPage() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const navigate = useNavigate();
  const id = Number(taskId);

  const [task, setTask] = useState<TaskItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () =>
    Promise.all([getTask(id), getComments(id), getStatuses(), getUsers(), getTags()]).then(
      ([t, c, s, u, tg]) => {
        setTask(t);
        setComments(c);
        setStatuses(s);
        setUsers(u);
        setTags(tg);
      }
    );

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !task) return <p>Loading…</p>;

  return (
    <div>
      <p>
        <Link to={`/projects/${projectId}`}>&larr; Back to project</Link>
      </p>

      {editing ? (
        <TaskForm
          statuses={statuses}
          users={users}
          tags={tags}
          initial={task}
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            await updateTask(id, data);
            setEditing(false);
            await load();
          }}
        />
      ) : (
        <div className="card">
          <div className="page-header">
            <h1>{task.title}</h1>
            <div className="row-actions">
              <button className="secondary" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button
                className="link-danger"
                onClick={async () => {
                  if (!confirm(`Delete task "${task.title}"?`)) return;
                  await deleteTask(id);
                  navigate(`/projects/${projectId}`);
                }}
              >
                Delete
              </button>
            </div>
          </div>
          <p>{task.description || 'No description'}</p>
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
      )}

      <CommentSection
        comments={comments}
        users={users}
        onAdd={async (data) => {
          await createComment(id, data);
          await load();
        }}
      />
    </div>
  );
}
