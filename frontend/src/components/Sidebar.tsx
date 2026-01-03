import { useEffect, useState } from "react";
import { Mic, LayoutDashboard, Layers, Music, LogOut, User as UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");

  // 1. Get User Details from Local Storage on Load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Capitalize first letter of name
        const name = parsed.name || "User";
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        setUserEmail(parsed.email || "");
      } catch (e) {
        console.error("Error parsing user data");
      }
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/"; 
  };

  return (
    <div className="w-64 h-screen border-r border-white/10 bg-black/20 backdrop-blur-md text-white flex flex-col p-6 hidden md:flex sticky top-0">
      
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => navigate("/")}>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Mic className="text-white" size={20} /> 
        </div>
        <h1 className="text-xl font-bold tracking-wider">AUDIO<span className="text-blue-400">.IO</span></h1>
      </div>
      
      {/* MENU LINKS */}
      <nav className="flex flex-col gap-2 flex-1">
        <Link to="/dashboard" className="flex items-center gap-3 p-4 hover:bg-white/10 rounded-xl transition-all hover:text-blue-400">
          <LayoutDashboard size={20} /> <span className="font-medium">Text to Speech</span>
        </Link>
        
        <Link to="/studio" className="flex items-center gap-3 p-4 hover:bg-white/10 rounded-xl transition-all hover:text-green-400">
          <Layers size={20} /> <span className="font-medium">Audio Studio</span>
        </Link>

        <div className="mt-4 border-t border-white/10 pt-4">
           <p className="text-xs text-gray-500 uppercase px-4 mb-2">History</p>
           <a href="#" className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-xl text-gray-400 transition-all hover:text-white">
             <Music size={20} /> <span className="font-medium">My Files</span>
           </a>
        </div>
      </nav>

      {/* FOOTER SECTION (User Name + Logout) */}
      <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
          
          {/* 🟢 NEW: USER NAME DISPLAY */}
          <div className="flex items-center gap-3 px-2">
             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center text-white border border-white/20">
                <UserIcon size={20} />
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate max-w-[120px]">{userEmail}</p>
             </div>
          </div>

          {/* LOGOUT BUTTON */}
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all hover:text-red-300"
          >
            <LogOut size={20} /> <span className="font-medium">Logout</span>
          </button>
      </div>

    </div>
  );
}