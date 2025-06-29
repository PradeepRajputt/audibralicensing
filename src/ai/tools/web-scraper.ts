'use server';
/**
 * @fileOverview A tool for fetching content from a web page.
 *
 * - fetchWebPageContent - A Genkit tool that fetches the text content of a given URL.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';
import { JSDOM } from 'jsdom';

export const fetchWebPageContent = ai.defineTool(
  {
    name: 'fetchWebPageContent',
    description: 'Fetches the text content from a given URL. Use this to get the content of a webpage to analyze.',
    inputSchema: z.object({ url: z.string().url().describe('The URL of the web page to fetch.') }),
    outputSchema: z.string().describe('The text content of the web page.'),
  },
  async ({ url }) => {
    try {
      const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const dom = new JSDOM(response.data);
      // Remove script and style elements
      dom.window.document.querySelectorAll('script, style').forEach(el => el.remove());
      // Get text content
      return dom.window.document.body.textContent || '';
    } catch (error) {
      console.error(`Error fetching URL ${url}:`, error);
      return `Failed to fetch content from the URL. The website might be down or blocking requests.`;
    }
  }
);
