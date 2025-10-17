'use server';

/**
 * @fileOverview A tool for creating temporary email accounts using mail.tm.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Helper function to generate a random string
const generateRandomString = (length: number) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createTempMailAccount = ai.defineTool(
  {
    name: 'createTempMailAccount',
    description: 'Creates a new temporary email account using the mail.tm service. Use this when a user asks for a temporary, disposable, or temp mail address.',
    inputSchema: z.object({}),
    outputSchema: z.string().describe('A formatted string containing the new email address and password, like: "Your temporary email is: `example@domain.com` and your password is: `password123`".'),
  },
  async () => {
    try {
      // 1. Get available domains
      const domainResponse = await fetch('https://api.mail.tm/domains', {
        method: 'GET',
      });
      if (!domainResponse.ok) {
        throw new Error('Failed to fetch available domains.');
      }
      const domains = await domainResponse.json();
      const domain = domains[0]?.domain;
      if (!domain) {
        throw new Error('No available domains found.');
      }

      // 2. Generate random credentials
      const address = generateRandomString(10);
      const password = generateRandomString(12);
      const email = `${address}@${domain}`;

      // 3. Create the account
      const createResponse = await fetch('https://api.mail.tm/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: email,
          password: password,
        }),
      });

      if (!createResponse.ok) {
          const errorBody = await createResponse.json();
          console.error("Mail.tm account creation error:", errorBody);
          throw new Error(`Failed to create account. Status: ${createResponse.status}`);
      }
      
      const account = await createResponse.json();

      if (!account.id) {
          throw new Error('Account creation did not return a valid ID.');
      }

      return `Success! Here is your temporary email account:
• **Email:** \`${email}\`
• **Password:** \`${password}\`

You can use this to sign up for services. I can check the inbox for you later if you ask.`;

    } catch (error: any) {
      console.error('Error creating temporary email:', error);
      return `Error: An unexpected error occurred while trying to create the temporary email. ${error.message}`;
    }
  }
);
