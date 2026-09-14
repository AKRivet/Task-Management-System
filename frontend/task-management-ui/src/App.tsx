import { NavLink, Route, Routes } from 'react-router-dom';
import './App.css';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectTasksPage } from './pages/ProjectTasksPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { UsersPage } from './pages/UsersPage';
import { TagsPage } from './pages/TagsPage';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">Task Management System</span>
        <nav>
          <NavLink to="/" end>
            Projects
          </NavLink>
          <NavLink to="/users">People</NavLink>
          <NavLink to="/tags">Tags</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<ProjectsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/projects/:projectId" element={<ProjectTasksPage />} />
          <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
