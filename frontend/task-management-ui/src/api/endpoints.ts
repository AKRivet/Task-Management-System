import { api } from './client';
import type {
  Comment,
  PagedResult,
  Project,
  Status,
  Tag,
  User,
  WorkItem,
  WorkItemPriority,
  WorkItemType,
} from '../types';

// Users
export const getUsers = () => api.get<User[]>('/users');
export const updateUser = (id: number, data: { name: string; email: string }) => api.put<User>(`/users/${id}`, data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);

// Projects
export interface ProjectQuery {
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'workItemCount';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

function buildQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const getProjects = (query: ProjectQuery = {}) =>
  api.get<PagedResult<Project>>(`/projects${buildQuery(query)}`);
export const getProject = (id: number) => api.get<Project>(`/projects/${id}`);
export interface ProjectInput {
  name: string;
  description: string | null;
  memberUserIds: number[];
}

export const createProject = (data: ProjectInput) => api.post<Project>('/projects', data);
export const updateProject = (id: number, data: ProjectInput) => api.put<Project>(`/projects/${id}`, data);
export const deleteProject = (id: number) => api.delete(`/projects/${id}`);

// Statuses (fixed lookup list, seeded by the backend migration)
export const getStatuses = () => api.get<Status[]>('/statuses');

// Tags
export const getTags = () => api.get<Tag[]>('/tags');
export const createTag = (name: string) => api.post<Tag>('/tags', { name });
export const deleteTag = (id: number) => api.delete(`/tags/${id}`);

// Work items
export interface WorkItemFilters {
  projectId?: number;
  statusId?: number;
  priority?: WorkItemPriority;
  type?: WorkItemType;
  parentWorkItemId?: number;
  topLevelOnly?: boolean;
  search?: string;
}

export const getWorkItems = (filters: WorkItemFilters = {}) =>
  api.get<WorkItem[]>(`/workitems${buildQuery(filters)}`);
export const getWorkItem = (id: number) => api.get<WorkItem>(`/workitems/${id}`);

export interface WorkItemInput {
  title: string;
  description: string | null;
  type: WorkItemType;
  assignedUserId: number | null;
  statusId: number;
  priority: WorkItemPriority;
  parentWorkItemId: number | null;
  dueDate: string | null;
  tagIds: number[];
}

export const createWorkItem = (projectId: number, data: WorkItemInput) =>
  api.post<WorkItem>('/workitems', { ...data, projectId });
export const updateWorkItem = (id: number, data: WorkItemInput) => api.put<WorkItem>(`/workitems/${id}`, data);
export const deleteWorkItem = (id: number) => api.delete(`/workitems/${id}`);

// Comments
export const getComments = (workItemId: number) => api.get<Comment[]>(`/workitems/${workItemId}/comments`);
export const createComment = (workItemId: number, data: { userId: number; body: string }) =>
  api.post<Comment>(`/workitems/${workItemId}/comments`, data);
