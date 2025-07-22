import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';

// Download YouTube video using yt-dlp
export async function downloadYoutubeVideo(youtubeUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outDir = os.tmpdir();
    const outPath = path.join(outDir, `ytvideo_${uuidv4()}.mp4`);
    // Force mp4 output for best compatibility
    const ytdlp = spawn('yt-dlp', [
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
      '--merge-output-format', 'mp4',
      '-o', outPath,
      youtubeUrl
    ]);
    ytdlp.on('close', (code) => {
      if (code === 0 && fs.existsSync(outPath)) {
        resolve(outPath);
      } else {
        reject(new Error('yt-dlp failed to download video.'));
      }
    });
    ytdlp.on('error', reject);
  });
}

// Extract audio from video using ffmpeg
export async function extractAudio(videoPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outDir = os.tmpdir();
    // Ensure the output file has a valid .wav extension
    const outPath = path.join(outDir, `ytaudio_${uuidv4()}.wav`);
    console.log('[extractAudio] FFmpeg output path:', outPath);
    if (!outPath.endsWith('.wav')) {
      return reject(new Error('Output path must have .wav extension: ' + outPath));
    }
    ffmpeg(videoPath)
      .setFfmpegPath(ffmpegPath as string)
      .noVideo()
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(16000)
      .format('wav')
      .on('end', () => {
        if (fs.existsSync(outPath)) {
          resolve(outPath);
        } else {
          reject(new Error('FFmpeg did not create output file: ' + outPath));
        }
      })
      .on('error', (err, stdout, stderr) => {
        let details = '';
        if (err) details += err.message + '\n';
        if (stdout) details += 'stdout: ' + stdout + '\n';
        if (stderr) details += 'stderr: ' + stderr + '\n';
        // Add more context for common ffmpeg errors
        if (details.includes('Invalid argument')) {
          details += '\n[extractAudio] FFmpeg Invalid argument: Check output path, permissions, and disk space.';
        }
        reject(new Error('FFmpeg error: ' + details));
      })
      .save(outPath);
  });
}

// Call Python script for audio hash
export async function processAudio(audioPath: string): Promise<{ audioHash: string }> {
  return runPythonProcessor(audioPath, 'audio');
}

// Call Python script for video hash
export async function processVideo(videoPath: string): Promise<{ videoHashes: string[] }> {
  return runPythonProcessor(videoPath, 'video');
}

// Call Python script for transcript/embedding
export async function processTranscript(audioPath: string, language?: string): Promise<{ transcript: string, embedding: number[] }> {
  return runPythonProcessor(audioPath, 'transcript', language);
}

// Helper to call Python script
async function runPythonProcessor(filePath: string, type: 'audio'|'video'|'transcript', language?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const args = [
      path.resolve('functions/media_processor.py'),
      '--file', filePath,
      '--type', type
    ];
    if (language && type === 'transcript') {
      args.push('--language', language);
    }
    // Add --dbase for audio type
    if (type === 'audio') {
      const dbPath = path.join(os.tmpdir(), `audfprint_db_${uuidv4()}.afp`);
      args.push('--dbase', dbPath);
    }
    const python = spawn('py', args);
    let stdout = '';
    let stderr = '';
    python.stdout.on('data', (data) => { stdout += data.toString(); });
    python.stderr.on('data', (data) => { stderr += data.toString(); });
    python.on('close', (code) => {
      console.log(`[Python ${type}] exit code:`, code);
      console.log(`[Python ${type}] stdout:`, stdout);
      console.log(`[Python ${type}] stderr:`, stderr);
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse Python output: ' + stdout));
        }
      } else {
        reject(new Error('Python script failed: ' + stderr));
      }
    });
    python.on('error', reject);
  });
} 