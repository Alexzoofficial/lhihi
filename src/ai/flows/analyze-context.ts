'use server';

/**
 * @fileOverview Analyzes conversation history and current input to provide more tailored and relevant AI responses.
 *
 * - analyzeContext - Analyzes the context of the conversation.
 * - AnalyzeContextInput - The input type for the analyzeContext function.
 * - AnalyzeContextOutput - The return type for the analyzeContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeContextInputSchema = z.object({
  conversationHistory: z.string().describe('The history of the conversation.'),
  currentInput: z.string().describe('The current input from the user.'),
});
export type AnalyzeContextInput = z.infer<typeof AnalyzeContextInputSchema>;

const AnalyzeContextOutputSchema = z.object({
  contextSummary: z.string().describe('A summary of the context of the conversation.'),
});
export type AnalyzeContextOutput = z.infer<typeof AnalyzeContextOutputSchema>;

export async function analyzeContext(input: AnalyzeContextInput): Promise<AnalyzeContextOutput> {
  return analyzeContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeContextPrompt',
  input: {schema: AnalyzeContextInputSchema},
  output: {schema: AnalyzeContextOutputSchema},
  prompt: `You are an AI assistant that analyzes the context of a conversation.  Summarize the conversation history and current input to understand the context and provide a context summary.

Conversation History: {{{conversationHistory}}}

Current Input: {{{currentInput}}}

Context Summary:`,
});

const analyzeContextFlow = ai.defineFlow(
  {
    name: 'analyzeContextFlow',
    inputSchema: AnalyzeContextInputSchema,
    outputSchema: AnalyzeContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
