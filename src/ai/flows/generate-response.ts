
'use server';

/**
 * @fileOverview Generates coherent and contextually relevant text responses, similar to ChatGPT.
 *
 * - generateResponse - A function that generates text responses based on conversation history.
 * - GenerateResponseInput - The input type for the generateResponse function.
 * - GenerateResponseOutput - The return type for the generateResponse function.
 */

import {ai, callOpenRouter} from '@/ai/genkit';
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
  thinking: z.string().optional().describe('The reasoning process and thought steps when using Gemini thinking model.'),
});

export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

function needsGenkitTools(userInput: string): boolean {
  const lowerInput = userInput.toLowerCase();
  
  // Image generation keywords
  const imageKeywords = [
    'generate image', 'create image', 'draw', 'make picture', 
    'generate a picture', 'create a picture', 'make an image',
    'generate art', 'create art', 'draw me', 'show me a picture of',
    'make a drawing', 'generate photo', 'create photo'
  ];
  
  // Web search keywords
  const searchKeywords = [
    'search', 'latest', 'current', 'news', 'find information',
    'what\'s happening', 'what is happening', 'look up', 'google',
    'recent', 'today', 'this week', 'right now', 'tell me about recent',
    'who won', 'what happened', 'current events', 'breaking news'
  ];
  
  // YouTube keywords
  const youtubeKeywords = [
    'find video', 'show video', 'youtube', 'tutorial video',
    'video on', 'watch video', 'find a video about', 'show me a video',
    'youtube video', 'video tutorial', 'how to video'
  ];
  
  // Temp mail keywords
  const tempMailKeywords = [
    'temp mail', 'temporary email', 'disposable email',
    'temporary mail', 'disposable mail', 'temp email',
    'create email', 'generate email', 'get email address'
  ];
  
  // Check for any tool-specific keywords
  const hasImageIntent = imageKeywords.some(keyword => lowerInput.includes(keyword));
  const hasSearchIntent = searchKeywords.some(keyword => lowerInput.includes(keyword));
  const hasYouTubeIntent = youtubeKeywords.some(keyword => lowerInput.includes(keyword));
  const hasTempMailIntent = tempMailKeywords.some(keyword => lowerInput.includes(keyword));
  
  return hasImageIntent || hasSearchIntent || hasYouTubeIntent || hasTempMailIntent;
}

function needsComplexReasoning(userInput: string): boolean {
  const reasoningKeywords = [
    'calculate', 'solve', 'prove', 'analyze', 'compare', 'evaluate',
    'explain why', 'how does', 'what if', 'logic', 'reasoning',
    'mathematical', 'compute', 'derive', 'deduce', 'infer',
    'step by step', 'think through', 'break down', 'analyze',
    'complex', 'algorithm', 'optimization', 'probability'
  ];
  
  const lowerInput = userInput.toLowerCase();
  
  const hasReasoningKeywords = reasoningKeywords.some(keyword => lowerInput.includes(keyword));
  
  const hasMathSymbols = /[+\-*/=<>^(){}[\]]/.test(userInput) && /\d/.test(userInput);
  
  const hasComplexQuestion = /\b(why|how|explain|analyze|compare)\b.*\b(and|or|versus|vs|but)\b/i.test(userInput);
  
  return hasReasoningKeywords || hasMathSymbols || hasComplexQuestion;
}

export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  // Check for tool-dependent intents FIRST (highest priority)
  if (needsGenkitTools(input.userInput)) {
    // Use Gemini with tools for image generation, web search, YouTube, temp mail
    return generateResponseFlow(input);
  }
  
  // Check for complex reasoning needs (second priority)
  if (needsComplexReasoning(input.userInput)) {
    // Use DeepSeek R1 via OpenRouter for complex reasoning
    return generateWithOpenRouter(input, 'deepseek/deepseek-r1:free');
  }
  
  // Default to GPT-OSS-20B via OpenRouter for simple conversational queries
  return generateWithOpenRouter(input, 'openai/gpt-oss-20b:free');
}

async function generateWithOpenRouter(input: GenerateResponseInput, model: string): Promise<GenerateResponseOutput> {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are Lhihi AI, a helpful and friendly AI system developed by Alexzo using the Alexzo Intelligence model. Your goal is to be a natural, engaging conversationalist and to write accurate, detailed, and comprehensive answers to user queries.

Your personality is that of a friendly, expressive, and intelligent male assistant. Use emojis 😊🔥💡🎯 to make casual chats more expressive. Show empathy ❤️ and humor 😄 when suitable, but remain serious and factual for serious topics.

You MUST detect the user's language from their input and respond in the exact same language. This includes variations like "Hinglish" (Hindi written in the Roman alphabet).

For complex questions, begin answers with a brief summary, followed by detailed structured sections. You MUST use **bold text** for main section titles. Do NOT use markdown hashes (e.g. ##) or asterisks/dashes for lists. Use proper Unicode bullets (•) for list items. Do NOT use raw HTML tags.

After providing an informational response, generate a list of 3-4 related questions as 'relatedQueries' that the user might be interested in asking next.`
      }
    ];
    
    if (input.conversationHistory) {
      messages.push({
        role: 'user',
        content: input.conversationHistory
      });
    }
    
    messages.push({
      role: 'user',
      content: input.userInput
    });

    const responseText = await callOpenRouter(messages, { model });
    
    const relatedQueries = extractRelatedQueries(responseText);
    
    return {
      response: responseText,
      relatedQueries: relatedQueries.length > 0 ? relatedQueries : undefined,
    };
  } catch (error: any) {
    console.error('OpenRouter error:', error);
    // Fallback to Gemini
    return generateResponseFlow(input);
  }
}

function extractRelatedQueries(text: string): string[] {
  const queries: string[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^(\d+\.|\•|-)\s*.+\?$/)) {
      const query = line.replace(/^(\d+\.|\•|-)\s*/, '').trim();
      if (query.length > 10 && query.length < 100) {
        queries.push(query);
      }
    }
  }
  
  return queries.slice(0, 4);
}

async function generateWithThinkingModel(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  const thinkingPrompt = ai.definePrompt({
    name: 'thinkingPrompt',
    input: {schema: GenerateResponseInputSchema},
    output: {schema: GenerateResponseOutputSchema},
    tools: [getPageContent, generateImage, searchYouTube, createTempMailAccount],
    prompt: `<goal>
You are Lhihi AI, a helpful and friendly AI system developed by Alexzo using the Alexzo Intelligence model. Your goal is to be a natural, engaging conversationalist and to write accurate, detailed, and comprehensive answers to user queries.

This query requires complex reasoning. You should think through the problem step by step before providing your answer.
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

<thinking_rules>
- For this complex query, provide your step-by-step reasoning process in the 'thinking' field.
- In the 'thinking' field, show your internal reasoning: break down the problem, consider different approaches, work through calculations, and explain your logic.
- The 'thinking' field should contain your raw thought process - it's okay to be verbose and exploratory here.
- After your thinking is complete, provide a clear, well-structured answer in the 'response' field.
</thinking_rules>

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

  try {
    const url = `https://text.pollinations.ai/${encodeURIComponent(input.userInput)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return { response: text };
  } catch (error) {
    console.error('Error generating response from Pollinations.ai:', error);
    return { response: 'Sorry, I encountered an error. Please try again.' };
  }
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
    try {
      const prompt = input.userInput;
      const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      return { response: text };
    } catch (error) {
      console.error('Error generating response from Pollinations.ai:', error);
      return { response: 'Sorry, I encountered an error. Please try again.' };
    }
  }
);
