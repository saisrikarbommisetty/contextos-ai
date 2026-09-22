import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { ResumeController } from '../controllers/resumeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all project routes
router.use(authenticateToken);

// Project list, create, details & delete
router.get('/', ProjectController.getAllProjects);
router.post('/', ProjectController.createProject);
router.get('/:id', ProjectController.getProjectById);
router.delete('/:id', ProjectController.deleteProject);

// Tasks
router.get('/:id/tasks', ProjectController.getProjectTasks);
router.post('/:id/tasks', ProjectController.createTask);
router.patch('/:id/tasks/:taskId', ProjectController.updateTask);
router.delete('/:id/tasks/:taskId', ProjectController.deleteTask);

// Documents
router.get('/:id/documents', ProjectController.getProjectDocuments);
router.post('/:id/documents', ProjectController.createDocument);
router.delete('/:id/documents/:docId', ProjectController.deleteDocument);

// Meetings
router.get('/:id/meetings', ProjectController.getProjectMeetings);
router.post('/:id/meetings', ProjectController.createMeeting);

// Decisions
router.get('/:id/decisions', ProjectController.getProjectDecisions);
router.post('/:id/decisions', ProjectController.createDecision);
router.delete('/:id/decisions/:decisionId', ProjectController.deleteDecision);

// Activity Audit Feed
router.get('/:id/activity', ProjectController.getProjectActivity);

// Hero Continuity Features
router.post('/:id/resume', ResumeController.resumeWork);
router.post('/:id/context-brief', ResumeController.generateContextBrief);
router.get('/:id/context-graph', ProjectController.getContextGraph);
router.get('/:id/changes', ProjectController.getChanges);

export default router;
