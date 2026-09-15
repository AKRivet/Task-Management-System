import { Route, Routes } from 'react-router-dom';
import { AppShell, Burger, Group, NavLink as MantineNavLink, Text, Button, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  IconFolders,
  IconUsers,
  IconTags,
  IconLogout,
} from '@tabler/icons-react';

import { useAuth } from './context/AuthContext';
import { RequireAuth } from './components/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectWorkItemsPage } from './pages/ProjectWorkItemsPage';
import { WorkItemDetailPage } from './pages/WorkItemDetailPage';
import { UsersPage } from './pages/UsersPage';
import { TagsPage } from './pages/TagsPage';

const NAV_ITEMS = [
  { to: '/', label: 'Projects', icon: IconFolders, end: true },
  { to: '/users', label: 'People', icon: IconUsers, end: false },
  { to: '/tags', label: 'Tags', icon: IconTags, end: false },
];

function Shell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700}>Task Management System</Text>
          </Group>
          <Group>
            {user && (
              <>
                <Text size="sm">{user.name}</Text>
                <Badge color={user.role === 'Admin' ? 'grape' : 'gray'} variant="light">
                  {user.role}
                </Badge>
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconLogout size={16} />}
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  Log out
                </Button>
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {NAV_ITEMS.map((item) => (
          <MantineNavLink
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            label={item.label}
            leftSection={<item.icon size={18} />}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Shell>
              <Routes>
                <Route path="/" element={<ProjectsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/projects/:projectId" element={<ProjectWorkItemsPage />} />
                <Route path="/projects/:projectId/workitems/:workItemId" element={<WorkItemDetailPage />} />
              </Routes>
            </Shell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
