'use server';

/**
 * @fileOverview A tool for generating images from a text prompt.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

export const generateImage = ai.defineTool(
  {
    name: 'generateImage',
    description: 'Generates an image based on a user-provided text description. Use this tool when the user asks to create, draw, or generate an image.',
    inputSchema: z.object({
      prompt: z.string().describe('A detailed description of the image to generate.'),
    }),
    outputSchema: z.string().describe('The generated image as a data URI.'),
  },
  async (input) => {
    try {
      console.log(`Generating image with prompt: ${input.prompt}`);
      const { media } = await ai.generate({
        model: googleAI.model('imagen-4.0-fast-generate-001'),
        prompt: input.prompt,
      });
      console.log('Image generated successfully.');
      return media.url;
    } catch (error) {
      console.error('Error generating image:', error);
      return 'Error: Failed to generate the image. Please try again with a different prompt.';
    }
  }
);
