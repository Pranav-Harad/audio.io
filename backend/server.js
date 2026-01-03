require('dotenv').config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const ffmpeg = require('fluent-ffmpeg'); 

// --- CONFIGURATION ---
const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI; 
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

// 🟢 NEW: Get AI Service URL from Environment (Render) or default to localhost
const AI_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const app = express();
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const upload = multer({ dest: "uploads/" });

// 🟢 NEW: CORS Configuration to allow Vercel Frontend
app.use(cors({ 
  origin: [
    "http://localhost:5173",             // Localhost for testing
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL             // <--- Vercel URL from Render Env Vars
  ], 
  credentials: true 
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Schemas
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", UserSchema);

// Auth Routes
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ error: "User exists" });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Register failed" }); }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).json({ error: "Login failed" }); }
});

app.post("/api/google-login", async (req, res) => {
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: req.body.token, audience: GOOGLE_CLIENT_ID });
    const { name, email, sub } = ticket.getPayload();
    let user = await User.findOne({ email });
    if (!user) user = await User.create({ name, email, password: await bcrypt.hash(sub, 10) });
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { res.status(401).json({ error: "Google Auth Failed" }); }
});

// --- AUDIO STUDIO ROUTES ---

// 1. Process Audio (Speed, Pitch, Trim) via FFmpeg
app.post("/api/process-audio", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  
  const { operation, value } = req.body; 
  const inputPath = req.file.path;
  const outputFilename = `processed-${Date.now()}.mp3`;
  const outputPath = path.join(__dirname, "uploads", outputFilename);

  let command = ffmpeg(inputPath);

  if (operation === "speed") {
    // value: 0.5 to 2.0
    command.audioFilters(`atempo=${value}`);
  } 
  else if (operation === "pitch") {
    // value: 0.5 (low) to 1.5 (high). 
    command.audioFilters(`asetrate=44100*${value},aresample=44100`);
  }
  else if (operation === "trim") {
    // value format: "start,duration" e.g., "0,10"
    const [start, duration] = value.split(",");
    command.setStartTime(parseInt(start)).setDuration(parseInt(duration));
  }

  command
    .save(outputPath)
    .on("end", () => {
      res.json({ success: true, downloadUrl: `/uploads/${outputFilename}` });
    })
    .on("error", (err) => {
      console.error("FFmpeg Error:", err);
      res.status(500).json({ error: "Processing failed" });
    });
});

// 2. Vocal Remover (Proxy to Python)
app.post("/api/remove-vocals", upload.single("audio"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("audio_file", fs.createReadStream(req.file.path));

    // 🟢 CHANGED: Uses Dynamic AI_URL variable
    const aiRes = await axios.post(`${AI_URL}/separate-vocals`, formData, {
      headers: { ...formData.getHeaders() }
    });

    res.json(aiRes.data); // Forward Python response (urls) to Frontend
  } catch (err) {
    console.error("Vocal Remover Error:", err);
    res.status(500).json({ error: "Failed to separate vocals" });
  }
});

// 3. TTS Route
app.post("/api/synthesize", upload.single("audio"), async (req, res) => {
  try {
    // 1. Get Text (it might come from req.body.text via JSON or FormData)
    const text = req.body.text;
    if (!text) return res.status(400).json({ error: "Missing text" });

    console.log("🎤 Generating TTS...");

    // 2. Prepare Data for Python
    const formData = new FormData();
    formData.append("text", text);

    // CHANGE: Check if user uploaded a file. If NOT, use default.
    if (req.file) {
      // Case A: User uploaded a file (Voice Cloning future-proofing)
      formData.append("audio_file", fs.createReadStream(req.file.path));
    } else {
      // Case B: No file uploaded -> Use DEFAULT VOICE
      // Make sure 'default_voice.wav' exists in your root folder!
      const defaultVoicePath = path.join(__dirname, "default_voice.wav"); 
      
      if (!fs.existsSync(defaultVoicePath)) {
        return res.status(500).json({ error: "Server missing default voice file!" });
      }
      formData.append("audio_file", fs.createReadStream(defaultVoicePath));
    }

    // 🟢 CHANGED: Uses Dynamic AI_URL variable
    const aiResponse = await axios.post(`${AI_URL}/clone-voice`, formData, {
      headers: { ...formData.getHeaders() },
      responseType: 'arraybuffer' 
    });

    // 4. Save Result
    const outputFilename = `tts-${Date.now()}.wav`;
    const outputPath = path.join(__dirname, "uploads", outputFilename);
    fs.writeFileSync(outputPath, aiResponse.data);

    res.json({ success: true, downloadUrl: `/uploads/${outputFilename}` });

  } catch (err) {
    console.error("TTS Error:", err.message);
    res.status(500).json({ error: "TTS Generation Failed" });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`Node.js Server running on port ${PORT}`));