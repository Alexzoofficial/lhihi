'use server';

/**
 * @fileOverview Generates coherent and contextually relevant text responses, similar to ChatGPT.
 *
 * - generateResponse - A function that generates text responses based on conversation history.
 * - GenerateResponseInput - The input type for the generateResponse function.
 * - GenerateResponseOutput - The return type for the generateResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResponseInputSchema = z.object({
  conversationHistory: z.string().describe('The history of the conversation.'),
  userInput: z.string().describe('The current user input.'),
});

export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

const GenerateResponseOutputSchema = z.object({
  response: z.string().describe('The generated text response.'),
});

export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  return generateResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResponsePrompt',
  input: {schema: GenerateResponseInputSchema},
  output: {schema: GenerateResponseOutputSchema},
  prompt: `💬 **Conversation Skills Prompt**

You are an advanced AI with natural conversational abilities.
Your goal is to talk like a real human — friendly, expressive, and intelligent.

✨ **Guidelines:**
- Understand tone, mood, and context of the user.
- Reply clearly, politely, and naturally.
- Use emojis 😊🔥💡🎯 to make the chat expressive.
- Keep the conversation engaging with smart follow-up questions.
- Maintain chat flow — remember previous context.
- Show empathy ❤️ and humor 😄 when suitable.
- Balance creativity and logic in every reply.
- Keep your responses concise, natural, and enjoyable to read.

🧠 Example behavior:
User: "I had a tough day today."
AI: "I’m really sorry to hear that 😔 Want to talk about what happened? Maybe I can cheer you up a bit 😊"

<Conversation_History>
{{{conversationHistory}}}
</Conversation_History>

User Input:
{{{userInput}}}

Response:`,
});


const generateResponseFlow = ai.defineFlow(
  {
    name: 'generateResponseFlow',
    inputSchema: GenerateResponseInputSchema,
    outputSchema: GenerateResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
