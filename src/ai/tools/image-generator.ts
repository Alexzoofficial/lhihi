'use server';

/**
 * @fileOverview A tool for generating images from a text prompt using pollinations.ai.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const generateImage = ai.defineTool(
  {
    name: 'generateImage',
    description: "Generates an image based on a user-provided text description using Alexzo's image generator. Use this tool when the user asks to create, draw, or generate an image. The user can optionally specify width and height.",
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
      
      const encodedPrompt = encodeURIComponent(input.prompt);
      // Corrected the URL format by removing the extra /prompt
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}`;

      return `:::image[${imageUrl}]:::`;
    } catch (error) {
      console.error('Error generating image with pollinations.ai:', error);
      return 'Error: An unexpected error occurred while trying to generate the image.';
    }
  }
);
