
import { Document, User, UserRole, DocVersion, Project, Task, TaskStatus, TaskPriority } from '../types';

const DOCS_KEY = 'wikiflow_docs';
const CURRENT_USER_KEY = 'wikiflow_user';
const PROJECTS_KEY = 'wikiflow_projects';

const MOCK_USERS: User[] = [
  { id: 'u1', name: '王大明 (Admin)', email: 'admin@company.com', role: UserRole.ADMIN, avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff' },
  { id: 'u2', name: '李小美 (Editor)', email: 'editor@company.com', role: UserRole.EDITOR, avatar: 'https://ui-avatars.com/api/?name=Editor+User&background=10b981&color=fff' },
  { id: 'u3', name: '張志豪 (Viewer)', email: 'viewer@company.com', role: UserRole.VIEWER, avatar: 'https://ui-avatars.com/api/?name=Viewer+User&background=64748b&color=fff' },
];

// Mock Initial Data - Docs
const INITIAL_DOCS: Document[] = [
  {
    id: '1',
    title: '員工入職指南',
    content: '# 歡迎加入我們\n\n## 報到流程\n1. 領取識別證\n2. 設定電腦帳號\n3. 填寫保險資料\n\n## 常用工具\n- Slack: 溝通\n- Jira: 專案管理\n\n請務必在第一週完成所有設定。',
    tags: ['HR', 'Onboarding', 'SOP'],
    category: 'Human Resources',
    createdBy: 'Admin User',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    accessLevel: UserRole.VIEWER,
    history: []
  },
  {
    id: '2',
    title: '2025 年度產品 roadmap',
    content: '# 2025 產品規劃\n\n## Q1 重點\n- 完成 AI 模組整合\n- 優化行動版介面\n\n## Q2 重點\n- 拓展海外市場支付金流\n- 新增多語言支援',
    tags: ['Product', 'Strategy', '2025'],
    category: 'Product',
    createdBy: 'Alice Product',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
    accessLevel: UserRole.EDITOR,
    history: []
  }
];

// Mock Initial Data - Projects
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Q1 網站改版計畫',
    description: '針對公司官網進行效能優化與視覺更新，目標提升 20% 轉換率。',
    status: 'ACTIVE',
    members: ['u1', 'u2'],
    createdBy: '王大明 (Admin)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [
      {
        id: 't1',
        title: '設計首頁視覺 Mockup',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        assigneeId: 'u2',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 't2',
        title: '開發前端切版',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assigneeId: 'u3',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 't3',
        title: '撰寫文案內容',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeId: 'u1',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'p2',
    name: '內部資安稽核',
    description: '每半年度的例行性資安檢查與權限盤點。',
    status: 'ACTIVE',
    members: ['u1'],
    createdBy: '王大明 (Admin)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [
      {
        id: 't4',
        title: '匯出 Log 報表',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        assigneeId: 'u1',
        createdAt: new Date().toISOString()
      }
    ]
  }
];

// --- Documents Helper ---
export const getDocuments = (): Document[] => {
  const data = localStorage.getItem(DOCS_KEY);
  if (!data) {
    localStorage.setItem(DOCS_KEY, JSON.stringify(INITIAL_DOCS));
    return INITIAL_DOCS;
  }
  return JSON.parse(data);
};

export const saveDocument = (doc: Document, user: User): Document => {
  const docs = getDocuments();
  const existingIndex = docs.findIndex(d => d.id === doc.id);

  if (existingIndex >= 0) {
    const oldDoc = docs[existingIndex];
    const newVersion: DocVersion = {
      versionId: Date.now().toString(),
      content: oldDoc.content,
      updatedAt: oldDoc.updatedAt,
      updatedBy: oldDoc.createdBy
    };
    const updatedDoc: Document = {
      ...doc,
      updatedAt: new Date().toISOString(),
      history: [newVersion, ...oldDoc.history]
    };
    docs[existingIndex] = updatedDoc;
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
    return updatedDoc;
  } else {
    const newDoc: Document = {
      ...doc,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.name,
      history: []
    };
    docs.unshift(newDoc);
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
    return newDoc;
  }
};

export const deleteDocument = (id: string) => {
  const docs = getDocuments().filter(d => d.id !== id);
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
};

// --- Projects Helper ---
export const getProjects = (): Project[] => {
  const data = localStorage.getItem(PROJECTS_KEY);
  if (!data) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS;
  }
  return JSON.parse(data);
};

export const saveProject = (project: Project): Project => {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  
  if (idx >= 0) {
    projects[idx] = { ...project, updatedAt: new Date().toISOString() };
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return projects[idx];
  } else {
    const newProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projects.unshift(newProject);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return newProject;
  }
};

// --- User Helper ---
export const getCurrentUser = (): User => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (stored) return JSON.parse(stored);
  return MOCK_USERS[0];
};

export const setCurrentUserMock = (userId: string): User => {
  const user = MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const getAvailableUsers = () => MOCK_USERS;
