'use server';

/**
 * @fileOverview A tool for generating images from a text prompt.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const generateImage = ai.defineTool(
  {
    name: 'generateImage',
    description: 'Generates an image based on a user-provided text description. Use this tool when the user asks to create, draw, or generate an image. The user can optionally specify width and height.',
    inputSchema: z.object({
      prompt: z.string().describe('A detailed description of the image to generate.'),
      width: z.number().optional().describe('The width of the image to generate. Defaults to 512.'),
      height: z.number().optional().describe('The height of the image to generate. Defaults to 512.'),
    }),
    outputSchema: z.string().describe('A formatted string with the URL of the generated image, like :::image[https://...-url-of-image]:::'),
  },
  async (input) => {
    try {
      const width = input.width || 512;
      const height = input.height || 512;

      const response = await fetch('https://alexzo.vercel.app/api/generate', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer alexzo_1h5r0ouy12jeyun6f83cda',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: input.prompt,
          width: width,
          height: height
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error generating image:', errorText);
        return `Error: Failed to generate the image. The image generation API returned an error: ${response.status}.`;
      }

      const data = await response.json();
      if (data && data.data && data.data.length > 0 && data.data[0].url) {
        const imageUrl = data.data[0].url;
        return `:::image[${imageUrl}]:::`;
      } else {
        console.error('Error generating image: Invalid API response format.');
        return 'Error: Failed to parse the image URL from the API response.';
      }
      
    } catch (error) {
      console.error('Error generating image:', error);
      return 'Error: An unexpected error occurred while trying to generate the image.';
    }
  }
);
