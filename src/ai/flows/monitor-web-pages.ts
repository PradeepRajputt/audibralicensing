
'use server';

/**
 * @fileOverview This file defines a Genkit flow for monitoring web pages for potential copyright infringements.
 *
 * The flow takes a URL and creator content (text, image, or video) as input, uses AI to scan the web page,
 * and returns a report of potential infringements.
 *
 * @file         src/ai/flows/monitor-web-pages.ts
 * @exports      monitorWebPagesForCopyrightInfringements - A function that initiates the copyright infringement monitoring process.
 * @exports      MonitorWebPagesInput - The input type for the monitorWebPagesForCopyrightInfringements function.
 * @exports      MonitorWebPagesOutput - The return type for the monitorWebPagesForCopyrightInfringements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fetchWebPageContent } from '@/ai/tools/web-scraper';

/**
 * Input schema for the monitorWebPagesForCopyrightInfringements function.
 */
const MonitorWebPagesInputSchema = z.object({
  url: z.string().describe('The URL of the web page to monitor.'),
  creatorContent: z.string().optional().describe('The text content created by the user.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo or video of the user's content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type MonitorWebPagesInput = z.infer<typeof MonitorWebPagesInputSchema>;

/**
 * Output schema for the monitorWebPagesForCopyrightInfringements function.
 */
const MonitorWebPagesOutputSchema = z.object({
  infringementReport: z
    .string()
    .describe('A report of potential copyright infringements found on the web page.'),
});

export type MonitorWebPagesOutput = z.infer<typeof MonitorWebPagesOutputSchema>;

/**
 * Wrapper function to initiate the copyright infringement monitoring process.
 * @param input - The input data for the monitoring process.
 * @returns A promise that resolves with the monitoring output.
 */
export async function monitorWebPagesForCopyrightInfringements(
  input: MonitorWebPagesInput
): Promise<MonitorWebPagesOutput> {
  return monitorWebPagesFlow(input);
}

/**
 * Prompt definition for the copyright infringement monitoring process.
 */
const monitorWebPagesPrompt = ai.definePrompt({
  name: 'monitorWebPagesPrompt',
  tools: [fetchWebPageContent],
  input: {schema: MonitorWebPagesInputSchema},
  output: {schema: MonitorWebPagesOutputSchema},
  prompt: `You are an AI agent specializing in detecting copyright infringements on web pages.

  Your task is to analyze the content of a given web page and identify any potential copyright infringements
  based on the provided creator content. The creator's content might be text, an image, or a video.
  
  First, use the fetchWebPageContent tool to get the content of the web page at the given URL. Then, compare the fetched content with the creator's content.

  If text content is provided, compare the text on the page to the provided text.
  If media content (image/video) is provided, visually scan the page for that media.

  Provide a detailed report of your findings, including specific examples of potential infringements. If no content could be fetched from the URL, state that in your report.

  Web Page URL: {{{url}}}
  
  {{#if creatorContent}}
  Creator's Text Content for comparison: {{{creatorContent}}}
  {{/if}}

  {{#if photoDataUri}}
  Creator's Media for comparison: {{media url=photoDataUri}}
  {{/if}}

  Report:
  `,
});

/**
 * Genkit flow definition for monitoring web pages for copyright infringements.
 */
const monitorWebPagesFlow = ai.defineFlow(
  {
    name: 'monitorWebPagesFlow',
    inputSchema: MonitorWebPagesInputSchema,
    outputSchema: MonitorWebPagesOutputSchema,
  },
  async input => {
    const {output} = await monitorWebPagesPrompt(input);
    return output!;
  }
);
