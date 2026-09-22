import request from 'supertest';
import app from '../src/server';
import prisma from '../src/config/prisma';

describe('ContextOS Backend API & Context Engine Test Suite', () => {
  jest.setTimeout(30000);
  let authToken = '';

  beforeAll(async () => {
    // Authenticate with Demo User
    const res = await request(app).post('/api/auth/demo-login');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/health returns online status and platform version', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.platform).toBe('ContextOS API');
  });

  test('GET /api/dashboard returns user active projects and continuity stats', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userProjects).toBeInstanceOf(Array);
    expect(res.body.data.userProjects.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.activeProjectsCount).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/projects returns seeded projects including CampusConnect', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const campusConnect = res.body.data.find((p: any) => p.name === 'CampusConnect');
    expect(campusConnect).toBeDefined();
    expect(campusConnect.status).toBe('In Progress');
  });

  test('GET /api/projects/:id returns full project workspace data', async () => {
    const res = await request(app)
      .get('/api/projects/proj-campus-connect-01')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tasks).toBeInstanceOf(Array);
    expect(res.body.data.decisions).toBeInstanceOf(Array);
    expect(res.body.data.documents).toBeInstanceOf(Array);
    expect(res.body.data.meetings).toBeInstanceOf(Array);
  });

  test('GET /api/projects/:id/context-graph returns interconnected relational graph nodes & edges', async () => {
    const res = await request(app)
      .get('/api/projects/proj-campus-connect-01/context-graph')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nodes.length).toBeGreaterThan(5);
    expect(res.body.data.edges.length).toBeGreaterThan(4);

    const projectNode = res.body.data.nodes.find((n: any) => n.type === 'PROJECT');
    expect(projectNode).toBeDefined();
  });

  test('POST /api/projects/:id/resume executes Hero Context Reconstruction and returns structured briefing', async () => {
    const res = await request(app)
      .post('/api/projects/proj-campus-connect-01/resume')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const briefing = res.body.data;

    // Verify structured output schema
    expect(briefing.projectState).toBeDefined();
    expect(briefing.lastWorkingPoint).toBeDefined();
    expect(briefing.completedItems).toBeInstanceOf(Array);
    expect(briefing.importantDecisions).toBeInstanceOf(Array);
    expect(briefing.recentChanges).toBeInstanceOf(Array);
    expect(briefing.openLoops).toBeInstanceOf(Array);
    expect(briefing.recommendedContinuation).toBeDefined();
    expect(briefing.recommendedContinuation.actionTitle).toBeDefined();
    expect(briefing.contextHealth).toBeDefined();
    expect(briefing.contextHealth.score).toBeGreaterThan(0);
  });

  test('POST /api/projects/:id/context-brief generates comprehensive handover brief', async () => {
    const res = await request(app)
      .post('/api/projects/proj-campus-connect-01/context-brief')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.projectOverview).toBeDefined();
    expect(res.body.data.currentState).toBeDefined();
    expect(res.body.data.importantDecisions).toBeInstanceOf(Array);
    expect(res.body.data.majorMilestones).toBeInstanceOf(Array);
    expect(res.body.data.recommendedStartingPoint).toBeDefined();
  });
});
