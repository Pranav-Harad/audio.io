import { useState } from "react";
import axios from "axios";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";

interface AuthProps {
  onLogin: (user: any) => void;
  redirectPath?: string;
}

export default function Auth({ onLogin, redirectPath = "/dashboard" }: AuthProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🟢 NEW: Get Backend URL from Environment
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Helper to finish login and redirect
  const handleSuccess = (user: any, token: string) => {
    localStorage.setItem("user", JSON.stringify(user)); // Save user
    localStorage.setItem("token", token); // Save token
    onLogin(user); // Update App state
    navigate(redirectPath); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    const endpoint = isLogin ? "/api/login" : "/api/register";
    try {
      // 🟢 CHANGED: Use dynamic API_URL instead of 127.0.0.1
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      
      if (res.data.success) {
        if (isLogin) {
          handleSuccess(res.data.user, res.data.token);
        } else { 
          setIsLogin(true); 
          alert("Account created! Please login."); 
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Connection failed. Is Backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      // 🟢 CHANGED: Use dynamic API_URL
      const res = await axios.post(`${API_URL}/api/google-login`, {
        token: credentialResponse.credential,
      });

      if (res.data.success) {
        handleSuccess(res.data.user, res.data.token);
      }
    } catch (err) {
      setError("Google Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-space text-white p-4">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-white/10 relative">
        <h2 className="text-3xl font-bold text-center mb-6">{isLogin ? "Welcome Back" : "Join Now"}</h2>
        
        {/* GOOGLE LOGIN BUTTON */}
        <div className="flex justify-center mb-6 w-full">
           <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
                theme="filled_black"
                shape="pill"
                text="continue_with"
                width="300" 
            />
           </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-sm text-gray-500">OR EMAIL</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>
        
        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-center text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input type="text" placeholder="Name" className="w-full bg-black/30 p-3 pl-10 rounded-xl border border-white/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input type="email" placeholder="Email" className="w-full bg-black/30 p-3 pl-10 rounded-xl border border-white/10" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input type="password" placeholder="Password" className="w-full bg-black/30 p-3 pl-10 rounded-xl border border-white/10" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <button disabled={loading} className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl font-bold hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Login" : "Sign Up")}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400 cursor-pointer hover:text-white" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
        </p>
      </div>
    </div>
  );
}