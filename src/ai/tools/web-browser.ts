
'use server';

/**
 * @fileOverview A tool for fetching content from a web page using Google Custom Search.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID || '';

export const getPageContent = ai.defineTool(
  {
    name: 'getPageContent',
    description: 'Searches the web using Google for a given query and returns a summary of the top results. Use this for questions about current events, facts, or any topic that requires up-to-date information.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.string().describe('A summary of the top 5 search results, formatted as a string including titles, snippets, and links.'),
  },
  async (input) => {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(input.query)}&num=5`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Google Search API Error:', errorBody);
        return `Error: Could not fetch search results. API returned status: ${response.status}.`;
      }
      
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return "No relevant results found for your query.";
      }
      
      const searchResults = data.items.map((item: any, idx: number) => (
        `${idx + 1}. Title: ${item.title}\n   URL: ${item.link}\n   Snippet: ${item.snippet}`
      )).join('\n\n');

      return `Here are the top search results:\n${searchResults}`;

    } catch (error) {
      console.error('Error fetching page content:', error);
      return 'Error: Failed to fetch or process the web search results.';
    }
  }
);
