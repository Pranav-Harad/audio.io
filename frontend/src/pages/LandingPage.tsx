import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Music, Scissors, Activity, ArrowRight, Github, Layers, Zap, Waves } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleServiceClick = (destination: string) => {
    // 1. Check if user is already logged in
    const isAuthenticated = localStorage.getItem("user"); 
    
    if (isAuthenticated) {
      // 2. If logged in, go DIRECTLY to the page (Studio or Dashboard)
      navigate(destination);
    } else {
      
      navigate("/auth", { state: { from: destination } });
    }
  };

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden relative">
      
      {/* BACKGROUND ACCENT*/}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto backdrop-blur-md sticky top-0 z-50 border-b border-white/5 bg-black/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Activity className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-wider">AUDIO<span className="text-blue-400">.IO</span></span>
        </div>
        <div className="flex gap-4 md:gap-6">
          <button onClick={() => navigate("/auth")} className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/30 transition-all text-sm md:text-base">Login</button>
          <button onClick={() => navigate("/auth")} className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-500 font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all text-sm md:text-base">Get Started</button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="max-w-7xl mx-auto px-6 py-24 md:py-32 text-center relative z-10">
    
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight animate-fade-in-up">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_10px_rgba(100,100,255,0.5)]">Audio Universe</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-100">
          The next-generation AI workstation. Clone voices with emotion, isolate instrumentals, and shape sound all in your browser.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-6 animate-fade-in-up delay-200">
          <button onClick={() => handleServiceClick("/tts")} className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <span className="relative z-10 flex items-center gap-2"><Mic size={20}/> Try Text to Speech</span>
            <div className="absolute inset-0 rounded-full bg-white blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          </button>
          
          <button onClick={() => handleServiceClick("/studio")} className="flex items-center justify-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/30 transition-all">
            <Layers size={20} /> Open Audio Studio
          </button>
        </div>

            {/* EXPLORE ARROW */}
        <div 
          onClick={scrollToFeatures}
          className="mt-16 flex flex-col items-center animate-bounce opacity-50 hover:opacity-100 transition-opacity cursor-pointer p-4"
        >
          <span className="text-xs font-bold tracking-[0.2em] mb-2 uppercase">Explore Features</span>
          <ArrowRight className="rotate-90" size={24} />
        </div>

      </header>

      
      {/* --- NEW PROFESSIONAL SERVICES SECTION --- */}
      <section ref={featuresRef} className="max-w-7xl mx-auto px-6 mb-32 w-full animate-fade-in-up delay-100 scroll-mt-24">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Tools Suite</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Everything you need to create professional audio, powered by state-of-the-art AI models.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Voice Cloning */}
          <div 
            onClick={() => handleServiceClick("/tts")} 
            className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-blue-500/50 hover:to-blue-600/10 transition-all duration-500 cursor-pointer"
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            <div className="relative h-full bg-[#0a0a12] rounded-[22px] p-8 border border-white/5 group-hover:border-transparent overflow-hidden">
                {/* Glowing Icon */}
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <Mic className="text-blue-400 group-hover:text-blue-300" size={28} />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-blue-200 transition-colors">Text to Speech</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    Generate lifelike speech from text instantly using AI.
                </p>
                
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                    <span>Launch App</span> <ArrowRight size={16}/>
                </div>

                {/* Decorative BG Element */}
                <Waves className="absolute -bottom-4 -right-4 text-blue-500/5 w-32 h-32 group-hover:text-blue-500/10 transition-colors rotate-[-15deg]" />
            </div>
          </div>

          {/* Card 2: Stem Separation */}
          <div 
            onClick={() => handleServiceClick("/studio")} 
            className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-purple-500/50 hover:to-purple-600/10 transition-all duration-500 cursor-pointer"
          >
             <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            <div className="relative h-full bg-[#0a0a12] rounded-[22px] p-8 border border-white/5 group-hover:border-transparent overflow-hidden">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                    <Music className="text-purple-400 group-hover:text-purple-300" size={28} />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-200 transition-colors">Vocal Remover</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    Isolate vocals from any song. Extract instrumentals, bass, or drums using advanced Spleeter AI technology.
                </p>
                
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                    <span>Open Studio</span> <ArrowRight size={16}/>
                </div>
                 <Layers className="absolute -bottom-4 -right-4 text-purple-500/5 w-32 h-32 group-hover:text-purple-500/10 transition-colors rotate-[-15deg]" />
            </div>
          </div>

           {/* Card 3: Pitch & Speed */}
           <div 
            onClick={() => handleServiceClick("/studio")} 
            className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-green-500/50 hover:to-green-600/10 transition-all duration-500 cursor-pointer"
          >
             <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            <div className="relative h-full bg-[#0a0a12] rounded-[22px] p-8 border border-white/5 group-hover:border-transparent overflow-hidden">
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                    <Zap className="text-green-400 group-hover:text-green-300" size={28} />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-green-200 transition-colors">FX & Editing</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    Professional grade tools to shift pitch, create Nightcore edits, trim audio, or change playback speed in real-time.
                </p>
                
                <div className="flex items-center gap-2 text-green-400 font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                    <span>Start Editing</span> <ArrowRight size={16}/>
                </div>
                <Scissors className="absolute -bottom-4 -right-4 text-green-500/5 w-32 h-32 group-hover:text-green-500/10 transition-colors rotate-[-15deg]" />
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 bg-black/40 mt-20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity size={16} />
             </div>
             <span className="font-bold text-xl tracking-widest">AUDIO.IO</span>
          </div>

          <div className="text-gray-400 text-sm font-medium">
             Made with ❤️ by Pranav
          </div>

          <div className="text-gray-500 text-sm">
            © 2026 Audio.io AI Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
                {/* Wrap the icon in an 'a' tag */}
                <a 
                  href="https://github.com/Pranav-Harad/audio.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                    <Github size={24} />
                </a>
          </div>
        </div>
      </footer>
    </div>
  );
}