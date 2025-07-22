// Optimized media processing with dynamic imports to reduce bundle size
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Dynamic imports for heavy dependencies - only load when needed
const loadFFmpeg = async () => {
  const [ffmpegPath, ffmpeg] = await Promise.all([
    import('ffmpeg-static'),
    import('fluent-ffmpeg')
  ]);
  return { ffmpegPath: ffmpegPath.default, ffmpeg: ffmpeg.default };
};

// Lazy load YouTube processing
export const loadYouTubeProcessor = async () => {
  // Only import when actually needed
  const { ffmpegPath, ffmpeg } = await loadFFmpeg();
  
  return {
    async downloadYoutubeVideo(youtubeUrl: string): Promise<string> {
      return new Promise((resolve, reject) => {
        const outDir = os.tmpdir();
        const outPath = path.join(outDir, `ytvideo_${uuidv4()}.mp4`);
        
        // Use yt-dlp with optimized settings
        const ytdlp = spawn('yt-dlp', [
          '-f', 'bestvideo[height<=720]+bestaudio[ext=m4a]/mp4[height<=720]', // Limit quality for faster processing
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
    },

    async processVideo(inputPath: string, outputPath: string): Promise<void> {
      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .setFfmpegPath(ffmpegPath)
          .outputOptions([
            '-c:v libx264',
            '-preset fast', // Faster encoding
            '-crf 28', // Balanced quality/size
            '-c:a aac',
            '-b:a 128k'
          ])
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
    }
  };
};

// Lightweight video info extraction without loading full ffmpeg
export async function getVideoInfo(filePath: string): Promise<{
  duration?: number;
  width?: number;
  height?: number;
  size: number;
}> {
  try {
    const stats = fs.statSync(filePath);
    
    // Use ffprobe for basic info (lighter than full ffmpeg)
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        filePath
      ]);
      
      let output = '';
      ffprobe.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      ffprobe.on('close', (code) => {
        if (code === 0) {
          try {
            const info = JSON.parse(output);
            const videoStream = info.streams.find((s: any) => s.codec_type === 'video');
            
            resolve({
              duration: parseFloat(info.format.duration),
              width: videoStream?.width,
              height: videoStream?.height,
              size: stats.size
            });
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('ffprobe failed'));
        }
      });
    });
  } catch (error) {
    // Fallback to basic file info
    const stats = fs.statSync(filePath);
    return { size: stats.size };
  }
}

// Audio fingerprinting with dynamic import
export const loadAudioProcessor = async () => {
  // Only load when needed
  return {
    async generateFingerprint(audioPath: string): Promise<string> {
      return new Promise((resolve, reject) => {
        // Use audfprint for audio fingerprinting
        const audfprint = spawn('python3', [
          path.join(process.cwd(), 'audfprint', 'audfprint.py'),
          'new',
          '--dbase', '/tmp/fingerprints.db',
          audioPath
        ]);
        
        let output = '';
        audfprint.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        audfprint.on('close', (code) => {
          if (code === 0) {
            resolve(output.trim());
          } else {
            reject(new Error('Audio fingerprinting failed'));
          }
        });
        
        audfprint.on('error', reject);
      });
    },
    
    async matchFingerprint(queryPath: string, dbPath: string): Promise<any[]> {
      return new Promise((resolve, reject) => {
        const audfprint = spawn('python3', [
          path.join(process.cwd(), 'audfprint', 'audfprint.py'),
          'match',
          '--dbase', dbPath,
          queryPath
        ]);
        
        let output = '';
        audfprint.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        audfprint.on('close', (code) => {
          if (code === 0) {
            try {
              // Parse audfprint output
              const matches = output.split('\n')
                .filter(line => line.includes('Matched'))
                .map(line => {
                  const parts = line.split(' ');
                  return {
                    file: parts[1],
                    confidence: parseFloat(parts[3]) || 0
                  };
                });
              resolve(matches);
            } catch (error) {
              resolve([]);
            }
          } else {
            reject(new Error('Audio matching failed'));
          }
        });
        
        audfprint.on('error', reject);
      });
    }
  };
};

// Utility functions that don't require heavy dependencies
export function cleanupTempFiles(filePaths: string[]): void {
  filePaths.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn(`Failed to cleanup temp file: ${filePath}`, error);
    }
  });
}

export function generateTempPath(extension: string = 'tmp'): string {
  return path.join(os.tmpdir(), `temp_${uuidv4()}.${extension}`);
}