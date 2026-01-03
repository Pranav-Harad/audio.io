import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AudioStudio from "./pages/AudioStudio";
import Auth from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import SpaceBackground from "./components/SpaceBackground"; // <--- Import this

// (Keep AuthWrapper and other code the same...)
function AuthWrapper({ onLogin }: { onLogin: (u: any) => void }) {
  const location = useLocation();
  const from = location.state?.from || "/dashboard"; 
  return <Auth onLogin={onLogin} redirectPath={from} />;
}

function App() {
  const [user, setUser] = useState(null);

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
          {/* CHANGE 2: Update Redirects to go to /tts instead of /dashboard */}
          <Route path="/auth" element={!user ? <AuthWrapper onLogin={setUser} /> : <Navigate to="/tts" />} />
          
          {/* CHANGE 3: RENAME ROUTE */}
          <Route path="/tts" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
          
          <Route path="/studio" element={user ? <AudioStudio /> : <Navigate to="/auth" />} />
          
          {/* Catch-all: Redirect old /dashboard traffic to /tts */}
          <Route path="/dashboard" element={<Navigate to="/tts" />} />
        </Routes>
      </Router>
    </>
  );
}
export default App;