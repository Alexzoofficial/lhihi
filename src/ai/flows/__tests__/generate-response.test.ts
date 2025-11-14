
import { generateResponse } from '@/ai/flows/generate-response';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('This is a mock response.'),
  } as Response)
);

describe('generateResponse', () => {
  it('should return a valid response from the Pollinations.ai API', async () => {
    const response = await generateResponse({
      conversationHistory: '',
      userInput: 'hello',
    });
    expect(response).toBeDefined();
    expect(typeof response.response).toBe('string');
    expect(response.response.length).toBeGreaterThan(0);
    expect(fetch).toHaveBeenCalledWith('https://text.pollinations.ai/hello');
  });
});
