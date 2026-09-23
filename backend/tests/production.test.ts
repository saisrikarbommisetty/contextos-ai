import request from 'supertest';
import app from '../src/server';
import prisma from '../src/config/prisma';

describe('ContextOS Production Multi-User & Real Data Architecture Suite', () => {
  jest.setTimeout(45000);

  let userAToken = '';
  let userAId = '';
  let userBToken = '';
  let userBId = '';

  let projectAId = '';
  let projectBId = '';
  let taskAId = '';
  let decisionAId = '';
  let docAId = '';

  const userAEmail = `user_a_${Date.now()}@contextos.test`;
  const userBEmail = `user_b_${Date.now()}@contextos.test`;

  beforeAll(async () => {
    // Ensure test environment is ready
  });

  afterAll(async () => {
    // Clean up created test data
    try {
      if (projectAId) await prisma.project.delete({ where: { id: projectAId } }).catch(() => {});
      if (projectBId) await prisma.project.delete({ where: { id: projectBId } }).catch(() => {});
      if (userAId) await prisma.user.delete({ where: { id: userAId } }).catch(() => {});
      if (userBId) await prisma.user.delete({ where: { id: userBId } }).catch(() => {});
    } catch (e) {}
    await prisma.$disconnect();
  });

  // =========================================================================
  // 1. AUTHENTICATION & VALIDATION TESTS
  // =========================================================================
  describe('1. Real User Authentication & Registration', () => {
    test('Rejects registration with invalid email format', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Alex Test',
        email: 'invalid-email-address',
        password: 'securePassword123',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/valid email/i);
    });

    test('Rejects registration with short password (< 6 chars)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Alex Test',
        email: userAEmail,
        password: '123',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/at least 6 characters/i);
    });

    test('Rejects registration when confirmPassword does not match', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Alex Test',
        email: userAEmail,
        password: 'password123',
        confirmPassword: 'mismatchPassword',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/do not match/i);
    });

    test('Registers User A successfully and returns JWT + clean profile', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Alice Developer',
        email: userAEmail,
        password: 'password123',
        confirmPassword: 'password123',
        role: 'Full-Stack Lead',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.name).toBe('Alice Developer');
      expect(res.body.user.email).toBe(userAEmail.toLowerCase());

      userAToken = res.body.token;
      userAId = res.body.user.id;
    });

    test('Rejects duplicate email registration with 409 Conflict', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Alice Clone',
        email: userAEmail,
        password: 'password123',
      });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/already exists/i);
    });

    test('Registers User B successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Bob Architect',
        email: userBEmail,
        password: 'password456',
        confirmPassword: 'password456',
        role: 'Security Architect',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      userBToken = res.body.token;
      userBId = res.body.user.id;
    });

    test('User A login with wrong password fails with 401', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: userAEmail,
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/invalid email or password/i);
    });

    test('User A login with correct password succeeds', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: userAEmail,
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(userAEmail.toLowerCase());
    });

    test('GET /api/auth/me returns authenticated user identity', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(userAId);
    });
  });

  // =========================================================================
  // 2. MULTI-USER ISOLATION & SERVER-SIDE AUTHORIZATION
  // =========================================================================
  describe('2. Multi-User Workspace Isolation & Strict Server Authorization', () => {
    test('New User A initially has an empty workspace dashboard', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userProjects).toHaveLength(0);
      expect(res.body.data.stats.activeProjectsCount).toBe(0);
    });

    test('User A creates Project A ("Alpha Cloud Engine")', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Alpha Cloud Engine',
          description: 'High-throughput microservices cluster for event ingestion.',
          status: 'In Progress',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Alpha Cloud Engine');
      expect(res.body.data.ownerId).toBe(userAId);
      projectAId = res.body.data.id;
    });

    test('User B creates Project B ("Beta Security Scanner")', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          name: 'Beta Security Scanner',
          description: 'Automated vulnerability and IAM policy scanner.',
          status: 'Planning',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Beta Security Scanner');
      expect(res.body.data.ownerId).toBe(userBId);
      projectBId = res.body.data.id;
    });

    test('User A dashboard only lists Project A and NOT Project B', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      const projectIds = res.body.data.userProjects.map((p: any) => p.id);
      expect(projectIds).toContain(projectAId);
      expect(projectIds).not.toContain(projectBId);
    });

    test('User B dashboard only lists Project B and NOT Project A', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      const projectIds = res.body.data.userProjects.map((p: any) => p.id);
      expect(projectIds).toContain(projectBId);
      expect(projectIds).not.toContain(projectAId);
    });

    test('User B cannot read Project A workspace (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/forbidden/i);
    });

    test('User B cannot update Project A details (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ name: 'Hacked Project Name' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('User B cannot delete Project A (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // 3. REAL USER PROJECT CRUD & TASK / CONTEXT ENTITIES
  // =========================================================================
  describe('3. Real Project Entity Management (Tasks, ADRs, Docs, Meetings)', () => {
    test('User A adds in-progress task to Project A', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectAId}/tasks`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Implement OAuth2 PKCE Token Flow',
          description: 'Add refresh token rotation and PKCE auth verification.',
          priority: 'CRITICAL',
          status: 'IN_PROGRESS',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Implement OAuth2 PKCE Token Flow');
      taskAId = res.body.data.id;
    });

    test('User A adds blocked task to Project A', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectAId}/tasks`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Deploy to Kubernetes Cluster',
          description: 'Blocked by missing AWS IAM assume-role credentials in CI.',
          priority: 'HIGH',
          status: 'BLOCKED',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('User A records an Architectural Decision (ADR)', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectAId}/decisions`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Adopt PostgreSQL with Row Level Security for Multi-Tenancy',
          description: 'Ensures strict data isolation at database engine level.',
          madeBy: 'Alice Developer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Adopt PostgreSQL with Row Level Security for Multi-Tenancy');
      decisionAId = res.body.data.id;
    });

    test('User A attaches technical documentation', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectAId}/documents`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'OAuth2 Authentication RFC & Security Blueprint',
          description: 'Detailed architecture for stateless JWT and session cookies.',
          type: 'ARCHITECTURE',
          url: 'https://wiki.internal/rfc/auth-blueprint',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      docAId = res.body.data.id;
    });

    test('User A logs a team sync meeting', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectAId}/meetings`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Sprint Architecture Sync',
          summary: 'Agreed on PKCE token storage and unblocking K8s credentials.',
          participants: 'Alice Developer, Dev Team',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('User B cannot delete User A task (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectAId}/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(403);
    });

    test('User A updates Project A details', async () => {
      const res = await request(app)
        .patch(`/api/projects/${projectAId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          name: 'Alpha Cloud Engine v2',
          description: 'Updated enterprise ingestion engine.',
          status: 'In Progress',
          progress: 50,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Alpha Cloud Engine v2');
      expect(res.body.data.progress).toBe(50);
    });
  });

  // =========================================================================
  // 4. REAL RESUME MY WORK & CONTEXT RECONSTRUCTION
  // =========================================================================
  describe('4. Real Context Reconstruction & AI Fallback Resilience', () => {
    test('Resume My Work reconstructs context strictly from User A real project data', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectAId}/resume`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const briefing = res.body.data;

      // Must refer to User A project name
      expect(briefing.projectName).toBe('Alpha Cloud Engine v2');
      expect(briefing.projectId).toBe(projectAId);

      // Must contain User A's real decision
      const hasPostgresDecision = briefing.importantDecisions.some((d: any) =>
        d.title.includes('PostgreSQL')
      );
      expect(hasPostgresDecision).toBe(true);

      // Must identify User A's real open loops (OAuth2 or K8s blocker)
      const hasRealOpenLoop = briefing.openLoops.some(
        (l: any) => l.title.includes('OAuth2') || l.title.includes('Kubernetes')
      );
      expect(hasRealOpenLoop).toBe(true);

      // Must provide action recommendation tailored to User A
      expect(briefing.recommendedContinuation).toBeDefined();
      expect(briefing.recommendedContinuation.actionTitle).toBeDefined();

      // Must NOT contain hardcoded CampusConnect sample strings
      expect(briefing.projectName).not.toBe('CampusConnect');
      expect(briefing.recommendedContinuation.actionTitle).not.toContain('ProfileService.ts');
    });

    test('Project Handover Brief reconstructs User A real milestones & blockers', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectAId}/context-brief`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.projectName).toBe('Alpha Cloud Engine v2');
      expect(res.body.data.projectOverview).toBeDefined();
      expect(res.body.data.projectOverview.length).toBeGreaterThan(10);
    });

    test('Gemini 429 / Quota Failure triggers Deterministic Fallback on real user data (Zero data loss, no demo mode switch)', async () => {
      // Temporarily simulate Gemini quota/rate limit error
      const originalKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = 'invalid_mock_quota_exhausted_key';

      try {
        const res = await request(app)
          .post(`/api/projects/${projectAId}/resume`)
          .set('Authorization', `Bearer ${userAToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const briefing = res.body.data;

        // Verify fallback context is dynamically reconstructed strictly from User A's real data
        expect(briefing.projectName).toBe('Alpha Cloud Engine v2');
        expect(briefing.projectId).toBe(projectAId);
        expect(briefing.aiSource).toBe('fallback');

        // Verify user data is completely intact
        const hasPostgres = briefing.importantDecisions.some((d: any) => d.title.includes('PostgreSQL'));
        expect(hasPostgres).toBe(true);

        // Verify real project recommendation
        expect(briefing.recommendedContinuation.actionTitle).toBeDefined();

        // Verify it NEVER hardcoded CampusConnect or redirected to demo
        expect(briefing.projectName).not.toBe('CampusConnect');

        // Verify dashboard still contains User A data
        const dashRes = await request(app)
          .get('/api/dashboard')
          .set('Authorization', `Bearer ${userAToken}`);

        expect(dashRes.status).toBe(200);
        expect(dashRes.body.data.userProjects).toHaveLength(1);
        expect(dashRes.body.data.userProjects[0].name).toBe('Alpha Cloud Engine v2');
      } finally {
        process.env.GEMINI_API_KEY = originalKey;
      }
    });
  });

  // =========================================================================
  // 5. DEMO WORKSPACE SEPARATION
  // =========================================================================
  describe('5. Demo Workspace & Judge Account Separation', () => {
    test('Demo login provides demo user session and leaves real user accounts isolated', async () => {
      const res = await request(app).post('/api/auth/demo-login');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('demo@contextos.ai');

      const demoToken = res.body.token;

      // Demo user can retrieve their workspace
      const demoDash = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${demoToken}`);

      expect(demoDash.status).toBe(200);
      expect(demoDash.body.success).toBe(true);

      // Verify User A still only sees their own data
      const userADash = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(userADash.body.data.userProjects).toHaveLength(1);
      expect(userADash.body.data.userProjects[0].name).toBe('Alpha Cloud Engine v2');
    });
  });
});
