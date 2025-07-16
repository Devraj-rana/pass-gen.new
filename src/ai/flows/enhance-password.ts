'use server';
/**
 * @fileOverview Password enhancement AI agent.
 *
 * - enhancePassword - A function that enhances a user-specified password using AI suggestions.
 * - EnhancePasswordInput - The input type for the enhancePassword function.
 * - EnhancePasswordOutput - The return type for the enhancePassword function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancePasswordInputSchema = z.object({
  password: z.string().describe('The user-specified password to enhance.'),
});
export type EnhancePasswordInput = z.infer<typeof EnhancePasswordInputSchema>;

const EnhancePasswordOutputSchema = z.object({
  enhancedPassword: z.string().describe('The AI-suggested enhanced password.'),
  strengthScore: z.number().describe('A score from 0 to 1 indicating the strength of the enhanced password.'),
  explanation: z.string().describe('Explanation of why the password was enhanced and how its strength was improved.')
});
export type EnhancePasswordOutput = z.infer<typeof EnhancePasswordOutputSchema>;

export async function enhancePassword(input: EnhancePasswordInput): Promise<EnhancePasswordOutput> {
  return enhancePasswordFlow(input);
}

const enhancePasswordPrompt = ai.definePrompt({
  name: 'enhancePasswordPrompt',
  input: {schema: EnhancePasswordInputSchema},
  output: {schema: EnhancePasswordOutputSchema},
  prompt: `You are a password expert. A user will provide you with a password, and you will improve the password to make it more secure.

  Here are the password requirements you should consider:
  - The password should be at least 12 characters long.
  - The password should contain a mix of uppercase letters, lowercase letters, numbers, and symbols.
  - The password should not contain any personal information, such as the user's name or birthday.
  - The password should not be a common word or phrase.
  - Incorporate dictionary words or phrases where appropriate to make the password more memorable, but still secure.
  - Return a strength score between 0 and 1 indicating password strength, and an explanation of the enhancements you made.

  User password: {{{password}}}`,
});

const enhancePasswordFlow = ai.defineFlow(
  {
    name: 'enhancePasswordFlow',
    inputSchema: EnhancePasswordInputSchema,
    outputSchema: EnhancePasswordOutputSchema,
  },
  async input => {
    const {output} = await enhancePasswordPrompt(input);
    return output!;
  }
);
