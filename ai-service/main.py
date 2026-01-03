
import torch
import warnings

# Force torch.load to allow loading the older XTTS model files safely
_original_load = torch.load
def safe_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return _original_load(*args, **kwargs)
torch.load = safe_load
# -----------------------------------------------------------

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from TTS.api import TTS
from spleeter.separator import Separator
import uvicorn
import os
import shutil

# --- GLOBAL VARIABLES (Initially None) ---
tts = None
separator = None

# --- LIFESPAN MANAGER (Prevents Windows Freeze) ---
# This runs ONLY when the server starts, not in background processes
@asynccontextmanager
async def lifespan(app: FastAPI):
    global tts, separator
    
    # 1. LOAD XTTS-v2 (Voice Cloning)
    print("⏳ Loading 'XTTS-v2' Model...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"🚀 AI running on: {device.upper()}")
    
    # Load the model strictly inside this function
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=(device == "cuda"))
    print("✅ XTTS Model Loaded.")

    # 2. LOAD SPLEETER (Vocal Remover)
    print("⏳ Loading Spleeter (2-stems)...")
    separator = Separator('spleeter:2stems')
    print("✅ Spleeter Loaded.")
    
    yield
    
    # Clean up when server stops
    print("🛑 Shutting down models...")

# Initialize FastAPI with the lifespan
app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create folders
os.makedirs("temp_uploads", exist_ok=True)
os.makedirs("generated_audio", exist_ok=True)
os.makedirs("generated_audio/stems", exist_ok=True)

# Mount generated_audio so files can be accessed by frontend
app.mount("/generated_audio", StaticFiles(directory="generated_audio"), name="generated_audio")

@app.get("/")
def home():
    return {"status": "online", "message": "Audio.io AI Service Running"}

# --- ROUTE 1: VOICE CLONING ---
@app.post("/clone-voice")
async def clone_voice(text: str = Form(...), audio_file: UploadFile = File(...)):
    global tts
    # 1. Check if model is loaded
    if tts is None:
        print("❌ Error: Model was None!")
        return {"error": "Model is still loading, please wait."}

    try:
        # 2. Verify Upload
        print(f"📥 Received file: {audio_file.filename}")
        temp_filename = f"temp_uploads/{audio_file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        
        absolute_path = os.path.abspath(temp_filename)
        output_filename = f"generated_audio/output_{audio_file.filename}.wav"
        
        print(f"🎤 Processing Text: {text[:30]}...")
        print(f"📍 Reference Audio: {absolute_path}")

        # 3. Generate
        tts.tts_to_file(
            text=text,
            file_path=output_filename,
            speaker_wav=absolute_path,
            language="en",
            split_sentences=True
        )
        
        # 4. Verify Output
        if os.path.exists(output_filename) and os.path.getsize(output_filename) > 0:
            print(f"✅ Success! File created at: {output_filename}")
            return FileResponse(output_filename, media_type="audio/wav", filename="cloned_voice.wav")
        else:
            print("❌ Error: File was not created by TTS engine.")
            return {"error": "TTS failed to create audio file"}

    except Exception as e:
        # 5. CATCH AND PRINT EVERYTHING
        print(f"\n\n❌ CRITICAL ERROR IN TERMINAL: {str(e)}\n\n")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
    
# --- ROUTE 2: VOCAL SEPARATOR ---
@app.post("/separate-vocals")
async def separate_vocals(audio_file: UploadFile = File(...)):
    global separator
    if separator is None:
        return {"error": "Model is still loading, please wait."}

    try:
        # Save input
        input_path = f"temp_uploads/{audio_file.filename}"
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
            
        # Spleeter creates a folder named after the file
        filename_no_ext = os.path.splitext(audio_file.filename)[0]
        output_dir = "generated_audio/stems"
        
        # Run Separation
        separator.separate_to_file(input_path, output_dir)
        
        # Return URLs
        return {
            "status": "success", 
            "vocals": f"http://localhost:8000/generated_audio/stems/{filename_no_ext}/vocals.wav",
            "music": f"http://localhost:8000/generated_audio/stems/{filename_no_ext}/accompaniment.wav"
        }

    except Exception as e:
        print(f"❌ Separation Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)