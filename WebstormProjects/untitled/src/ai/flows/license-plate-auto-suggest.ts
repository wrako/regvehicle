'use server';
/**
 * @fileOverview An AI agent that suggests license plate numbers as the user types.
 *
 * - suggestLicensePlate - A function that suggests license plate numbers based on a given input.
 * - SuggestLicensePlateInput - The input type for the suggestLicensePlate function.
 * - SuggestLicensePlateOutput - The return type for the suggestLicensePlate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLicensePlateInputSchema = z.object({
  partialLicensePlate: z
    .string()
    .describe('The partial license plate number to suggest completions for.'),
});
export type SuggestLicensePlateInput = z.infer<typeof SuggestLicensePlateInputSchema>;

const SuggestLicensePlateOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested license plate numbers.'),
});
export type SuggestLicensePlateOutput = z.infer<typeof SuggestLicensePlateOutputSchema>;

export async function suggestLicensePlate(
  input: SuggestLicensePlateInput
): Promise<SuggestLicensePlateOutput> {
  return suggestLicensePlateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLicensePlatePrompt',
  input: {schema: SuggestLicensePlateInputSchema},
  output: {schema: SuggestLicensePlateOutputSchema},
  prompt: `You are a helpful assistant that suggests license plate numbers based on existing data.

  Given the partial license plate number "{{partialLicensePlate}}", suggest up to 5 possible completions based on common Slovak license plate formats.
  Return the suggestions as an array of strings.
  If there are no likely completions, return an empty array.
  The suggestions should be valid Slovak license plates, starting with two or three letters, followed by three numbers, and then two letters. Examples: KE123AA, DS987BB. All suggestions must be in uppercase.
`,
});

const suggestLicensePlateFlow = ai.defineFlow(
  {
    name: 'suggestLicensePlateFlow',
    inputSchema: SuggestLicensePlateInputSchema,
    outputSchema: SuggestLicensePlateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
