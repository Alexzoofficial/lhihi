
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash-exp',
});

export async function callOpenRouter(messages: Array<{role: string, content: string}>, options?: {
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY environment variable is not set. Please add it to your environment variables to use OpenRouter models.'
    );
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.SITE_URL || 'https://localhost:5000',
      'X-Title': 'Lhihi AI',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini-2024-07-18',
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2048,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}
