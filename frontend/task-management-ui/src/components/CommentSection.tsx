import { useState, type FormEvent } from 'react';
import type { Comment, User } from '../types';

interface CommentSectionProps {
  comments: Comment[];
  users: User[];
  onAdd: (data: { userId: number; body: string }) => Promise<void>;
}

export function CommentSection({ comments, users, onAdd }: CommentSectionProps) {
  const [userId, setUserId] = useState(users[0]?.id ?? 0);
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onAdd({ userId, body });
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h3>Comments</h3>
      {comments.length === 0 && <p className="empty-text">No comments yet.</p>}
      <ul className="comment-list">
        {comments.map((c) => (
          <li key={c.id} className="comment">
            <div className="comment-meta">
              <strong>{c.userName}</strong>
              <span>{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <p>{c.body}</p>
          </li>
        ))}
      </ul>
      <form className="comment-form" onSubmit={handleSubmit}>
        <select value={userId} onChange={(e) => setUserId(Number(e.target.value))}>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          maxLength={2000}
        />
        <button type="submit" disabled={saving}>
          {saving ? 'Posting…' : 'Post'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
