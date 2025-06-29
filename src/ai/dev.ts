import { config } from 'dotenv';
config();

import '@/ai/flows/populate-copyright-form.ts';
import '@/ai/flows/scan-youtube-channel-for-copyright-infringements.ts';
import '@/ai/flows/monitor-web-pages.ts';