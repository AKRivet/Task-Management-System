import { useState, type FormEvent } from 'react';
import { TASK_PRIORITIES, type Status, type Tag, type TaskItem, type TaskPriority, type User } from '../types';
import type { TaskInput } from '../api/endpoints';

interface TaskFormProps {
  statuses: Status[];
  users: User[];
  tags: Tag[];
  initial?: TaskItem;
  onCancel: () => void;
  onSubmit: (data: TaskInput) => Promise<void>;
}

export function TaskForm({ statuses, users, tags, initial, onCancel, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [statusId, setStatusId] = useState(initial?.statusId ?? statuses[0]?.id ?? 0);
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'Medium');
  const [assignedUserId, setAssignedUserId] = useState<number | ''>(initial?.assignedUserId ?? '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [tagIds, setTagIds] = useState<number[]>(initial?.tags.map((t) => t.id) ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (id: number) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title,
        description: description || null,
        statusId,
        priority,
        assignedUserId: assignedUserId === '' ? null : assignedUserId,
        dueDate: dueDate || null,
        tagIds,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
      </label>
      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </label>
      <div className="form-row">
        <label>
          Status
          <select value={statusId} onChange={(e) => setStatusId(Number(e.target.value))} required>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} required>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>
          Assignee
          <select
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Due date
          <input type="date" value={dueDate ?? ''} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>
      {tags.length > 0 && (
        <div>
          <span className="field-label">Tags</span>
          <div className="tag-picker">
            {tags.map((tag) => (
              <label key={tag.id} className="tag-checkbox">
                <input type="checkbox" checked={tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
      )}
      {error && <p className="error-text">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create task'}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
