import torch
import warnings
import os
import shutil
import uvicorn
import traceback
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from TTS.api import TTS
from spleeter.separator import Separator

# --- 1. TORCH HACK (Keep this for XTTS compatibility) ---
# Force torch.load to allow loading the older XTTS model files safely
_original_load = torch.load
def safe_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return _original_load(*args, **kwargs)
torch.load = safe_load
# -----------------------------------------------------------

# --- GLOBAL VARIABLES ---
tts = None
separator = None

# --- LIFESPAN MANAGER ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    global tts, separator
    
    # 1. LOAD XTTS-v2
    print("⏳ Loading 'XTTS-v2' Model...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"🚀 AI running on: {device.upper()}")
    
    try:
        # Load model with specific config to avoid re-downloading if possible
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
        print("✅ XTTS Model Loaded.")
    except Exception as e:
        print(f"❌ Failed to load XTTS: {e}")

    # 2. LOAD SPLEETER
    print("⏳ Loading Spleeter (2-stems)...")
    try:
        separator = Separator('spleeter:2stems')
        print("✅ Spleeter Loaded.")
    except Exception as e:
        print(f"❌ Failed to load Spleeter: {e}")
    
    yield
    print("🛑 Shutting down models...")

# Initialize App
app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for now (Backend proxies requests)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Directories
os.makedirs("temp_uploads", exist_ok=True)
os.makedirs("generated_audio", exist_ok=True)
os.makedirs("generated_audio/stems", exist_ok=True)

# Mount Static Files (So the internet can download the generated audio)
app.mount("/generated_audio", StaticFiles(directory="generated_audio"), name="generated_audio")

# --- HELPER: GET PUBLIC URL ---
def get_base_url():
    # Hugging Face Spaces provides 'SPACE_HOST' env var automatically
    space_host = os.getenv("SPACE_HOST")
    if space_host:
        return f"https://{space_host}"
    return "http://localhost:7860" # Fallback for local testing

@app.get("/")
def home():
    return {"status": "online", "message": "Audio.io AI Service Running"}

# --- ROUTE 1: VOICE CLONING ---
@app.post("/clone-voice")
async def clone_voice(text: str = Form(...), audio_file: UploadFile = File(...)):
    global tts
    if tts is None:
        return {"error": "TTS Model is not loaded."}

    try:
        # 1. Save Reference Audio
        temp_filename = f"temp_uploads/{audio_file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        
        absolute_path = os.path.abspath(temp_filename)
        output_filename = f"generated_audio/output_{audio_file.filename}.wav"
        
        print(f"🎤 Processing: {text[:20]}...")

        # 2. Generate Audio
        tts.tts_to_file(
            text=text,
            file_path=output_filename,
            speaker_wav=absolute_path,
            language="en",
            split_sentences=True
        )
        
        # 3. Return File
        if os.path.exists(output_filename) and os.path.getsize(output_filename) > 0:
            return FileResponse(output_filename, media_type="audio/wav", filename="cloned_voice.wav")
        else:
            return {"error": "TTS generation failed (File empty)."}

    except Exception as e:
        print(f"❌ XTTS Error: {str(e)}")
        traceback.print_exc()
        return {"error": str(e)}

# --- ROUTE 2: VOCAL SEPARATOR ---
@app.post("/separate-vocals")
async def separate_vocals(audio_file: UploadFile = File(...)):
    global separator
    if separator is None:
        return {"error": "Spleeter Model is not loaded."}

    try:
        # 1. Save Input
        input_path = f"temp_uploads/{audio_file.filename}"
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
            
        filename_no_ext = os.path.splitext(audio_file.filename)[0]
        output_dir = "generated_audio/stems"
        
        # 2. Run Separation
        # Note: Spleeter creates a subdirectory named after the file
        separator.separate_to_file(input_path, output_dir)
        
        # 3. Construct Public URLs
        base_url = get_base_url()
        
        # Check if files exist before returning URL
        vocals_path = f"{output_dir}/{filename_no_ext}/vocals.wav"
        music_path = f"{output_dir}/{filename_no_ext}/accompaniment.wav"
        
        return {
            "status": "success", 
            # 🟢 CHANGED: Uses dynamic Base URL
            "vocals": f"{base_url}/generated_audio/stems/{filename_no_ext}/vocals.wav",
            "music": f"{base_url}/generated_audio/stems/{filename_no_ext}/accompaniment.wav"
        }

    except Exception as e:
        print(f"❌ Separation Error: {e}")
        traceback.print_exc()
        return {"error": str(e)}

if __name__ == "__main__":
    # 🟢 CHANGED: Default port 7860 (Standard for Hugging Face)
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)