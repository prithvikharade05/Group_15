import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

function MPIN({ onMpinSuccess }) {
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(""); // success status message
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (e) => {
      const key = e.key;
      if (key >= "0" && key <= "9") {
        const emptyIndex = mpin.findIndex((d) => !d);
        if (emptyIndex !== -1) {
          const newPin = [...mpin];
          newPin[emptyIndex] = key;
          setMpin(newPin);
        }
      } else if (key === "Backspace") {
        const lastIndex = mpin.slice().reverse().findIndex((d) => d);
        if (lastIndex !== -1) {
          const newPin = [...mpin];
          newPin[3 - lastIndex] = "";
          setMpin(newPin);
        }
      }
    },
    [mpin]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handlePinComplete = useCallback(async () => {
    setError("");
    setIsLoading(true);
    setStatus("Verifying PIN...");
    try {
      await API.post("/api/auth/set-mpin/", { mpin: mpin.join("") });
      // Mark MPIN as verified in app state + localStorage
      if (onMpinSuccess) onMpinSuccess();
      setStatus("Access granted! Redirecting...");
      setTimeout(() => navigate("/stock"), 1500);
    } catch {
      setError("Incorrect PIN. Please try again.");
      setMpin(["", "", "", ""]);
      setStatus("");
      setIsLoading(false);
    }
  }, [mpin, navigate, onMpinSuccess]);

  useEffect(() => {
    if (mpin[3] && !isLoading) {
      handlePinComplete();
    }
  }, [mpin, isLoading, handlePinComplete]);

  const handleDigitClick = (digit) => {
    const emptyIndex = mpin.findIndex((d) => !d);
    if (emptyIndex !== -1) {
      const newPin = [...mpin];
      newPin[emptyIndex] = digit;
      setMpin(newPin);
    }
  };

  const handleBackspace = () => {
    const lastIndex = mpin.slice().reverse().findIndex((d) => d);
    if (lastIndex !== -1) {
      const newPin = [...mpin];
      newPin[3 - lastIndex] = "";
      setMpin(newPin);
    }
  };

  const dialPad = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(70px)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 p-10 rounded-3xl text-center"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 0 1px rgba(124,58,237,0.15), 0 32px 80px rgba(0,0,0,0.6)'
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 0 24px rgba(124,58,237,0.5)' }}
        >
          🔒
        </div>

        <h1
          className="text-2xl font-black tracking-tight mb-1"
          style={{ background: 'linear-gradient(135deg, #fff 30%, #a78bfa 70%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Enter PIN
        </h1>
        <p className="text-sm mb-8" style={{ color: '#94a3b8' }}>
          Enter your 4-digit security PIN to continue
        </p>

        {/* Error / Status messages */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}
        {status && !error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            {status}
          </div>
        )}

        {/* PIN Dots */}
        <div className="flex gap-4 justify-center mb-8">
          {mpin.map((digit, i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
              style={{
                background: digit ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                border: digit ? '2px solid rgba(124,58,237,0.7)' : '2px solid rgba(255,255,255,0.1)',
                boxShadow: digit ? '0 0 16px rgba(124,58,237,0.4)' : 'none',
                transform: digit ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {digit ? (
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
                />
              ) : (
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Dial Pad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {dialPad.map((key, i) => (
            <button
              key={i}
              disabled={isLoading || key === ''}
              onClick={() => {
                if (key === '⌫') handleBackspace();
                else if (key !== '') handleDigitClick(key);
              }}
              className="h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-200 disabled:opacity-0"
              style={{
                background: key === '⌫' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)',
                border: key === '⌫' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.10)',
                color: key === '⌫' ? '#fca5a5' : '#f1f5f9',
                cursor: key === '' ? 'default' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (key !== '' && !isLoading) {
                  e.currentTarget.style.background = key === '⌫' ? 'rgba(239,68,68,0.2)' : 'rgba(124,58,237,0.15)';
                  e.currentTarget.style.borderColor = key === '⌫' ? 'rgba(239,68,68,0.4)' : 'rgba(124,58,237,0.5)';
                  e.currentTarget.style.transform = 'scale(1.06)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = key === '⌫' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = key === '⌫' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.10)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Hint */}
        <p className="text-xs mb-5" style={{ color: '#64748b' }}>
          You can also use your keyboard (0-9, Backspace)
        </p>

        {/* Back to login */}
        <Link
          to="/login"
          className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#64748b'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

export default MPIN;
