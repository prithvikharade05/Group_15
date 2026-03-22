import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const particles = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  speed: Math.random() * 0.5 + 0.1
}));

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await API.post("/auth/login/", { username, password });
      localStorage.setItem("token", res.data.access);
      navigate("/mpin");
    } catch (err) {
      alert("Login Failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden relative">
      {/* Animated Particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute bg-white/20 rounded-full"
          style={{
            left: `${particle.x}vw`,
            top: `${particle.y}vh`,
            width: particle.size,
            height: particle.size
          }}
          animate={{
            y: [0, -100],
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 10 + particle.speed,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      <div className="flex items-center justify-center h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-3xl border border-white/20 p-12 rounded-3xl shadow-2xl w-full max-w-md text-white"
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-center mb-8"
          >
            <div className="text-5xl mb-4">⚡</div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tesla AI Trading
            </h1>
            <p className="text-white/60 mt-2 text-sm">Neural Trading Engine</p>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              whileFocus={{ scale: 1.02 }}
              className="relative group"
            >
              <input
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-lg 
                text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 focus:ring-2 ring-cyan-400/50
                transition-all duration-300 group-focus-within:border-cyan-400/50 caret-white"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)} autocomplete="username"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur opacity-0 group-focus-within:opacity-100 transition-all duration-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            <motion.div
              whileFocus={{ scale: 1.02 }}
              className="relative group"
            >
              <input
                type="password"
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-lg 
                text-white placeholder-white/50 focus:outline-none focus:border-pink-400 focus:ring-2 ring-pink-400/50
                transition-all duration-300 group-focus-within:border-pink-400/50 caret-white"
                placeholder="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)} autocomplete="current-password"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur opacity-0 group-focus-within:opacity-100 transition-all duration-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 
              text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-cyan-500/25 
              transition-all duration-300 relative overflow-hidden disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" pathLength="1" className="opacity-25"/>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Enter Neural Network"
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </motion.button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 text-sm text-white/50 hover:text-white cursor-pointer transition-colors"
            onClick={() => navigate("/register")}
            whileHover={{ scale: 1.05 }}
          >
            New to Neural Trading? Create Account
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
