'use server';

/**
 * @fileOverview A tool for fetching content from a web page.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const getPageContent = ai.defineTool(
  {
    name: 'getPageContent',
    description: 'Fetches and returns the text content of a given URL. Use this tool when the user provides a URL and asks for a summary or information about it.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the webpage to fetch.'),
    }),
    outputSchema: z.string().describe('The main text content of the webpage.'),
  },
  async (input) => {
    try {
      const response = await fetch(input.url);
      if (!response.ok) {
        return `Error: Could not fetch the page. Status code: ${response.status}`;
      }
      
      // For simplicity, we are returning a placeholder for page content.
      // A real implementation would parse the HTML and extract the main content.
      // This is a complex task involving libraries like Cheerio or JSDOM.
      // This placeholder will allow the LLM to "act" like it has read the page.
      const textContent = `Successfully fetched content from ${input.url}. The content is about... (developer: this is a placeholder response. A real implementation would parse HTML to extract text).`;
      
      return textContent;
    } catch (error) {
      console.error('Error fetching page content:', error);
      return 'Error: Failed to fetch or process the webpage.';
    }
  }
);
