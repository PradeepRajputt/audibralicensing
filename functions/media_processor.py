import sys
import os
import json
import tempfile
import traceback
import subprocess
import platform
import ctypes
import ctypes.util
import shutil

# Cross-platform libc loader
def get_libc():
    system = platform.system()
    libc = None
    if system == "Linux":
        libc_name = ctypes.util.find_library("c")
        if libc_name is None:
            raise OSError("Could not find libc on Linux.")
        libc = ctypes.CDLL(libc_name)
    elif system == "Darwin":  # macOS
        libc_name = ctypes.util.find_library("c")
        if libc_name is None:
            raise OSError("Could not find libc on macOS.")
        libc = ctypes.CDLL(libc_name)
    elif system == "Windows":
        # Try ucrtbase first (modern), then msvcrt (legacy)
        for candidate in ["ucrtbase.dll", "msvcrt.dll"]:
            try:
                libc = ctypes.CDLL(candidate)
                break
            except OSError:
                continue
        if libc is None:
            raise OSError("Could not find a suitable C runtime on Windows (tried ucrtbase.dll, msvcrt.dll).")
    else:
        raise OSError(f"Unsupported platform: {system}")
    return libc

# Add audfprint path for audio fingerprinting
audfprint_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../audfprint"))
audfprint_py = os.path.join(audfprint_path, "audfprint.py")

