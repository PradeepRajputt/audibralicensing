'use server';

/**
 * @fileOverview This file defines a Genkit flow for monitoring web pages for potential copyright infringements.
 *
 * The flow takes a URL and creator content as input, uses AI to scan the web page for copyright infringements,
 * and returns a report of potential infringements.
 *
 * @file         src/ai/flows/monitor-web-pages.ts
 * @exports      monitorWebPagesForCopyrightInfringements - A function that initiates the copyright infringement monitoring process.
 * @exports      MonitorWebPagesInput - The input type for the monitorWebPagesForCopyrightInfringements function.
 * @exports      MonitorWebPagesOutput - The return type for the monitorWebPagesForCopyrightInfringements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the monitorWebPagesForCopyrightInfringements function.
 */
const MonitorWebPagesInputSchema = z.object({
  url: z.string().describe('The URL of the web page to monitor.'),
  creatorContent: z.string().describe('The content created by the user (videos and text).'),
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
  input: {schema: MonitorWebPagesInputSchema},
  output: {schema: MonitorWebPagesOutputSchema},
  prompt: `You are an AI agent specializing in detecting copyright infringements on web pages.

  Your task is to analyze the content of a given web page and identify any potential copyright infringements
  based on the provided creator content.

  Provide a detailed report of your findings, including specific examples of potential infringements.

  Web Page URL: {{{url}}}
  Creator Content: {{{creatorContent}}}
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

