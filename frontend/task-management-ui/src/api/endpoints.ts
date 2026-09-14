import { api } from './client';
import type { Comment, Project, Status, Tag, TaskItem, TaskPriority, User } from '../types';

// Users
export const getUsers = () => api.get<User[]>('/users');
export const createUser = (data: { name: string; email: string }) => api.post<User>('/users', data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);

// Projects
export const getProjects = () => api.get<Project[]>('/projects');
export const getProject = (id: number) => api.get<Project>(`/projects/${id}`);
export const createProject = (data: { name: string; description: string | null; ownerUserId: number }) =>
  api.post<Project>('/projects', data);
export const updateProject = (id: number, data: { name: string; description: string | null }) =>
  api.put<Project>(`/projects/${id}`, data);
export const deleteProject = (id: number) => api.delete(`/projects/${id}`);

// Statuses (fixed lookup list, seeded by the backend migration)
export const getStatuses = () => api.get<Status[]>('/statuses');

// Tags
export const getTags = () => api.get<Tag[]>('/tags');
export const createTag = (name: string) => api.post<Tag>('/tags', { name });

// Tasks
export interface TaskFilters {
  projectId?: number;
  statusId?: number;
  priority?: TaskPriority;
}

function buildTaskQuery(filters: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters.projectId != null) params.set('projectId', String(filters.projectId));
  if (filters.statusId != null) params.set('statusId', String(filters.statusId));
  if (filters.priority) params.set('priority', filters.priority);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const getTasks = (filters: TaskFilters = {}) => api.get<TaskItem[]>(`/tasks${buildTaskQuery(filters)}`);
export const getTask = (id: number) => api.get<TaskItem>(`/tasks/${id}`);

export interface TaskInput {
  title: string;
  description: string | null;
  assignedUserId: number | null;
  statusId: number;
  priority: TaskPriority;
  dueDate: string | null;
  tagIds: number[];
}

export const createTask = (projectId: number, data: TaskInput) => api.post<TaskItem>('/tasks', { ...data, projectId });
export const updateTask = (id: number, data: TaskInput) => api.put<TaskItem>(`/tasks/${id}`, data);
export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);

// Comments
export const getComments = (taskId: number) => api.get<Comment[]>(`/tasks/${taskId}/comments`);
export const createComment = (taskId: number, data: { userId: number; body: string }) =>
  api.post<Comment>(`/tasks/${taskId}/comments`, data);
