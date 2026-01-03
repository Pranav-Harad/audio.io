# Use Python 3.10 (Crucial for Coqui TTS)
FROM python:3.10-slim

# Install FFmpeg and Git
RUN apt-get update && apt-get install -y ffmpeg git && rm -rf /var/lib/apt/lists/*

# Setup User for Hugging Face Security (Cannot run as root)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Copy Requirements & Install
COPY --chown=user requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy Code
COPY --chown=user . .

# Create Writable Folders (Volumes)
RUN mkdir -p temp_uploads generated_audio tts_models

EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]