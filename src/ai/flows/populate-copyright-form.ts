'use server';

/**
 * @fileOverview This file defines a Genkit flow to automatically populate a copyright strike submission form
 * with details extracted by AI analysis of potential copyright infringements.
 *
 * @exports populateCopyrightStrikeForm - An async function that takes content details and returns a pre-filled copyright strike submission form.
 * @exports PopulateCopyrightStrikeFormInput - The input type for the populateCopyrightStrikeForm function.
 * @exports PopulateCopyrightStrikeFormOutput - The output type for the populateCopyrightStrikeForm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const PopulateCopyrightStrikeFormInputSchema = z.object({
  infringingContentUrl: z
    .string()
    .describe('URL of the content potentially infringing on the copyright.'),
  originalContentUrl: z
    .string()
    .describe('URL of the original copyrighted content.'),
  creatorName: z.string().describe('Name of the copyright holder.'),
  creatorContactEmail: z.string().describe('Contact email of the copyright holder.'),
  descriptionOfInfringement: z
    .string()
    .describe('Detailed description of the copyright infringement.'),
});
export type PopulateCopyrightStrikeFormInput = z.infer<typeof PopulateCopyrightStrikeFormInputSchema>;

// Define the output schema for the flow
const PopulateCopyrightStrikeFormOutputSchema = z.object({
  formFields: z.object({
    infringingContentTitle: z
      .string()
      .describe('Title of the infringing content.'),
    infringingContentDescription: z
      .string()
      .describe('Description of the infringing content.'),
    originalContentTitle: z.string().describe('Title of the original content.'),
    copyrightHolderName: z.string().describe('Name of the copyright holder.'),
    copyrightHolderContact: z.string().describe('Contact information of the copyright holder.'),
    copyrightDescription: z.string().describe('Description of the copyrighted work.'),
  }).describe('Pre-filled fields for the copyright strike submission form.'),
});
export type PopulateCopyrightStrikeFormOutput = z.infer<typeof PopulateCopyrightStrikeFormOutputSchema>;

// Exported function to trigger the flow
export async function populateCopyrightStrikeForm(input: PopulateCopyrightStrikeFormInput): Promise<PopulateCopyrightStrikeFormOutput> {
  return populateCopyrightStrikeFormFlow(input);
}

// Define the prompt
const populateCopyrightStrikeFormPrompt = ai.definePrompt({
  name: 'populateCopyrightStrikeFormPrompt',
  input: {schema: PopulateCopyrightStrikeFormInputSchema},
  output: {schema: PopulateCopyrightStrikeFormOutputSchema},
  prompt: `You are an AI assistant designed to automatically populate copyright strike submission forms.

  Based on the following information about the infringing content and the original content, extract the relevant details and populate the copyright strike submission form fields.

  Infringing Content URL: {{{infringingContentUrl}}}
  Original Content URL: {{{originalContentUrl}}}
  Creator Name: {{{creatorName}}}
  Creator Contact Email: {{{creatorContactEmail}}}
  Description of Infringement: {{{descriptionOfInfringement}}}

  Populate the following form fields with the extracted information:

  - infringingContentTitle: Title of the infringing content.
  - infringingContentDescription: Description of the infringing content.
  - originalContentTitle: Title of the original content.
  - copyrightHolderName: Name of the copyright holder.
  - copyrightHolderContact: Contact information of the copyright holder.
  - copyrightDescription: Description of the copyrighted work.

  Ensure that the information is accurate and complete.

  Return the populated form fields in JSON format.`,
});

// Define the flow
const populateCopyrightStrikeFormFlow = ai.defineFlow(
  {
    name: 'populateCopyrightStrikeFormFlow',
    inputSchema: PopulateCopyrightStrikeFormInputSchema,
    outputSchema: PopulateCopyrightStrikeFormOutputSchema,
  },
  async input => {
    const {output} = await populateCopyrightStrikeFormPrompt(input);
    return output!;
  }
);
