import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ContextPackage {
  projectId: string;
  projectName: string;
  projectDescription: string;
  projectStatus: string;
  progress: number;
  lastSession: {
    startedAt: Date;
    endedAt: Date | null;
    lastViewedEntity: string | null;
  } | null;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    timestamp: Date;
    actorName?: string;
  }>;
  completedTasks: Array<{
    id: string;
    title: string;
    description: string | null;
    completedAt: Date;
  }>;
  openTasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: Date | null;
  }>;
  importantDecisions: Array<{
    id: string;
    title: string;
    description: string;
    madeBy: string;
    date: Date;
  }>;
  relevantDocuments: Array<{
    id: string;
    title: string;
    description: string | null;
    type: string;
    url: string | null;
  }>;
  recentMeetings: Array<{
    id: string;
    title: string;
    summary: string;
    date: Date;
    participants: string;
  }>;
  recentChanges: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: Date;
  }>;
  openLoops: Array<{
    id: string;
    title: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: string;
    relatedEntity?: string;
    description?: string;
  }>;
  contextHealth: {
    score: number; // 0 - 100
    status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION';
    summary: string;
    breakdown: {
      activityScore: number;
      decisionScore: number;
      taskClarityScore: number;
      documentationScore: number;
    };
  };
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
  recentChanges: Array<{
    id: string;
    category: 'TASK' | 'DECISION' | 'SCHEMA' | 'DOC' | 'DEPLOYMENT';
    title: string;
    description: string;
    timeAgo: string;
    timestamp: string;
  }>;
  openLoops: Array<{
    id: string;
    title: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: string;
    relatedEntity?: string;
    description?: string;
  }>;
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
