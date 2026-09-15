export type WorkItemPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export const WORK_ITEM_PRIORITIES: WorkItemPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export type WorkItemType = 'Feature' | 'Story' | 'Task' | 'Bug';
export const WORK_ITEM_TYPES: WorkItemType[] = ['Feature', 'Story', 'Task', 'Bug'];

export type UserRole = 'Member' | 'Admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ProjectMember {
  id: number;
  name: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  members: ProjectMember[];
  createdAt: string;
  workItemCount: number;
}

export interface Status {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface WorkItem {
  id: number;
  title: string;
  description: string | null;
  type: WorkItemType;
  projectId: number;
  assignedUserId: number | null;
  assignedUserName: string | null;
  statusId: number;
  statusName: string;
  priority: WorkItemPriority;
  parentWorkItemId: number | null;
  parentTitle: string | null;
  childCount: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface Comment {
  id: number;
  workItemId: number;
  userId: number;
  userName: string;
  body: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
