import { useState, type FormEvent } from 'react';
import type { Project, User } from '../types';

interface ProjectFormProps {
  users: User[];
  initial?: Project;
  onCancel: () => void;
  onSubmit: (data: { name: string; description: string | null; ownerUserId: number }) => Promise<void>;
}

export function ProjectForm({ users, initial, onCancel, onSubmit }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [ownerUserId, setOwnerUserId] = useState(initial?.ownerUserId ?? users[0]?.id ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name, description: description || null, ownerUserId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={150} />
      </label>
      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </label>
      {!initial && (
        <label>
          Owner
          <select value={ownerUserId} onChange={(e) => setOwnerUserId(Number(e.target.value))} required>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {error && <p className="error-text">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Create project'}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
