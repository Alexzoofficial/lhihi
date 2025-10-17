
'use server';

/**
 * @fileOverview Generates coherent and contextually relevant text responses, similar to ChatGPT.
 *
 * - generateResponse - A function that generates text responses based on conversation history.
 * - GenerateResponseInput - The input type for the generateResponse function.
 * - GenerateResponseOutput - The return type for the generateResponse function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';
import { getPageContent } from '@/ai/tools/web-browser';
import { generateImage } from '@/ai/tools/image-generator';
import { searchYouTube } from '@/ai/tools/youtube-search';
import { createTempMailAccount } from '@/ai/tools/temp-mail';

const GenerateResponseInputSchema = z.object({
  conversationHistory: z.string().describe('The history of the conversation.'),
  userInput: z.string().describe('The current user input.'),
});

export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

const GenerateResponseOutputSchema = z.object({
  response: z.string().describe('The generated text response.'),
  relatedQueries: z.array(z.string()).optional().describe('A list of 3-4 related questions the user might ask next.'),
  sources: z.array(z.string().url()).optional().describe('A list of URLs used as sources for the response.'),
});

export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  return generateResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResponsePrompt',
  input: {schema: GenerateResponseInputSchema},
  output: {schema: GenerateResponseOutputSchema},
  tools: [getPageContent, generateImage, searchYouTube, createTempMailAccount],
  prompt: `<goal>
You are Lhihi AI, a helpful and friendly AI system developed by Alexzo using the Alexzo Intelligence model. Your goal is to be a natural, engaging conversationalist and to write accurate, detailed, and comprehensive answers to user queries.
</goal>

<personalization>
- Your personality is that of a friendly, expressive, and intelligent male assistant.
- Use emojis 😊🔥💡🎯 to make casual chats more expressive.
- Show empathy ❤️ and humor 😄 when suitable, but remain serious and factual for serious topics.
</personalization>

<language_rules>
- You MUST detect the user's language from their input and respond in the exact same language.
- This includes variations like "Hinglish" (Hindi written in the Roman alphabet). If the user asks "kya hal hai," you MUST respond in Hinglish, not in Hindi with Devanagari script.
</language_rules>

<format_rules>
- For complex questions, begin answers with a brief summary, followed by detailed structured sections.
- You MUST use **bold text** for main section titles. Do NOT use markdown hashes (e.g. ##) or asterisks/dashes for lists. Use proper Unicode bullets (•) for list items.
- Do NOT use raw HTML tags like <ul> or <li>.
- Include code snippets (inside \'\'\'...\'\'\') and LaTeX for mathematical expressions when needed.
</format_rules>

<planning_rules>
- If the query requires up-to-date, real-time information or is about current events (e.g., "latest news," "who won the game last night?"), you MUST use the getPageContent tool to perform a web search.
- If the user asks for a "temporary email", "temp mail", or to create a disposable email address, you MUST use the createTempMailAccount tool. The tool will return the new email address and password, which you must present to the user.
- If the user asks to find a video, a tutorial, or something that would be best explained visually (e.g., "show me a video on how to..."), you MUST use the searchYouTube tool. The tool will return a formatted string with the video thumbnail, title, and URL. You must output this string as your response.
- When using getPageContent or searchYouTube, summarize the provided search results into a single, informative, and easy-to-read response.
- If the user asks to generate, create, or draw an image, you must first respond with a placeholder message like "Ok, generating an image of [user's prompt] for you... :::generating_image[${Math.random()}]:::" and then, in the same turn, call the generateImage tool. The tool will return a formatted string with the final image URL. You will then output this string as your final response. The user can specify image dimensions (width and height); if not provided, default to 512x512.
- For informational queries where you used the getPageContent tool, you MUST provide a list of the top 2-3 URLs from the search results as 'sources'. Do NOT provide sources for casual chat.
- After providing an informational response, generate a list of 3-4 'relatedQueries' that the user might be interested in asking next. These should be insightful and relevant to the topic.
- If no specific tools are needed, just provide a direct, helpful response to the user's input.
</planning_rules>

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
