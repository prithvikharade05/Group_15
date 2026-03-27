import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await API.post("/api/auth/register/", { username, password });
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      const errorMsg =
        err.response?.data?.username?.[0] ||
        err.response?.data?.detail ||
        "Registration failed. Please try again.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Ambient glow blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(50px)' }} />

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
            style={{ background: 'linear-gradient(135deg, #ec4899, #7c3aed)', boxShadow: '0 0 24px rgba(236,72,153,0.4)' }}
          >
            AM
          </div>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ background: 'linear-gradient(135deg, #fff 30%, #a78bfa 70%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Create Account
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: '#94a3b8' }}>
            Join AlphaMind today
          </p>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }}>
            {success}
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
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
              placeholder="Create a password (min. 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              onFocus={(e) => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.2)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              onFocus={(e) => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.2)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleRegister}
            disabled={isLoading || !!success}
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm mt-2 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #ec4899, #7c3aed)',
              boxShadow: '0 0 20px rgba(236,72,153,0.3), 0 4px 16px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
            onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(124,58,237,0.6), 0 8px 24px rgba(0,0,0,0.4)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(236,72,153,0.3), 0 4px 16px rgba(0,0,0,0.3)'; }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#64748b' }}>Have an account?</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <Link
          to="/login"
          className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#a78bfa'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
        >
          Sign In Instead →
        </Link>
      </div>
    </div>
  );
}

export default Register;
