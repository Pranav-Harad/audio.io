# Use Node v18
FROM node:18-slim

# 1. Install FFmpeg (Backend needs this to process audio uploads)
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

# 2. Install Dependencies
COPY package*.json ./
RUN npm install

# 3. Copy Source Code
COPY . .

# 4. Create Uploads Folder (Temporary Storage)
RUN mkdir -p uploads

# 5. Start Server
# Render will automatically inject the PORT variable
CMD ["node", "server.js"]