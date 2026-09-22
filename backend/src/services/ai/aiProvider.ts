import dotenv from 'dotenv';
import { AIProvider } from './types';
import { DemoAIProvider } from './demoProvider';
import { CloudLLMProvider } from './cloudProvider';

export * from './types';
export * from './demoProvider';
export * from './cloudProvider';

export function getAIProvider(): AIProvider {
  // Re-read dotenv in case of updates
  dotenv.config();

  const providerType = process.env.AI_PROVIDER || 'gemini';
  const apiKey = (process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
  const isDemo = process.env.DEMO_MODE === 'true';

  if (!isDemo && apiKey) {
    return new CloudLLMProvider(apiKey);
  }

  return new DemoAIProvider();
}
