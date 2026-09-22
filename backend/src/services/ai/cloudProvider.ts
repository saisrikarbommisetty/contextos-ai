import { ContextPackage, ResumeBriefing, ProjectContextBrief } from '../../types';
import { AIProvider } from './types';
import { DemoAIProvider } from './demoProvider';

export class CloudLLMProvider implements AIProvider {
  public name = 'CloudLLMProvider';
  private fallbackProvider: DemoAIProvider;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.fallbackProvider = new DemoAIProvider();
  }

  public async generateResumeBriefing(pkg: ContextPackage): Promise<ResumeBriefing> {
    try {
      if (process.env.DEMO_MODE === 'true' || !this.apiKey) {
        return await this.fallbackProvider.generateResumeBriefing(pkg);
      }

      const prompt = `You are ContextOS, the AI Context Layer for Human Work.
Analyze the following project state and reconstruct an exact, high-signal contextual briefing for the user returning to work.

PROJECT DATA:
${JSON.stringify(pkg, null, 2)}

You MUST return a strictly valid JSON object adhering EXACTLY to this schema (no markdown formatting, no backticks, ONLY pure raw JSON):
{
  "projectId": "${pkg.projectId}",
  "projectName": "${pkg.projectName}",
  "reconstructedAt": "${new Date().toISOString()}",
  "projectState": "Clear narrative summary of overall status and bottlenecks",
  "lastWorkingPoint": "Clear summary of exactly where the user stopped in their previous session",
  "completedItems": [{"id": "task-id", "title": "Completed task title", "completedAt": "timestamp"}],
  "importantDecisions": [{"id": "dec-id", "title": "Decision title", "description": "Why and what was decided", "madeBy": "Person/Team", "date": "Date"}],
  "recentChanges": [{"id": "change-id", "category": "SCHEMA" | "TASK" | "DEPLOYMENT" | "DOC", "title": "Change title", "description": "Details", "timeAgo": "e.g. 2 days ago", "timestamp": "ISO"}],
  "openLoops": [{"id": "loop-id", "title": "Unfinished item or blocker", "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW", "status": "BLOCKED" | "IN_PROGRESS" | "TODO", "description": "Details"}],
  "relevantEntities": [{"id": "doc-id", "type": "DOCUMENT" | "TASK" | "DECISION" | "MEETING", "title": "Entity title", "snippet": "Relevant context", "url": "URL if any"}],
  "recommendedContinuation": {
    "actionTitle": "The single highest-impact next step to take",
    "reasoning": "Why this specific action unblocks work",
    "primaryTaskId": "optional-id",
    "suggestedSteps": ["Step 1", "Step 2", "Step 3"]
  },
  "contextHealth": {
    "score": ${pkg.contextHealth.score},
    "status": "${pkg.contextHealth.status}",
    "summary": "${pkg.contextHealth.summary}"
  }
}`;

      const aiResponse = await this.callLLM(prompt);
      if (aiResponse) {
        const cleaned = this.cleanJsonString(aiResponse);
        const parsed = JSON.parse(cleaned);
        if (parsed.projectState && parsed.lastWorkingPoint && parsed.recommendedContinuation) {
          console.log(`[ContextOS AI] ✨ Gemini live context reconstructed for project: "${pkg.projectName}"`);
          return {
            ...parsed,
            aiSource: 'gemini',
          };
        }
      }

      console.warn('[CloudLLMProvider] Live AI output was incomplete, using fallback.');
      const fallbackResult = await this.fallbackProvider.generateResumeBriefing(pkg);
      return { ...fallbackResult, aiSource: 'fallback' };
    } catch (err: any) {
      console.warn('[CloudLLMProvider] Cloud LLM execution failed, falling back to DemoAIProvider:', err.message || err);
      const fallbackResult = await this.fallbackProvider.generateResumeBriefing(pkg);
      return { ...fallbackResult, aiSource: 'fallback' };
    }
  }

  public async generateProjectBrief(pkg: ContextPackage): Promise<ProjectContextBrief> {
    try {
      if (process.env.DEMO_MODE === 'true' || !this.apiKey) {
        const fallbackResult = await this.fallbackProvider.generateProjectBrief(pkg);
        return { ...fallbackResult, aiSource: 'fallback' };
      }

      const prompt = `You are ContextOS. Generate a comprehensive Project Handover Brief for onboarding teammates or project takeovers.
PROJECT DATA:
${JSON.stringify(pkg, null, 2)}

Return ONLY a valid JSON object matching this schema:
{
  "projectId": "${pkg.projectId}",
  "projectName": "${pkg.projectName}",
  "generatedAt": "${new Date().toISOString()}",
  "projectOverview": "Executive summary of project purpose",
  "currentState": "Detailed breakdown of where the project stands today",
  "importantDecisions": [{"title": "Title", "description": "Rationale", "madeBy": "Author", "date": "Date"}],
  "majorMilestones": [{"title": "Milestone name", "status": "Completed" | "In Progress" | "Pending"}],
  "currentBlockers": [{"title": "Blocker title", "priority": "Priority", "resolution": "Recommended fix"}],
  "recentChanges": [{"title": "Title", "time": "Date/Time"}],
  "keyPeople": [{"name": "Name", "role": "Role"}],
  "relevantDocuments": [{"title": "Doc title", "type": "Type"}],
  "recommendedStartingPoint": "First concrete action for a new engineer or returning lead"
}`;

      const aiResponse = await this.callLLM(prompt);
      if (aiResponse) {
        const cleaned = this.cleanJsonString(aiResponse);
        const parsed = JSON.parse(cleaned);
        if (parsed.projectOverview && parsed.currentState) {
          console.log(`[ContextOS AI] ✨ Gemini live handover brief generated for project: "${pkg.projectName}"`);
          return {
            ...parsed,
            aiSource: 'gemini',
          };
        }
      }

      const fallbackResult = await this.fallbackProvider.generateProjectBrief(pkg);
      return { ...fallbackResult, aiSource: 'fallback' };
    } catch (err: any) {
      console.warn('[CloudLLMProvider] Cloud LLM project brief failed, falling back to DemoAIProvider:', err.message || err);
      const fallbackResult = await this.fallbackProvider.generateProjectBrief(pkg);
      return { ...fallbackResult, aiSource: 'fallback' };
    }
  }

  private cleanJsonString(raw: string): string {
    return raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
  }

  private async callLLM(prompt: string): Promise<string | null> {
    const providerType = process.env.AI_PROVIDER || 'gemini';

    if (providerType === 'openai') {
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      console.log(`[ContextOS AI] Calling OpenAI (${model})...`);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error (${response.status}): ${await response.text()}`);
      }

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }

    // Default to Google Gemini API with fallback cascade
    const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
    const modelsToTry = [
      primaryModel,
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.6-flash',
    ];
    const uniqueModels = Array.from(new Set(modelsToTry));

    let lastError: any = null;

    for (const model of uniqueModels) {
      try {
        console.log(`[ContextOS AI] Calling Google Gemini (${model})...`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            }),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API error (${response.status}): ${errText}`);
        }

        const data: any = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[ContextOS AI] Attempt with model ${model} failed:`, err.message || err);
        // Continue to next model in loop if 404
      }
    }

    if (lastError) {
      throw lastError;
    }
    return null;
  }
}
