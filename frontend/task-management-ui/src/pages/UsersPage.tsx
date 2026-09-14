import { useEffect, useState, type FormEvent } from 'react';
import { createUser, deleteUser, getUsers } from '../api/endpoints';
import type { User } from '../types';
import { ApiError } from '../api/client';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => getUsers().then(setUsers);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await createUser({ name, email });
      setName('');
      setEmail('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create user.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user? Their projects/tasks must not reference them.')) return;
    try {
      await deleteUser(id);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not delete user.');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1>People</h1>
      <p className="page-subtitle">
        This is a single-user system with no login — "people" here are just the names you can assign as a project
        owner or a task's assignee.
      </p>

      <form className="card form form-row" onSubmit={handleCreate}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
        </label>
        <button type="submit">Add person</button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <ul className="simple-list">
        {users.map((u) => (
          <li key={u.id}>
            <span>
              {u.name} <span className="muted">({u.email})</span>
            </span>
            <button className="link-danger" onClick={() => handleDelete(u.id)}>
              Delete
            </button>
          </li>
        ))}
        {users.length === 0 && <li className="empty-text">No people yet — add one above.</li>}
      </ul>
    </div>
  );
}
