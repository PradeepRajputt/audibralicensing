
// Scans a YouTube channel for copyright infringements using AI.
//
// - scanYoutubeChannel - A function that scans a YouTube channel for copyright infringements.
// - ScanYoutubeChannelInput - The input type for the scanYoutubeChannel function.
// - ScanYoutubeChannelOutput - The return type for the scanYoutubeChannel function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ScanYoutubeChannelInputSchema = z.object({
  channelId: z.string().describe('The ID of the YouTube channel to scan.'),
  contentDescription: z.string().describe('The description of the content to protect.'),
});
export type ScanYoutubeChannelInput = z.infer<typeof ScanYoutubeChannelInputSchema>;

const ScanYoutubeChannelOutputSchema = z.object({
  infringementSummary: z.string().describe('A summary of potential copyright infringements found.'),
  flaggedVideos: z.array(
    z.object({
      videoId: z.string().describe('The ID of the video potentially infringing copyright.'),
      reason: z.string().describe('The reason why the video was flagged.'),
    })
  ).describe('A list of videos that potentially infringe copyright.'),
});
export type ScanYoutubeChannelOutput = z.infer<typeof ScanYoutubeChannelOutputSchema>;

export async function scanYoutubeChannel(input: ScanYoutubeChannelInput): Promise<ScanYoutubeChannelOutput> {
  return scanYoutubeChannelFlow(input);
}

const scanYoutubeChannelPrompt = ai.definePrompt({
  name: 'scanYoutubeChannelPrompt',
  input: {schema: ScanYoutubeChannelInputSchema},
  output: {schema: ScanYoutubeChannelOutputSchema},
  prompt: `You are an AI assistant designed to detect copyright infringements on YouTube.

You will be provided with a YouTube channel ID and a description of content to protect.

Your task is to analyze the channel's videos and identify any potential copyright infringements based on the provided content description.

Channel ID: {{{channelId}}}
Content Description: {{{contentDescription}}}

Provide a summary of potential copyright infringements found and a list of videos that potentially infringe copyright, including the reason why each video was flagged.

{{#if flaggedVideos}}
Flagged Videos:
{{#each flaggedVideos}}
- Video ID: {{{videoId}}}, Reason: {{{reason}}}
{{/each}}
{{/if}}
`,
});

const scanYoutubeChannelFlow = ai.defineFlow({
  name: 'scanYoutubeChannelFlow',
  inputSchema: ScanYoutubeChannelInputSchema,
  outputSchema: ScanYoutubeChannelOutputSchema,
}, async (input) => {
  const {output} = await scanYoutubeChannelPrompt(input);
  return output!;
});
