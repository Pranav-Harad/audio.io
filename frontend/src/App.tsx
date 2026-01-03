import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AudioStudio from "./pages/AudioStudio";
import Auth from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import SpaceBackground from "./components/SpaceBackground"; 

// AuthWrapper: Handles the redirection logic after login
function AuthWrapper({ onLogin }: { onLogin: (u: any) => void }) {
  const location = useLocation();
  // 🟢 CHANGED: Default redirect is now /tts (since /dashboard is deprecated)
  const from = location.state?.from || "/tts"; 
  return <Auth onLogin={onLogin} redirectPath={from} />;
}

function App() {
  // 🟢 CHANGED: Added <any> for better Type safety
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <>
      <SpaceBackground />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Route: If logged in, go to TTS. If not, show Login. */}
          <Route path="/auth" element={!user ? <AuthWrapper onLogin={setUser} /> : <Navigate to="/tts" />} />
          
          {/* Main TTS Feature */}
          <Route path="/tts" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
          
          {/* Audio Studio Feature */}
          <Route path="/studio" element={user ? <AudioStudio /> : <Navigate to="/auth" />} />
          
          {/* Legacy Redirect: Send /dashboard to /tts */}
          <Route path="/dashboard" element={<Navigate to="/tts" />} />

          {/* 🟢 NEW: Catch-all route (Redirects 404s to Home) */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;