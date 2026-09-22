import { Response } from 'express';
import { AuthRequest } from '../types';
import { ContextEngine } from '../services/context/contextEngine';
import { getAIProvider } from '../services/ai/aiProvider';
import { ProjectService } from '../services/projectService';

export class ResumeController {
  /**
   * Hero Feature: Resume My Work
   * Reconstructs context, invokes AI reasoning, records session, and returns structured briefing
   */
  public static async resumeWork(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'user-demo-01';

      // 1. Context Engine collects and normalizes project entities & session boundaries
      const contextPackage = await ContextEngine.buildContextPackage(id, userId);

      // 2. AI Abstraction generates structured resume briefing
      const ai = getAIProvider();
      const briefing = await ai.generateResumeBriefing(contextPackage);

      // 3. Record new user working session
      await ProjectService.recordSession(id, userId, `resume:${briefing.recommendedContinuation?.primaryTaskId || id}`);

      res.status(200).json({
        success: true,
        data: briefing,
      });
    } catch (err: any) {
      console.error('[Resume Controller Error]:', err);
      res.status(500).json({
        success: false,
        error: 'We encountered an issue reconstructing your context briefing. Please try again.',
        details: err.message,
      });
    }
  }

  /**
   * Generate Project Context Brief
   * Generates a comprehensive handover document for teammates or project takeovers
   */
  public static async generateContextBrief(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'user-demo-01';

      const contextPackage = await ContextEngine.buildContextPackage(id, userId);
      const ai = getAIProvider();
      const brief = await ai.generateProjectBrief(contextPackage);

      res.status(200).json({
        success: true,
        data: brief,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate project brief: ' + err.message,
      });
    }
  }
}
