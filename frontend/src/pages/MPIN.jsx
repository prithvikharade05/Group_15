import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: 50,
  y: 50,
  size: Math.random() * 6 + 2
}));

function MPIN() {
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      await API.post("/auth/set-mpin/", { mpin: mpin.join("") });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch {
      alert("MPIN Error");
      setIsLoading(false);
    }
  }, [mpin, navigate]);

  useEffect(() => {
    if (mpin[3] && !isLoading) {
      handlePinComplete();
    }
  }, [mpin, isLoading, handlePinComplete]);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/4 -right-1/4 w-3/4 h-3/4 bg-sky-300/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-0 -left-1/4 w-3/4 h-3/4 bg-emerald-300/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full blur-[1px] z-20 opacity-40"
          style={{
            left: `${particle.x}vw`,
            top: `${particle.y}vh`,
            width: particle.size * 2,
            height: particle.size * 2
          }}
        />
      ))}

      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="bg-white/70 backdrop-blur-3xl border border-white p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] w-full max-w-sm text-center relative z-10">
          <div className="mb-10">
            <div className="text-2xl mx-auto w-24 h-24 bg-gradient-to-br from-white to-sky-50 rounded-[2rem] flex items-center justify-center shadow-lg border border-white/80 mb-6 shrink-0 font-black tracking-wide">
              LOCK
            </div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent mb-2 tracking-tight">
              Biometric Lock
            </h2>
            <p className="text-slate-500/80 text-sm font-medium">Verify Personal Access Sequence</p>
            {isLoading && (
              <p className="text-sky-500 font-bold mt-4 text-sm tracking-wide">
                Authorizing Connection...
              </p>
            )}
          </div>

          <div className="flex gap-4 justify-center mb-10">
            {mpin.map((digit, i) => (
              <div
                key={i}
                className={`relative group w-16 h-20 sm:w-20 sm:h-24 rounded-2xl flex items-center justify-center 
                           text-4xl font-mono transition-all duration-300 ${
                             digit 
                               ? 'bg-white border-2 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-110' 
                               : 'bg-white/60 border-2 border-slate-200 hover:border-indigo-300 hover:shadow-md'
                           }`}
              >
                <input
                  maxLength={1}
                  value={digit}
                  className="absolute inset-0 w-full h-full text-center text-4xl font-black bg-transparent 
                            text-slate-800 outline-none caret-transparent cursor-default pointer-events-none drop-shadow-sm"
                  readOnly
                />
                {!digit && (
                  <div className="text-slate-300 animate-pulse">
                    *
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-400 space-y-2 mb-10 font-bold">
            <p className="uppercase tracking-widest text-indigo-500/80">Keyboard Activated</p>
            <p className="tracking-widest">0-9 | BSPC</p>
          </div>

          <div className="space-y-4">
            {!isLoading && (
              <button
                onClick={() => {
                  if (mpin[3]) handlePinComplete();
                }}
                className={`w-full bg-gradient-to-r from-sky-500 to-indigo-600 
                          text-white font-black py-4 rounded-2xl transition-all duration-300 border border-indigo-400/50 ${
                            mpin[3] 
                              ? "shadow-lg shadow-indigo-500/30 cursor-pointer hover:opacity-90" 
                              : "opacity-40 cursor-not-allowed grayscale"
                          }`}
                type="button"
              >
                Unlock Architecture
              </button>
            )}
            <button
              className="w-full text-slate-500 hover:text-slate-800 font-bold tracking-wide transition-colors text-sm py-3 border-2 border-slate-200 hover:border-slate-300 bg-white/50 hover:bg-white rounded-xl backdrop-blur-md"
              onClick={() => navigate('/')}
              type="button"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MPIN;
