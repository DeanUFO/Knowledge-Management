
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface DocVersion {
  versionId: string;
  content: string;
  updatedAt: string; // ISO Date string
  updatedBy: string; // User Name
  changeSummary?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // MIME type
  size: number;
  data: string; // Base64 string
  uploadedAt: string;
}

export interface Document {
  id: string;
  title: string;
  content: string; // Current content (Markdown)
  tags: string[];
  category: string;
  createdBy: string; // User Name
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  history: DocVersion[];
  accessLevel: UserRole; // Minimum role required to edit
  attachments?: Attachment[];
}

export interface SearchResult {
  doc: Document;
  score?: number;
}

// --- Project Management Types ---

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string; // User ID
  dueDate?: string; // ISO Date string
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  members: string[]; // User IDs
  tasks: Task[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}