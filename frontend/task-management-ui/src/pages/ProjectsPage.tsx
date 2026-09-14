import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteProject, getProjects, getUsers, createProject, updateProject } from '../api/endpoints';
import type { Project, User } from '../types';
import { ProjectForm } from '../components/ProjectForm';
import { ApiError } from '../api/client';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = () => Promise.all([getProjects(), getUsers()]).then(([p, u]) => {
    setProjects(p);
    setUsers(u);
  });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete project "${project.name}"? This also deletes all of its tasks.`)) return;
    try {
      await deleteProject(project.id);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not delete project.');
    }
  };

  if (loading) return <p>Loading…</p>;

  if (users.length === 0) {
    return (
      <div>
        <h1>Projects</h1>
        <p className="empty-text">
          Add at least one person on the <Link to="/users">People</Link> page first — projects need an owner.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Projects</h1>
        {!showCreate && <button onClick={() => setShowCreate(true)}>+ New project</button>}
      </div>

      {showCreate && (
        <ProjectForm
          users={users}
          onCancel={() => setShowCreate(false)}
          onSubmit={async (data) => {
            await createProject(data);
            setShowCreate(false);
            await load();
          }}
        />
      )}

      <ul className="project-list">
        {projects.map((project) =>
          editingId === project.id ? (
            <li key={project.id}>
              <ProjectForm
                users={users}
                initial={project}
                onCancel={() => setEditingId(null)}
                onSubmit={async (data) => {
                  await updateProject(project.id, { name: data.name, description: data.description });
                  setEditingId(null);
                  await load();
                }}
              />
            </li>
          ) : (
            <li
              key={project.id}
              className="card project-card clickable-card"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div>
                <span className="project-title">{project.name}</span>
                <p className="muted">{project.description || 'No description'}</p>
                <p className="muted">
                  Owned by {project.ownerName} · {project.taskCount} task{project.taskCount === 1 ? '' : 's'}
                </p>
              </div>
              <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                <button className="secondary" onClick={() => setEditingId(project.id)}>
                  Edit
                </button>
                <button className="link-danger" onClick={() => handleDelete(project)}>
                  Delete
                </button>
              </div>
            </li>
          )
        )}
        {projects.length === 0 && <li className="empty-text">No projects yet — create one above.</li>}
      </ul>
    </div>
  );
}
