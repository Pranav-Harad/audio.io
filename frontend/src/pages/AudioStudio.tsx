import { useState } from "react";
import axios from "axios";
import { Upload, Music, Mic, Scissors, FastForward, Loader2, RefreshCw, Wand2, Download } from "lucide-react";
import Sidebar from "../components/Sidebar";
import AudioWaveform from "../components/AudioWaveform";

export default function AudioStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0); // Total duration of audio
  
  // Tools state
  const [tool, setTool] = useState("vocal"); // Default tool
  const [value, setValue] = useState("1.0"); // Speed/Pitch value
  
  // Trim State
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  
  // Results
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [stems, setStems] = useState<{vocals: string, music: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🟢 NEW: Get Backend URL from Environment
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // 1. Handle File Upload & Get Duration
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setProcessedUrl(null);
      setStems(null);
      
      // Create audio object to get duration
      const audio = new Audio(URL.createObjectURL(selected));
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        setTrimEnd(audio.duration); // Default end is full length
        setTrimStart(0);
      };
    }
  };

  // 2. Process Audio
  const handleProcess = async () => {
    if (!file) return alert("Please upload an audio file first!");
    setLoading(true);
    setError(null);
    setProcessedUrl(null);
    setStems(null);

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("operation", tool === "vocal" ? "vocal" : tool);

    // Prepare Value
    let finalValue = value;
    if (tool === "trim") {
       // Server expects "start,duration"
       const dur = trimEnd - trimStart;
       finalValue = `${trimStart},${dur}`;
    }
    formData.append("value", finalValue);

    // 🟢 CHANGED: Use API_URL for dynamic endpoint selection
    const endpoint = tool === "vocal" 
      ? `${API_URL}/api/remove-vocals` 
      : `${API_URL}/api/process-audio`;

    try {
      const res = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (tool === "vocal") {
        // 🟢 CHANGED: The AI service (Hugging Face) now returns full public URLs, so we just use them directly.
        setStems(res.data);
      } else {
        // 🟢 CHANGED: Construct full URL for Backend (Render) hosted files
        setProcessedUrl(`${API_URL}${res.data.downloadUrl}?t=${Date.now()}`);
      }

    } catch (err: any) {
      console.error(err);
      setError("Processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for formatting seconds to MM:SS
  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  };

  return (
    <div className="flex min-h-screen bg-space text-white">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
          
          <header className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
               <Scissors size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Audio Studio</h1>
              <p className="text-gray-400">Professional audio manipulation tools.</p>
            </div>
          </header>

          {/* 1. UPLOAD & WAVEFORM SECTION */}
          <section className="glass-panel p-8 rounded-2xl space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Source Audio</h2>
                 {file && <button onClick={() => setFile(null)} className="text-xs text-red-400 hover:text-red-300">Remove File</button>}
            </div>

            {!file ? (
                 <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 hover:border-green-500 hover:bg-white/5 transition-all text-center cursor-pointer relative group">
                    <input 
                      type="file" 
                      accept="audio/*" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="mx-auto text-gray-500 group-hover:text-green-400 mb-4" size={40} />
                    <p className="text-gray-300 font-bold text-lg group-hover:text-white">Drop Audio File Here</p>
                    <p className="text-sm text-gray-500 mt-2">WAV, MP3, FLAC (Max 50MB)</p>
                 </div>
            ) : (
                <div className="space-y-4">
                   {/* WAVEFORM COMPONENT */}
                   <AudioWaveform file={file} height={80} />
                   <div className="text-right text-xs text-gray-500 font-mono">
                      Total Duration: {formatTime(duration)}
                   </div>
                </div>
            )}
          </section>

          {/* 2. TOOLS SELECTOR */}
          {file && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { id: "vocal", label: "Vocal Remover", icon: Mic, color: "text-purple-400" },
                   { id: "speed", label: "Change Speed", icon: FastForward, color: "text-blue-400" },
                   { id: "pitch", label: "Pitch Shift", icon: Music, color: "text-pink-400" },
                   { id: "trim", label: "Trim Audio", icon: Scissors, color: "text-green-400" },
                 ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTool(t.id)}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        tool === t.id 
                        ? "bg-white/10 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                        : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/20"
                      }`}
                    >
                        <t.icon className={t.color} size={24} />
                        <span className={`font-bold text-sm ${tool === t.id ? "text-white" : "text-gray-400"}`}>{t.label}</span>
                    </button>
                 ))}
              </div>
          )}

          {/* 3. CONTROLS AREA */}
          {file && (
            <section className="glass-panel p-8 rounded-2xl border-t-4 border-t-blue-500/50">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                   <Wand2 size={20} className="text-blue-400"/> 
                   Configure: <span className="text-blue-400 capitalize">{tool.replace("-", " ")}</span>
                </h3>

                {/* --- CONTROL: VOCAL REMOVER --- */}
                {tool === "vocal" && (
                   <div className="text-center py-4">
                      <p className="text-gray-300 mb-4">
                        Uses AI to separate the audio into two tracks: 
                        <strong className="text-white ml-1">Vocals</strong> and <strong className="text-white">Instrumental</strong>.
                      </p>
                      <div className="inline-block bg-purple-500/20 px-4 py-2 rounded-lg text-purple-300 text-sm font-mono">
                          Estimated time: 20-40 seconds
                      </div>
                   </div>
                )}

                {/* --- CONTROL: SPEED --- */}
                {tool === "speed" && (
                  <div className="space-y-4">
                      <div className="flex justify-between text-sm font-bold text-gray-400">
                        <span>Slow (0.5x)</span>
                        <span className="text-white text-lg">{value}x</span>
                        <span>Fast (2.0x)</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="2.0" step="0.1" 
                        value={value} 
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full accent-blue-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                   </div>
                )}

                {/* --- CONTROL: PITCH --- */}
                {tool === "pitch" && (
                   <div className="space-y-4">
                      <p className="text-sm text-gray-400 mb-2">Adjust pitch without changing speed.</p>
                      <input 
                        type="range" min="0.5" max="2.0" step="0.1" 
                        value={value} 
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full accent-pink-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-center font-mono text-pink-400 font-bold">{value}</div>
                   </div>
                )}

                {/* --- CONTROL: TRIM (DUAL SLIDER) --- */}
                {tool === "trim" && (
                  <div className="space-y-6">
                      <div className="flex justify-between text-sm text-gray-300 font-mono">
                        <div>Start: <span className="text-white">{formatTime(trimStart)}</span></div>
                        <div>End: <span className="text-white">{formatTime(trimEnd)}</span></div>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="relative h-12 bg-black/40 rounded-lg overflow-hidden border border-white/10 group">
                        
                        {/* Selected Region Highlight */}
                        <div 
                           className="absolute top-0 bottom-0 bg-green-500/20 border-l border-r border-green-500/50"
                           style={{
                             left: `${(trimStart / duration) * 100}%`,
                             right: `${100 - (trimEnd / duration) * 100}%`
                           }}
                        />

                        {/* Slider 1: Start Time */}
                        <input 
                          type="range" 
                          min="0" max={duration} step="0.1"
                          value={trimStart}
                          onChange={(e) => {
                             const val = parseFloat(e.target.value);
                             if (val < trimEnd - 1) setTrimStart(val);
                          }}
                          className="absolute top-4 w-full h-1 opacity-0 z-20 cursor-w-resize"
                        />
                         {/* Thumb 1 Visual */}
                         <div 
                            className="absolute top-0 bottom-0 w-1 bg-green-400 z-10 pointer-events-none" 
                            style={{ left: `${(trimStart / duration) * 100}%` }}
                         />

                        {/* Slider 2: End Time */}
                        <input 
                          type="range" 
                          min="0" max={duration} step="0.1"
                          value={trimEnd}
                          onChange={(e) => {
                             const val = parseFloat(e.target.value);
                             if (val > trimStart + 1) setTrimEnd(val);
                          }}
                          className="absolute top-4 w-full h-1 opacity-0 z-20 cursor-e-resize"
                        />
                        {/* Thumb 2 Visual */}
                         <div 
                            className="absolute top-0 bottom-0 w-1 bg-green-400 z-10 pointer-events-none" 
                            style={{ left: `${(trimEnd / duration) * 100}%` }}
                         />
                      </div>
                      
                      <p className="text-xs text-center text-gray-500">Drag from left and right edges to trim</p>
                  </div>
                )}

                {/* PROCESS BUTTON */}
                <button 
                  onClick={handleProcess}
                  disabled={loading}
                  className="w-full mt-8 bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                   {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />} 
                   {loading ? "Processing Audio..." : "Run Operation"}
                </button>
                
                {error && <p className="mt-4 text-red-400 text-center font-bold">{error}</p>}
            </section>
          )}

          {/* 4. RESULTS SECTION (Generated Below) */}
          {(processedUrl || stems) && (
             <section className="animate-fade-in-up delay-100 space-y-4">
                <h3 className="text-2xl font-bold text-white mb-4">Result</h3>
                
                {/* A. Generic Result (Speed, Pitch, Trim) */}
                {processedUrl && (
                   <div className="glass-panel p-6 rounded-2xl border border-green-500/30">
                      <AudioWaveform audioUrl={processedUrl} height={100} />
                      <div className="flex justify-end mt-4">
                         <a href={processedUrl} download="processed-audio.wav" className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-bold text-white transition-all">
                            <Download size={18} /> Download
                         </a>
                      </div>
                   </div>
                )}

                {/* B. Vocal Remover Result (Two Stems) */}
                {stems && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Vocals Card */}
                      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30">
                         <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-purple-300 uppercase tracking-wider">Vocals</h4>
                            <Mic size={18} className="text-purple-400"/>
                         </div>
                         <AudioWaveform audioUrl={stems.vocals} height={60} />
                         <a href={stems.vocals} download className="block text-center mt-4 text-sm font-bold text-purple-400 hover:text-white">Download Vocals</a>
                      </div>

                      {/* Music Card */}
                      <div className="glass-panel p-6 rounded-2xl border border-blue-500/30">
                         <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-blue-300 uppercase tracking-wider">Instrumental</h4>
                            <Music size={18} className="text-blue-400"/>
                         </div>
                         <AudioWaveform audioUrl={stems.music} height={60} />
                         <a href={stems.music} download className="block text-center mt-4 text-sm font-bold text-blue-400 hover:text-white">Download Instrumental</a>
                      </div>
                   </div>
                )}
             </section>
          )}

        </div>
      </main>
    </div>
  );
}