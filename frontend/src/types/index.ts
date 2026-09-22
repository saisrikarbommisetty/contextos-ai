export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assigneeId?: string | null;
  assignee?: User | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  type: string;
  url?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  date: string;
  participants: string;
  createdAt: string;
}

export interface Decision {
  id: string;
  projectId: string;
  title: string;
  description: string;
  madeBy: string;
  date: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  type: string;
  title: string;
  description?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  timestamp: string;
  actorId?: string | null;
  project?: {
    id: string;
    name: string;
  };
}

export interface ProjectCardData {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  lastActiveAt: string;
  openItemsCount: number;
  blockedItemsCount: number;
  contextHealthScore: number;
  lastActivity?: Activity | null;
  lastDecision?: Decision | null;
  hasPreviousSession: boolean;
}

export interface DashboardData {
  userProjects: ProjectCardData[];
  latestProjectToResume: ProjectCardData | null;
  recentActivities: Activity[];
  recentDecisions: (Decision & { project?: { id: string; name: string } })[];
  stats: {
    activeProjectsCount: number;
    openLoopsCount: number;
    completedTasksCount: number;
    activeTasksCount: number;
    contextRecoveredCount: number;
  };
}

export interface FullProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  ownerId: string;
  owner: User;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  documents: Document[];
  meetings: Meeting[];
  decisions: Decision[];
  activities: Activity[];
}

export interface OpenLoop {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  relatedEntity?: string;
  description?: string;
}

export interface RecentChange {
  id: string;
  category: 'TASK' | 'DECISION' | 'SCHEMA' | 'DOC' | 'DEPLOYMENT';
  title: string;
  description: string;
  timeAgo: string;
  timestamp: string;
}

export interface ResumeBriefing {
  projectId: string;
  projectName: string;
  reconstructedAt: string;
  projectState: string;
  lastWorkingPoint: string;
  completedItems: Array<{
    id: string;
    title: string;
    completedAt?: string;
  }>;
  importantDecisions: Array<{
    id: string;
    title: string;
    description: string;
    madeBy: string;
    date: string;
  }>;
  recentChanges: RecentChange[];
  openLoops: OpenLoop[];
  relevantEntities: Array<{
    id: string;
    type: 'TASK' | 'DOCUMENT' | 'MEETING' | 'DECISION';
    title: string;
    snippet: string;
    url?: string | null;
  }>;
  recommendedContinuation: {
    actionTitle: string;
    reasoning: string;
    primaryTaskId?: string;
    suggestedSteps: string[];
  };
  contextHealth: {
    score: number;
    status: string;
    summary: string;
  };
  aiSource?: 'gemini' | 'openai' | 'fallback';
}

export interface ProjectContextBrief {
  projectId: string;
  projectName: string;
  generatedAt: string;
  projectOverview: string;
  currentState: string;
  importantDecisions: Array<{
    title: string;
    description: string;
    madeBy: string;
    date: string;
  }>;
  majorMilestones: Array<{
    title: string;
    status: string;
  }>;
  currentBlockers: Array<{
    title: string;
    priority: string;
    resolution: string;
  }>;
  recentChanges: Array<{
    title: string;
    time: string;
  }>;
  keyPeople: Array<{
    name: string;
    role: string;
  }>;
  relevantDocuments: Array<{
    title: string;
    type: string;
  }>;
  recommendedStartingPoint: string;
  aiSource?: 'gemini' | 'openai' | 'fallback';
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'PROJECT' | 'TASK' | 'DOCUMENT' | 'MEETING' | 'DECISION' | 'PERSON' | 'ACTIVITY';
  status?: string;
  priority?: string;
  subtitle?: string;
  details?: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface ContextGraphData {
  projectId: string;
  projectName: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
