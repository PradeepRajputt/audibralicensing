from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
import subprocess
import sys
import json
from pydantic import BaseModel
import whisper

app = FastAPI()

# CORS for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job store (for demo)
jobs = {}

def transcribe_job(job_id, file_path):
    try:
        model = whisper.load_model("base")
        result = model.transcribe(file_path)
        transcript = result.get('text', '')
        jobs[job_id] = {"status": "done", "transcript": transcript}
    except Exception as e:
        jobs[job_id] = {"status": "error", "error": str(e)}
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

class TextScanRequest(BaseModel):
    url: str

@app.post("/scan/text")
async def scan_text(request: TextScanRequest):
    file_path = request.url
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": f"File not found: {file_path}"}, status_code=404)
    try:
        model = whisper.load_model("base")
        result = model.transcribe(file_path)
        transcript = result.get('text', '')
        return {"transcript": transcript}
    except Exception as e:
        return JSONResponse(content={"error": f"Whisper transcription failed: {str(e)}"}, status_code=500)

@app.post("/scan/text/upload")
async def scan_text_upload(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    temp_filename = f"/tmp/{uuid.uuid4()}_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "processing"}
    background_tasks.add_task(transcribe_job, job_id, temp_filename)
    return {"job_id": job_id}

@app.get("/scan/text/result/{job_id}")
async def scan_text_result(job_id: str):
    job = jobs.get(job_id)
    if not job:
        return JSONResponse(content={"error": "Job not found"}, status_code=404)
    return job

@app.post("/api/scan/upload")
async def scan_upload(file: UploadFile = File(...)):
    temp_filename = f"/tmp/{uuid.uuid4()}_{file.filename}"
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        # Call media_processor.py as a subprocess
        result = subprocess.run(
            [sys.executable, "media_processor.py", "--file", temp_filename, "--type", "video"],
            capture_output=True,
            text=True
        )
        os.remove(temp_filename)
        if result.returncode != 0:
            return JSONResponse(content={"status": "error", "error": result.stderr}, status_code=500)
        # Try to parse the output as JSON
        try:
            matches = json.loads(result.stdout)
        except Exception:
            matches = {"raw": result.stdout}
        return JSONResponse(content={"status": "success", "matches": matches})
    except Exception as e:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        return JSONResponse(content={"status": "error", "error": str(e)}, status_code=500) 