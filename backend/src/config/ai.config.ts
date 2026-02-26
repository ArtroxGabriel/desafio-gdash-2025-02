import { registerAs } from '@nestjs/config';

export const AiConfigName = 'ai';

export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
}

export default registerAs(AiConfigName, () => ({
  baseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.AI_API_KEY || '',
  model: process.env.AI_MODEL || 'gpt-4o-mini',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1024'),
}));
