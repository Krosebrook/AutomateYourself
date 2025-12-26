
export enum AppView {
  GENERATOR = 'GENERATOR',
  CHATBOT = 'CHATBOT',
  IMAGE_ANALYSIS = 'IMAGE_ANALYSIS',
  TTS = 'TTS',
  LIVE_CONSULTANT = 'LIVE_CONSULTANT',
  LOGIC_SANDBOX = 'LOGIC_SANDBOX'
}

export type Platform = 'zapier' | 'n8n' | 'langchain' | 'make' | 'pipedream' | 'google-sheets' | 'airtable' | 'shopify';

export type StepType = 'trigger' | 'action' | 'logic';

export interface GroundingSource {
  title: string;
  uri: string;
}

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
  sources?: GroundingSource[];
}

export interface SimulationStepResult {
  stepId: number;
  status: 'success' | 'failure' | 'skipped';
  output: string;
  reasoning: string;
}

export interface SimulationResponse {
  overallStatus: 'success' | 'failure';
  stepResults: SimulationStepResult[];
  summary: string;
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
  type: string;
}

export interface ApiError {
  message: string;
  code?: string | number;
  details?: any;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}
