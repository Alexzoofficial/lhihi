'use server';

/**
 * @fileOverview A tool for searching YouTube for videos.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GOOGLE_API_KEY = "AIzaSyB_5sI5Vf-w5g3e4r4t3w2e1f"; 

export const searchYouTube = ai.defineTool(
  {
    name: 'searchYouTube',
    description: 'Searches YouTube for videos based on a query. Use this tool when a user asks for a video, a tutorial, or something best explained with a video.',
    inputSchema: z.object({
      query: z.string().describe('The search query for YouTube.'),
    }),
    outputSchema: z.string().describe('A formatted string summarizing the top 3 video results, including titles and links.'),
  },
  async (input) => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input.query)}&type=video&maxResults=3&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('YouTube API Error:', errorBody);
        return `Error: Could not fetch YouTube results. API returned status: ${response.status}.`;
      }
      
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return "No relevant YouTube videos found for your query.";
      }
      
      const searchResults = data.items.map((item: any, idx: number) => (
        `${idx + 1}. Title: ${item.snippet.title}\n   URL: https://www.youtube.com/watch?v=${item.id.videoId}`
      )).join('\n\n');

      return `Here are the top YouTube results:\n${searchResults}`;

    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return 'Error: Failed to fetch or process YouTube search results.';
    }
  }
);
