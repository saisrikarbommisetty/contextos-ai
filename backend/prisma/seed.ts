import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ContextOS database seeding...');

  // Clean existing records
  await prisma.activity.deleteMany({});
  await prisma.projectSession.deleteMany({});
  await prisma.decision.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('contextos123', 10);

  // 1. Create Users
  const demoUser = await prisma.user.create({
    data: {
      id: 'user-demo-01',
      name: 'Sai Krishna',
      email: 'demo@contextos.ai',
      passwordHash,
      role: 'Lead Full-Stack Engineer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teamMember1 = await prisma.user.create({
    data: {
      id: 'user-team-02',
      name: 'Priya Sharma',
      email: 'priya@contextos.ai',
      passwordHash,
      role: 'Backend Architect',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const teamMember2 = await prisma.user.create({
    data: {
      id: 'user-team-03',
      name: 'Alex Rivera',
      email: 'alex@contextos.ai',
      passwordHash,
      role: 'Frontend Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  // ==========================================
  // PROJECT 1: CampusConnect (Hero Demo Scenario)
  // ==========================================
  const campusConnect = await prisma.project.create({
    data: {
      id: 'proj-campus-connect-01',
      name: 'CampusConnect',
      description: 'Digital platform for improving student-college communication, department announcements, and academic collaboration.',
      status: 'In Progress',
      progress: 68,
      ownerId: demoUser.id,
      lastActiveAt: twoDaysAgo,
      createdAt: fiveDaysAgo,
    },
  });

  // Tasks for CampusConnect
  const task1 = await prisma.task.create({
    data: {
      id: 'task-cc-01',
      projectId: campusConnect.id,
      title: 'Implement Supabase Auth & JWT session management',
      description: 'Configure email/password signup, password reset tokens, and secure JWT verification on server middleware.',
      status: 'COMPLETED',
      priority: 'HIGH',
      assigneeId: demoUser.id,
      dueDate: threeDaysAgo,
      createdAt: fiveDaysAgo,
      updatedAt: twoDaysAgo,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      id: 'task-cc-02',
      projectId: campusConnect.id,
      title: 'Design responsive dashboard and navigation shell',
      description: 'Build sidebar layout, breadcrumbs navigation, and mobile-ready header drawer with Lucide icons.',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      assigneeId: teamMember2.id,
      dueDate: threeDaysAgo,
      createdAt: fiveDaysAgo,
      updatedAt: threeDaysAgo,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      id: 'task-cc-03',
      projectId: campusConnect.id,
      title: 'Integrate Student Profile API and resolve schema mismatch',
      description: 'The backend changed the profile response payload from flat properties to a nested object { profile: { identity, academic } }. Frontend ProfileService must be updated to avoid 400 errors.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      assigneeId: demoUser.id,
      dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      createdAt: threeDaysAgo,
      updatedAt: yesterday,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      id: 'task-cc-04',
      projectId: campusConnect.id,
      title: 'Fix Staging deployment environment configuration',
      description: 'Staging cluster deployment is failing because NEXT_PUBLIC_SUPABASE_ANON_KEY was not provisioned during secrets rotation.',
      status: 'BLOCKED',
      priority: 'HIGH',
      assigneeId: teamMember1.id,
      dueDate: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      createdAt: yesterday,
      updatedAt: twoHoursAgo,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      id: 'task-cc-05',
      projectId: campusConnect.id,
      title: 'Setup push notifications for campus emergency bulletins',
      description: 'Integrate Web Push API and background service workers for high-priority department alerts.',
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeId: demoUser.id,
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
    },
  });

  // Documents for CampusConnect
  await prisma.document.createMany({
    data: [
      {
        id: 'doc-cc-01',
        projectId: campusConnect.id,
        title: 'CampusConnect Architecture RFC & Supabase Decision',
        description: 'Comprehensive system architecture breakdown detailing why Supabase was selected for Postgres DB, row-level security, and Auth.',
        type: 'ARCHITECTURE',
        url: 'https://docs.contextos.internal/campusconnect/architecture-rfc',
        createdAt: fourDaysAgo,
        updatedAt: fourDaysAgo,
      },
      {
        id: 'doc-cc-02',
        projectId: campusConnect.id,
        title: 'v2.1 REST API Documentation & Profile Schema Migration Guide',
        description: 'Updated endpoints specifications highlighting the recent JSON payload changes for user identity and academic profiles.',
        type: 'API_SPEC',
        url: 'https://docs.contextos.internal/campusconnect/api-v2-1',
        createdAt: twoDaysAgo,
        updatedAt: yesterday,
      },
      {
        id: 'doc-cc-03',
        projectId: campusConnect.id,
        title: 'Deployment & CI/CD Pipeline Playbook',
        description: 'Step-by-step instructions for staging rollout, Docker build targets, and required environment variables.',
        type: 'GUIDE',
        url: 'https://docs.contextos.internal/campusconnect/deployment-playbook',
        createdAt: threeDaysAgo,
        updatedAt: twoHoursAgo,
      },
    ],
  });

  // Decisions for CampusConnect
  await prisma.decision.createMany({
    data: [
      {
        id: 'dec-cc-01',
        projectId: campusConnect.id,
        title: 'Use Supabase for authentication and database services',
        description: 'Evaluated Firebase vs Supabase vs custom Auth0. Selected Supabase due to built-in PostgreSQL relational schema, Row Level Security (RLS), and zero cold-start latency.',
        madeBy: 'Project Team (Sai Krishna, Priya Sharma)',
        date: fourDaysAgo,
        createdAt: fourDaysAgo,
      },
      {
        id: 'dec-cc-02',
        projectId: campusConnect.id,
        title: 'Migrate Profile API payload to nested entity model',
        description: 'Decided to encapsulate student demographic data under { identity } and department/semester metadata under { academic } to support future multi-campus expansions.',
        madeBy: 'Priya Sharma (Backend Lead)',
        date: twoDaysAgo,
        createdAt: twoDaysAgo,
      },
      {
        id: 'dec-cc-03',
        projectId: campusConnect.id,
        title: 'Mandate strict TypeScript interfaces for all frontend API contracts',
        description: 'Enforce type safety across all React components to eliminate runtime undefined property errors during payload updates.',
        madeBy: 'Sai Krishna (Lead Engineer)',
        date: threeDaysAgo,
        createdAt: threeDaysAgo,
      },
    ],
  });

  // Meetings for CampusConnect
  await prisma.meeting.createMany({
    data: [
      {
        id: 'meet-cc-01',
        projectId: campusConnect.id,
        title: 'Sprint 14 Sync: Auth Completion & Profile API Handoff',
        summary: 'Sai demonstrated functional authentication flow. Priya announced the v2.1 profile schema changes. Sai agreed to update the frontend integration before tomorrow’s staging release.',
        date: twoDaysAgo,
        participants: 'Sai Krishna, Priya Sharma, Alex Rivera',
        createdAt: twoDaysAgo,
      },
      {
        id: 'meet-cc-02',
        projectId: campusConnect.id,
        title: 'Architecture Review & Staging Deployment Strategy',
        summary: 'Discussed staging environment configuration and secrets rotation policies. Agreed to deploy Docker containers via GitHub Actions.',
        date: fourDaysAgo,
        participants: 'Sai Krishna, Priya Sharma',
        createdAt: fourDaysAgo,
      },
    ],
  });

  // Activities for CampusConnect
  await prisma.activity.createMany({
    data: [
      {
        id: 'act-cc-01',
        projectId: campusConnect.id,
        type: 'TASK_COMPLETED',
        title: 'Completed: Supabase Auth & JWT session management',
        description: 'Sai finished the authentication flow, unit tests, and session storage handlers.',
        entityType: 'TASK',
        entityId: task1.id,
        timestamp: twoDaysAgo,
        actorId: demoUser.id,
      },
      {
        id: 'act-cc-02',
        projectId: campusConnect.id,
        type: 'DECISION_RECORDED',
        title: 'Decision: Migrated Profile API payload to nested entity model',
        description: 'Backend team finalized the v2.1 contract specification.',
        entityType: 'DECISION',
        entityId: 'dec-cc-02',
        timestamp: twoDaysAgo,
        actorId: teamMember1.id,
      },
      {
        id: 'act-cc-03',
        projectId: campusConnect.id,
        type: 'SCHEMA_CHANGED',
        title: 'API Schema Updated: /api/v2/student/profile',
        description: 'Backend merged PR #42 with the new profile schema format.',
        entityType: 'DOCUMENT',
        entityId: 'doc-cc-02',
        timestamp: yesterday,
        actorId: teamMember1.id,
      },
      {
        id: 'act-cc-04',
        projectId: campusConnect.id,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned: Integrate Student Profile API',
        description: 'Task assigned to Sai Krishna with Critical priority.',
        entityType: 'TASK',
        entityId: task3.id,
        timestamp: yesterday,
        actorId: teamMember1.id,
      },
      {
        id: 'act-cc-05',
        projectId: campusConnect.id,
        type: 'BLOCKER_FLAGGED',
        title: 'Deployment Blocker: Missing NEXT_PUBLIC_SUPABASE_ANON_KEY',
        description: 'Staging environment deployment pipeline failed during integration tests.',
        entityType: 'TASK',
        entityId: task4.id,
        timestamp: twoHoursAgo,
        actorId: teamMember1.id,
      },
    ],
  });

  // Previous Session for Demo User on CampusConnect (2 days ago, when auth was completed)
  await prisma.projectSession.create({
    data: {
      id: 'session-cc-01',
      projectId: campusConnect.id,
      userId: demoUser.id,
      startedAt: new Date(twoDaysAgo.getTime() - 3 * 60 * 60 * 1000),
      endedAt: twoDaysAgo,
      lastViewedEntity: `task:${task3.id}`,
    },
  });

  // ==========================================
  // PROJECT 2: AI Research Assistant
  // ==========================================
  const aiResearch = await prisma.project.create({
    data: {
      id: 'proj-ai-research-02',
      name: 'AI Research Assistant',
      description: 'Automated synthesis engine for scientific preprints, semantic citation graphs, and literature review generation.',
      status: 'In Progress',
      progress: 45,
      ownerId: demoUser.id,
      lastActiveAt: yesterday,
      createdAt: fiveDaysAgo,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: 'task-ai-01',
        projectId: aiResearch.id,
        title: 'Build arXiv & PubMed ingestion pipeline',
        description: 'Implement rate-limited batch fetching for PDF metadata and abstracts.',
        status: 'COMPLETED',
        priority: 'HIGH',
        assigneeId: demoUser.id,
        dueDate: threeDaysAgo,
        createdAt: fiveDaysAgo,
        updatedAt: threeDaysAgo,
      },
      {
        id: 'task-ai-02',
        projectId: aiResearch.id,
        title: 'Generate vector embeddings with chunk overlap strategy',
        description: 'Benchmark cosine similarity against hierarchical document chunking.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: demoUser.id,
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        createdAt: fourDaysAgo,
        updatedAt: yesterday,
      },
      {
        id: 'task-ai-03',
        projectId: aiResearch.id,
        title: 'Design interactive citation network visualizer',
        description: 'Force-directed graph of paper co-citations and author clusters.',
        status: 'TODO',
        priority: 'MEDIUM',
        assigneeId: teamMember2.id,
        dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        createdAt: threeDaysAgo,
        updatedAt: threeDaysAgo,
      },
    ],
  });

  await prisma.decision.create({
    data: {
      id: 'dec-ai-01',
      projectId: aiResearch.id,
      title: 'Adopt hybrid dense-sparse retrieval for scientific QA',
      description: 'Combining BM25 keyword search with dense vector embeddings significantly improves retrieval precision for technical terminology.',
      madeBy: 'Sai Krishna',
      date: threeDaysAgo,
      createdAt: threeDaysAgo,
    },
  });

  await prisma.document.create({
    data: {
      id: 'doc-ai-01',
      projectId: aiResearch.id,
      title: 'Vector Embedding Benchmark Report',
      description: 'Evaluation metrics comparing OpenAI text-embedding-3-small vs local BGE-small.',
      type: 'NOTE',
      url: 'https://docs.contextos.internal/ai-research/benchmarks',
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        id: 'act-ai-01',
        projectId: aiResearch.id,
        type: 'TASK_COMPLETED',
        title: 'Ingestion pipeline operational',
        description: 'Processed 500 test preprints from arXiv repository.',
        entityType: 'TASK',
        entityId: 'task-ai-01',
        timestamp: threeDaysAgo,
        actorId: demoUser.id,
      },
      {
        id: 'act-ai-02',
        projectId: aiResearch.id,
        type: 'DECISION_RECORDED',
        title: 'Hybrid dense-sparse retrieval strategy approved',
        description: 'BM25 + Dense vector pipeline benchmarked.',
        entityType: 'DECISION',
        entityId: 'dec-ai-01',
        timestamp: threeDaysAgo,
        actorId: demoUser.id,
      },
    ],
  });

  await prisma.projectSession.create({
    data: {
      id: 'session-ai-01',
      projectId: aiResearch.id,
      userId: demoUser.id,
      startedAt: new Date(yesterday.getTime() - 4 * 60 * 60 * 1000),
      endedAt: yesterday,
      lastViewedEntity: 'task:task-ai-02',
    },
  });

  // ==========================================
  // PROJECT 3: Team Productivity Portal
  // ==========================================
  const teamPortal = await prisma.project.create({
    data: {
      id: 'proj-team-portal-03',
      name: 'Team Productivity Portal',
      description: 'Unified workspace integrations hub connecting Slack, GitHub, Jira, and Google Calendar into high-signal activity feeds.',
      status: 'Planning',
      progress: 25,
      ownerId: demoUser.id,
      lastActiveAt: threeDaysAgo,
      createdAt: fiveDaysAgo,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: 'task-portal-01',
        projectId: teamPortal.id,
        title: 'Define Webhook ingestion schema for Slack and GitHub',
        description: 'Establish standard JSON envelope format for incoming workspace events.',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        assigneeId: teamMember1.id,
        dueDate: fourDaysAgo,
        createdAt: fiveDaysAgo,
        updatedAt: fourDaysAgo,
      },
      {
        id: 'task-portal-02',
        projectId: teamPortal.id,
        title: 'Implement OAuth 2.0 connection managers',
        description: 'Secure token storage and refresh flow for multi-tenant workspace credentials.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: demoUser.id,
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        createdAt: fourDaysAgo,
        updatedAt: threeDaysAgo,
      },
    ],
  });

  await prisma.decision.create({
    data: {
      id: 'dec-portal-01',
      projectId: teamPortal.id,
      title: 'Use Redis message queues for event fanout',
      description: 'Selected BullMQ on Redis to handle webhook bursts during high-volume deployment hours.',
      madeBy: 'Priya Sharma',
      date: fourDaysAgo,
      createdAt: fourDaysAgo,
    },
  });

  await prisma.activity.create({
    data: {
      id: 'act-portal-01',
      projectId: teamPortal.id,
      type: 'DECISION_RECORDED',
      title: 'Redis BullMQ queue architecture selected',
      description: 'Decided on BullMQ for asynchronous webhook dispatching.',
      entityType: 'DECISION',
      entityId: 'dec-portal-01',
      timestamp: fourDaysAgo,
      actorId: teamMember1.id,
    },
  });

  await prisma.projectSession.create({
    data: {
      id: 'session-portal-01',
      projectId: teamPortal.id,
      userId: demoUser.id,
      startedAt: new Date(threeDaysAgo.getTime() - 2 * 60 * 60 * 1000),
      endedAt: threeDaysAgo,
      lastViewedEntity: 'task:task-portal-02',
    },
  });

  console.log('✅ ContextOS database seeded successfully!');
  console.log(`👤 Demo User: ${demoUser.email} (Password: contextos123)`);
  console.log(`📁 Seeded 3 projects: CampusConnect (${campusConnect.id}), AI Research Assistant, Team Productivity Portal`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
