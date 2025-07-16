import sys
import os
import json
import tempfile
import traceback
import subprocess

# Add audfprint path for audio fingerprinting
audfprint_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../audfprint"))
audfprint_py = os.path.join(audfprint_path, "audfprint.py")

def audio_fingerprint(file_path):
    if not os.path.exists(file_path):
        print("[ERROR] File does not exist:", file_path, file=sys.stderr)
        return None
    with tempfile.NamedTemporaryFile(delete=False, suffix='.afp') as tf:
        tfname = tf.name
    cmd = [
        sys.executable,
        audfprint_py,
        "new",  # or "fp" if that's the correct subcommand for your version
        "-o", tfname,
        file_path
    ]
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
    try:
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
        traceback.print_exc(file=sys.stderr)
        return '', []

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Media Processor')
    parser.add_argument('--file', required=True, help='Path to media file')
    parser.add_argument('--type', required=True, choices=['audio', 'video', 'transcript'], help='Processing type')
    parser.add_argument('--language', required=False, help='Language for transcription (optional)')
    args = parser.parse_args()

    result = {}
    try:
        if args.type == 'audio':
            result['audioHash'] = audio_fingerprint(args.file)
        elif args.type == 'video':
            result['videoHashes'] = video_phash(args.file)
        elif args.type == 'transcript':
            transcript, embedding = transcribe_and_embed(args.file, args.language)
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