def audio_fingerprint(file_path, dbase=None):
    if not os.path.exists(file_path):
        print("[ERROR] File does not exist:", file_path, file=sys.stderr)
        return None
    with tempfile.NamedTemporaryFile(delete=False, suffix='.afp') as tf:
        tfname = tf.name
    cmd = [
        sys.executable,
        audfprint_py,
        "new",
        "-o", tfname,
    ]
    if dbase:
        cmd += ["-d", dbase]
    cmd.append(file_path)
    print("[audio_fingerprint] Running cmd:", cmd, file=sys.stderr)
    try:
        result = subprocess.run(cmd, capture_output=True)
        print("[audio_fingerprint] subprocess stdout:", result.stdout.decode(errors='ignore'), file=sys.stderr)
        print("[audio_fingerprint] subprocess stderr:", result.stderr.decode(errors='ignore'), file=sys.stderr)
        if result.returncode != 0:
            print("[audio_fingerprint] audfprint failed", file=sys.stderr)
            return None
        with open(tfname, 'rb') as f:
            fp_bytes = f.read()
        os.remove(tfname)
        return fp_bytes.hex()[:128]
    except Exception as e:
        print("[audio_fingerprint] Exception:", e, file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        if os.path.exists(tfname):
            os.remove(tfname)
        return None

def video_phash(file_path, frame_interval=10):
    import sys
    print("[video_phash] Processing file:", file_path, file=sys.stderr)
    print("[video_phash] File exists:", os.path.exists(file_path), file=sys.stderr)
    if os.path.exists(file_path):
        file_size = os.path.getsize(file_path)
        print("[video_phash] File size (bytes):", file_size, file=sys.stderr)
        # Skip processing if file is larger than 500MB
        if file_size > 500 * 1024 * 1024:
            print("[video_phash] File too large (>500MB), skipping hash generation.", file=sys.stderr)
            return []
    try:
        import cv2
        import imagehash
        from PIL import Image
        vidcap = cv2.VideoCapture(file_path)
        fps = vidcap.get(cv2.CAP_PROP_FPS)
        frame_count = int(vidcap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps if fps else 0
        print(f"[video_phash] fps: {fps}, frame_count: {frame_count}, duration: {duration}", file=sys.stderr)
        hashes = []
        max_frames = 100
        for i, sec in enumerate(range(0, int(duration), frame_interval)):
            if i >= max_frames:
                break
            vidcap.set(cv2.CAP_PROP_POS_MSEC, sec * 1000)
            success, image = vidcap.read()
            print(f"[video_phash] Extracting frame at {sec}s: {'Success' if success else 'Fail'}", file=sys.stderr)
            if success:
                pil_img = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
                hash_str = str(imagehash.phash(pil_img))
                hashes.append(hash_str)
        vidcap.release()
        print(f"[video_phash] Total hashes generated: {len(hashes)}", file=sys.stderr)
        return hashes
    except Exception as e:
        print("[video_phash] Exception:", e, file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return []

def transcribe_and_embed(file_path, language=None):
    print("[transcribe_and_embed] Processing file:", file_path, file=sys.stderr)
    print("[transcribe_and_embed] File exists:", os.path.exists(file_path), file=sys.stderr)
    import sys as _sys
    try:
        # Warn if on Windows and Python >= 3.13
        if platform.system() == 'Windows' and _sys.version_info >= (3, 13):
            print("[transcribe_and_embed][WARNING] Python 3.13+ on Windows is not fully supported by Whisper/ffmpeg/ctypes. Please use Python 3.10 for best compatibility.", file=sys.stderr)
        import whisper
        from sentence_transformers import SentenceTransformer
        model = whisper.load_model('base')
        result = model.transcribe(file_path, language=language)
        transcript = result['text']
        embedder = SentenceTransformer('all-MiniLM-L6-v2')
        embedding = embedder.encode([transcript])[0]
        return transcript, embedding.tolist()
    except Exception as e:
        print("[transcribe_and_embed] Exception:", e, file=sys.stderr)
        if platform.system() == 'Windows' and _sys.version_info >= (3, 13):
            print("[transcribe_and_embed][ERROR] This error may be due to Python 3.13 incompatibility with Whisper/ffmpeg/ctypes on Windows. Please downgrade to Python 3.10 and reinstall dependencies.", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return '', []

def extract_audio_ffmpeg(file_path):
    temp_audio = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    temp_audio.close()
    output_path = temp_audio.name
    ffmpeg_cmd = [
        "ffmpeg",
        "-y",  # overwrite
        "-i", file_path,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        output_path
    ]
    try:
        result = subprocess.run(
            ffmpeg_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
    except subprocess.CalledProcessError as e:
        print("[extract_audio_ffmpeg] FFmpeg error:")
        print(e.stderr)
        raise Exception("FFmpeg audio extraction failed")
    return output_path

def text_from_media(file_path, language=None):
    """
    For scanType='text':
    1. Extract audio from media file (if needed)
    2. Transcribe with Whisper
    3. Generate embedding
    """
    import tempfile
    import os
    import sys as _sys
    transcript = ''
    embedding = []
    temp_audio = None
    try:
        # If file is already .wav or .mp3, use as is. Else, extract audio.
        ext = os.path.splitext(file_path)[1].lower()
        if ext in ['.wav', '.mp3']:
            audio_path = file_path
        else:
            # Extract audio to temp wav
            audio_path = extract_audio_ffmpeg(file_path)
            temp_audio = audio_path
        # Transcribe and embed
        import whisper
        from sentence_transformers import SentenceTransformer
        model = whisper.load_model('base')
        result = model.transcribe(audio_path, language=language)
        transcript = result['text']
        embedder = SentenceTransformer('all-MiniLM-L6-v2')
        embedding = embedder.encode([transcript])[0]
    except Exception as e:
        print(f"[text_from_media] Exception: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
    finally:
        if temp_audio and os.path.exists(temp_audio):
            os.remove(temp_audio)
    return transcript, embedding

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Media Processor')
    parser.add_argument('--file', required=True, help='Path to media file')
    parser.add_argument('--type', required=True, choices=['audio', 'video', 'transcript', 'text'], help='Processing type')
    parser.add_argument('--language', required=False, help='Language for transcription (optional)')
    parser.add_argument('--dbase', required=False, help='Database file for audfprint (optional)')
    args = parser.parse_args()

    result = {}
    try:
        if args.type == 'audio':
            result['audioHash'] = audio_fingerprint(args.file, args.dbase)
        elif args.type == 'video':
            result['videoHashes'] = video_phash(args.file)
        elif args.type == 'transcript':
            transcript, embedding = transcribe_and_embed(args.file, args.language)
            result['transcript'] = transcript
            result['embedding'] = embedding
        elif args.type == 'text':
            print('[main] Text scan type received; extracting audio and transcribing.', file=sys.stderr)
            transcript, embedding = text_from_media(args.file, args.language)
            result['scanType'] = 'text'
            result['transcript'] = transcript
            result['embedding'] = embedding
        print(json.dumps(result))  # Only JSON to stdout!
    except Exception as e:
        print("[main] Exception:", e, file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({'error': str(e), 'trace': traceback.format_exc()}))
        sys.exit(1)

if __name__ == '__main__':
    main()