# Use Python 3.10 (Required for Coqui TTS)
FROM python:3.10-slim

# 1. Install System Dependencies (FFmpeg is critical)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# 2. Setup Security: Create a user 'user' with ID 1000
# Hugging Face Spaces will fail if you run as root!
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# 3. Install Python Dependencies
COPY --chown=user requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# 4. Copy Code
COPY --chown=user . .

# 5. Create Temp Folders for Audio (These are the "Volumes")
RUN mkdir -p temp_uploads generated_audio tts_models

# 6. Expose Port 7860 (Standard for Hugging Face)
EXPOSE 7860

# 7. Start Command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]