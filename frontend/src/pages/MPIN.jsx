import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: 50,
  y: 50,
  vx: (Math.random() - 0.5) * 200,
  vy: (Math.random() - 0.5) * 200,
  size: Math.random() * 6 + 2,
  life: 1
}));

function MPIN() {
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [particlesAnim, setParticlesAnim] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e) => {
    const key = e.key;
    if (key >= '0' && key <= '9') {
      const emptyIndex = mpin.findIndex(d => !d);
      if (emptyIndex !== -1) {
        const newPin = [...mpin];
        newPin[emptyIndex] = key;
        setMpin(newPin);
      }
    } else if (key === 'Backspace') {
      const lastIndex = mpin.slice().reverse().findIndex(d => d);
      if (lastIndex !== -1) {
        const newPin = [...mpin];
        newPin[3 - lastIndex] = "";
        setMpin(newPin);
      }
    }
  }, [mpin]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handlePinComplete = async () => {
    setIsLoading(true);
    // Particle explosion
    setParticlesAnim(particles.map(p => ({ ...p, life: 1 })));
    
    try {
      await API.post("/auth/set-mpin/", { mpin: mpin.join("") });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch {
      alert("MPIN Error");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const completeIndex = mpin.findIndex((d, i) => d && i === 3);
    if (completeIndex !== -1 && !isLoading) {
      handlePinComplete();
    }
  }, [mpin, isLoading]);

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900/50 to-pink-900 relative overflow-hidden">
      {/* Success Particles */}
      <AnimatePresence>
        {particlesAnim.map((particle, i) => (
          <motion.div
            key={particle.id}
            className="absolute bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-sm"
            style={{
              left: `${particle.x}vw`,
              top: `${particle.y}vh`,
              width: particle.size,
              height: particle.size
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              x: particle.vx * 0.1,
              y: particle.vy * 0.1,
              scale: 0,
              opacity: [1, 0.5, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        ))}
      </AnimatePresence>

      <div className="flex items-center justify-center h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-3xl border border-white/20 p-12 rounded-3xl shadow-2xl 
                     w-full max-w-sm text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mb-8"
          >
            <div className="text-6xl mx-auto w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-600 
                           rounded-2xl flex items-center justify-center shadow-2xl mb-4">
              🔐
            </div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Neural Lock
            </h2>
            <p className="text-white/50 text-sm">Enter 4-digit MPIN</p>
            {isLoading && (
              <p className="text-cyan-400 font-medium mt-2">Verifying Neural Signature...</p>
            )}
          </motion.div>

          {/* Animated PIN Inputs */}
          <div className="flex gap-4 justify-center mb-10">
            {mpin.map((digit, i) => (
              <motion.div
                key={i}
                className={`relative group w-20 h-20 rounded-2xl flex items-center justify-center 
                           text-2xl font-mono transition-all duration-300 ${
                             digit 
                               ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-cyan-400 shadow-cyan-500/25 shadow-lg scale-110' 
                               : 'bg-white/10 border-white/20 hover:border-white/40 hover:shadow-lg'
                           }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <input
                  maxLength={1}
                  value={digit}
                  className="absolute inset-0 w-full h-full text-center text-2xl bg-transparent 
                            text-white/90 outline-none caret-transparent cursor-default pointer-events-none"
                  readOnly
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 
                            rounded-2xl blur opacity-0 group-hover:opacity-50"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
                {!digit && (
                  <motion.div
                    className="text-white/30"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    •
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Instructions */}
          <div className="text-xs text-white/40 space-y-1 mb-8">
            <p>Keyboard input supported</p>
            <p>Numbers 0-9 | Backspace</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {!isLoading && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (mpin[3]) handlePinComplete();
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 
                          text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                Unlock Dashboard
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="w-full text-white/60 hover:text-white transition-colors text-sm py-2 border border-white/20 rounded-xl backdrop-blur-sm"
              onClick={() => navigate('/')}
            >
              ← Back to Login
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default MPIN;
