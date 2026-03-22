import { useState } from "react";
import { motion } from "framer-motion";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const particles = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  speed: Math.random() * 0.5 + 0.1
}));

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await API.post("/auth/register/", { username, password });
      alert("Account Created ✅");
      navigate("/");
    } catch {
      alert("Registration Error ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900/80 to-indigo-900 overflow-hidden relative">
      {/* Animated Particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-30"
          style={{
            left: `${particle.x}vw`,
            top: `${particle.y}vh`,
            width: particle.size * 2,
            height: particle.size * 2
          }}
          animate={{
            y: [0, -120],
            x: [0, Math.sin(particle.id) * 20],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 12 + particle.speed,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      <div className="flex items-center justify-center h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/5 backdrop-blur-3xl border border-white/20 p-12 rounded-3xl shadow-2xl 
                     w-full max-w-md text-white"
        >
          <motion.div
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 1, type: "spring" }}
            className="text-center mb-8"
          >
            <div className="text-5xl mb-4 mx-auto w-24 h-24 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 
                           rounded-3xl flex items-center justify-center shadow-sky-500/40 shadow-2xl">
              🧬
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Tesla Account
            </h1>
            <p className="text-white/60 mt-2 text-sm">Join the AI Trading Network</p>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              whileFocus={{ scale: 1.02, rotateX: 5 }}
              className="relative group"
            >
              <input
                className="w-full p-5 bg-white/10 border border-emerald-500/30 rounded-3xl backdrop-blur-xl 
                          text-white placeholder-white/50 focus:outline-none focus:border-emerald-400/70 focus:ring-4 
                          focus:ring-emerald-500/20 transition-all duration-500 shadow-lg hover:shadow-emerald-500/20
                          group-focus-within:shadow-emerald-400/30"
                placeholder="Neural ID (Username)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 
                          rounded-3xl blur opacity-0 group-focus-within:opacity-100 -z-10"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </motion.div>

            <motion.div
              whileFocus={{ scale: 1.02, rotateX: 5 }}
              className="relative group"
            >
              <input
                type="password"
                className="w-full p-5 bg-white/10 border border-pink-500/30 rounded-3xl backdrop-blur-xl 
                          text-white placeholder-white/50 focus:outline-none focus:border-pink-400/70 focus:ring-4 
                          focus:ring-pink-500/20 transition-all duration-500 shadow-lg hover:shadow-pink-500/20
                          group-focus-within:shadow-pink-400/30"
                placeholder="Secure Neural Key (Password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 
                          rounded-3xl blur opacity-0 group-focus-within:opacity-100 -z-10"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegister}
              disabled={isLoading || !username || !password}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 
                        hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 text-white 
                        font-black py-5 px-8 rounded-3xl shadow-2xl hover:shadow-emerald-500/50 
                        transition-all duration-500 relative overflow-hidden disabled:opacity-50
                        disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Initializing Neural Account...
                  </>
                ) : (
                  "Initialize Neural Account"
                )}
              </span>
              <div className="absolute inset-0 bg-white/30 skew-x-[-25deg] -translate-x-[120%] 
                             group-hover:translate-x-[120%] transition-transform duration-1000 -z-10" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-2 pt-4"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1" />
              <span className="text-white/40 text-xs">or</span>
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1" />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              className="w-full text-emerald-300 hover:text-emerald-200 font-medium py-3 
                        border-2 border-emerald-500/40 hover:border-emerald-400/70 
                        rounded-2xl backdrop-blur-xl transition-all duration-300 shadow-lg 
                        hover:shadow-emerald-400/20 hover:bg-emerald-500/5"
            >
              Already Synced? Login →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
