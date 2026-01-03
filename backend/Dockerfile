FROM node:18-slim

# Install FFmpeg for audio processing
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create uploads folder
RUN mkdir -p uploads

CMD ["node", "server.js"]