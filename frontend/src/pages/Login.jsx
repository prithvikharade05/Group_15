import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const particles = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1
}));

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await API.post("/auth/login/", { username, password });
      localStorage.setItem("token", res.data.access);
      if (onLogin) onLogin(res.data);
      navigate("/mpin");
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || "Login Failed";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden relative">
      <div className="absolute top-0 -left-1/4 w-3/4 h-3/4 bg-sky-300/30 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-0 -right-1/4 w-3/4 h-3/4 bg-violet-300/30 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-pink-300/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-white/60 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          style={{
            left: `${particle.x}vw`,
            top: `${particle.y}vh`,
            width: particle.size * 1.5,
            height: particle.size * 1.5,
            opacity: 0.6
          }}
        />
      ))}

      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="bg-white/70 backdrop-blur-3xl border border-white p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] w-full max-w-md text-slate-800 relative z-10">
          <div className="text-center mb-10">
            <div className="text-2xl mb-6 mx-auto w-24 h-24 bg-gradient-to-br from-white to-sky-50 rounded-[2rem] flex items-center justify-center shadow-lg border border-white/80 shrink-0 font-black">
              AI
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent mb-2 tracking-tight">
              AlphaMind
            </h1>
            <p className="text-slate-500/80 text-sm font-medium">The Future of AI Powerd Trading</p>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none transition-colors group-focus-within:text-indigo-500">U</span>
              <input
                className="w-full pl-14 pr-5 py-4 bg-white/80 border-2 border-slate-100 rounded-2xl backdrop-blur-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 ring-indigo-500/10 shadow-sm transition-all duration-300"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none transition-colors group-focus-within:text-indigo-500">PW</span>
              <input
                type="password"
                className="w-full pl-14 pr-5 py-4 bg-white/80 border-2 border-slate-100 rounded-2xl backdrop-blur-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 ring-indigo-500/10 shadow-sm transition-all duration-300"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading || !username || !password}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 mt-4 border border-indigo-400/50"
              type="button"
            >
              <span className="flex items-center justify-center tracking-wide">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Authenticating Matrix
                  </>
                ) : (
                  "Access Terminal"
                )}
              </span>
            </button>
          </div>

          <div className="flex flex-col items-center justify-center pt-8">
            <div className="w-full flex items-center mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1" />
              <span className="text-slate-400/70 text-xs px-4 font-medium uppercase tracking-widest">New User?</span>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent flex-1" />
            </div>
            
            <p
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
              onClick={() => navigate("/register")}
            >
              Configure Network Identity ->
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
