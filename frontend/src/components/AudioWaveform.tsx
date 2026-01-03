import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";

interface WaveformProps {
  audioUrl?: string | null;
  file?: File | null;
  height?: number;
}

export default function AudioWaveform({ audioUrl, file, height = 80 }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Initialize WaveSurfer
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(100, 116, 139, 0.5)", // Grayish
      progressColor: "#9333ea", // Purple
      cursorColor: "#ffffff",
      barWidth: 2,
      barGap: 3,
      height: height,
      barRadius: 3,
    });

    waveSurferRef.current = ws;

    // 2. Load Audio (File or URL)
    if (file) {
      const url = URL.createObjectURL(file);
      ws.load(url);
    } else if (audioUrl) {
      ws.load(audioUrl);
    }

    // 3. Event Listeners
    ws.on("ready", () => setIsReady(true));
    ws.on("finish", () => setIsPlaying(false));

    return () => {
      ws.destroy();
    };
  }, [audioUrl, file, height]);

  const togglePlay = () => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-lg backdrop-blur-sm">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:scale-110 transition-transform flex-shrink-0"
      >
        {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
      </button>

      {/* The Waveform Container */}
      <div className="flex-1" ref={containerRef} />
      
      {!isReady && <span className="text-xs text-gray-500 animate-pulse">Loading Waveform...</span>}
    </div>
  );
}