import { useEffect, useState, type FormEvent } from 'react';
import { createTag, getTags } from '../api/endpoints';
import type { Tag } from '../types';
import { ApiError } from '../api/client';

export function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => getTags().then(setTags);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createTag(name);
      setName('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create tag.');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1>Tags</h1>
      <p className="page-subtitle">Free-form labels you can attach to tasks, e.g. "urgent" or "bug".</p>

      <form className="card form form-row" onSubmit={handleCreate}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} />
        </label>
        <button type="submit">Add tag</button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <div className="badge-row">
        {tags.map((t) => (
          <span key={t.id} className="badge badge-outline">
            {t.name}
          </span>
        ))}
        {tags.length === 0 && <p className="empty-text">No tags yet — add one above.</p>}
      </div>
    </div>
  );
}
