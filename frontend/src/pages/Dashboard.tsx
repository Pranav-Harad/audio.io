import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Loader2, Wand2, AlertCircle, Volume2 } from "lucide-react"; 
import axios from "axios";
import AudioWaveform from "../components/AudioWaveform"; 

export default function Dashboard() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🟢 NEW: Dynamic API URL (Works on Vercel & Localhost)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleGenerate = async () => {
    if (!text) return alert("Please enter text!");

    setLoading(true);
    setError(null);

    try {
      // 🟢 CHANGED: Use API_URL instead of localhost
      const res = await axios.post(`${API_URL}/api/synthesize`, { text }, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.success) {
        // 🟢 CHANGED: Prepend API_URL to the download link
        setAudioUrl(`${API_URL}${res.data.downloadUrl}?t=${Date.now()}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to generate speech.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-space text-white">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          
          <header>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AI Text to Speech
            </h1>
            <p className="text-gray-400 mt-2">Turn text into lifelike audio instantly.</p>
          </header>

          {/* INPUT SECTION */}
          <div className="glass-panel p-8 rounded-2xl space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Enter Text</label>
              <textarea
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-all h-48 resize-none placeholder-gray-600 text-lg"
                placeholder="Type something here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${
                  loading 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/50 hover:scale-[1.02] text-white'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Volume2 size={20} />}
              {loading ? "GENERATING AUDIO..." : "SPEAK TEXT"}
            </button>
            
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-200">
                <AlertCircle size={20} /> {error}
              </div>
            )}
          </div>

          {/* RESULT SECTION */}
          {audioUrl && (
            <div className="animate-fade-in-up delay-100">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-green-400">Result</span>
              </h2>
              <div className="glass-panel p-6 rounded-2xl border border-green-500/30">
                 <AudioWaveform audioUrl={audioUrl} height={100} />
                 <div className="flex justify-end mt-4">
                    <a href={audioUrl} download="tts-result.wav" className="text-sm font-bold text-green-400 hover:underline">
                      Download .WAV
                    </a>
                 </div>
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}