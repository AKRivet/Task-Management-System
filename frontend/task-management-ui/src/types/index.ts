export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  ownerUserId: number;
  ownerName: string;
  createdAt: string;
  taskCount: number;
}

export interface Status {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string | null;
  projectId: number;
  assignedUserId: number | null;
  assignedUserName: string | null;
  statusId: number;
  statusName: string;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  userName: string;
  body: string;
  createdAt: string;
}
