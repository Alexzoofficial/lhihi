import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-context.ts';
import '@/ai/flows/generate-response.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/tools/web-browser.ts';
