import { ContextPackage, ResumeBriefing, ProjectContextBrief } from '../../types';

export interface AIProvider {
  name: string;
  generateResumeBriefing(context: ContextPackage): Promise<ResumeBriefing>;
  generateProjectBrief(context: ContextPackage): Promise<ProjectContextBrief>;
}
