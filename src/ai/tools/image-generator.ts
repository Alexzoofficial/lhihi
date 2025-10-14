'use server';

/**
 * @fileOverview A tool for generating images from a text prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const generateImage = ai.defineTool(
  {
    name: 'generateImage',
    description: 'Generates an image based on a user-provided text description. Use this tool when the user asks to create, draw, or generate an image.',
    inputSchema: z.object({
      prompt: z.string().describe('A detailed description of the image to generate.'),
    }),
    outputSchema: z.string().describe('The URL of the generated image.'),
  },
  async (input) => {
    try {
      console.log(`Generating image with prompt: ${input.prompt}`);
      const response = await fetch('https://alexzo.vercel.app/api/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer alexzo_1h5r0ouy12jeyun6f83cda',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: input.prompt,
          width: 512,
          height: 512
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error generating image:', errorText);
        return `Error: Failed to generate the image. API returned status ${response.status}.`;
      }

      const data = await response.json();
      if (data && data.data && data.data.length > 0 && data.data[0].url) {
        const imageUrl = data.data[0].url;
        console.log('Image generated successfully:', imageUrl);
        return imageUrl;
      } else {
        console.error('Error generating image: Invalid API response format.');
        return 'Error: Failed to parse the image from the response.';
      }
      
    } catch (error) {
      console.error('Error generating image:', error);
      return 'Error: Failed to generate the image. Please try again with a different prompt.';
    }
  }
);
