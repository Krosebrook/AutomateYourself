
export enum AppView {
  GENERATOR = 'GENERATOR',
  CHATBOT = 'CHATBOT',
  IMAGE_ANALYSIS = 'IMAGE_ANALYSIS',
  TTS = 'TTS'
}

export type Platform = 'zapier' | 'n8n' | 'langchain' | 'make' | 'pipedream';

export type StepType = 'trigger' | 'action' | 'logic';

export interface AutomationStep {
  id: number;
  title: string;
  description: string;
  type: StepType;
}

export interface AutomationResult {
  platform: Platform;
  steps: AutomationStep[];
  codeSnippet?: string;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface VoiceModel {
  id: string;
  name: string;
  description: string;
}
