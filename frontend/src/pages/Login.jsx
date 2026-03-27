import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await API.post("/api/auth/login/", { username, password });
      localStorage.setItem("token", res.data.access);
      if (onLogin) onLogin(res.data);
      navigate("/mpin");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Invalid credentials. Please try again.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', filter: 'blur(50px)' }} />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4 p-10 rounded-3xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 0 1px rgba(124,58,237,0.15), 0 32px 80px rgba(0,0,0,0.6)'
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-black text-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 0 24px rgba(124,58,237,0.5)' }}
          >
            AM
          </div>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ background: 'linear-gradient(135deg, #fff 30%, #a78bfa 70%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            AlphaMind
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: '#94a3b8' }}>
            The Future of AI Powered Trading
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>
              Username
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9',
              }}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              onFocus={(e) => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.2)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9',
              }}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              onFocus={(e) => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.2)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-2 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              boxShadow: '0 0 20px rgba(124,58,237,0.4), 0 4px 16px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
            onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(124,58,237,0.6), 0 8px 24px rgba(0,0,0,0.4)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.4), 0 4px 16px rgba(0,0,0,0.3)'; }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#64748b' }}>New here?</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <Link
          to="/register"
          className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#a78bfa'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
        >
          Create an Account →
        </Link>
      </div>
    </div>
  );
}

export default Login;
