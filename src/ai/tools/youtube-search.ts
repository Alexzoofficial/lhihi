
'use server';

/**
 * @fileOverview A tool for searching YouTube for videos.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''; 

export const searchYouTube = ai.defineTool(
  {
    name: 'searchYouTube',
    description: 'Searches YouTube for videos based on a query. Use this tool when a user asks for a video, a tutorial, or something best explained with a video.',
    inputSchema: z.object({
      query: z.string().describe('The search query for YouTube.'),
    }),
    outputSchema: z.string().describe('A formatted string summarizing the top video result, including a thumbnail, title and link.'),
  },
  async (input) => {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input.query)}&type=video&maxResults=1&key=${GOOGLE_API_KEY}`;
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
      
      const video = data.items[0];
      const videoId = video.id.videoId;
      const videoTitle = video.snippet.title;
      const thumbnailUrl = video.snippet.thumbnails.high.url;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // Return a formatted string that includes the thumbnail for rendering in the UI
      return `:::youtube[${videoUrl}|${videoTitle}|${thumbnailUrl}]:::`;

    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return 'Error: Failed to fetch or process YouTube search results.';
    }
  }
);
