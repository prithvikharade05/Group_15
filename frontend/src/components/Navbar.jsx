import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from token or API
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token or fetch user
      setUser({ name: 'Neural Trader | Node 01' });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/60 backdrop-blur-3xl border-b border-white sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
    >
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <span className="text-white text-xl font-black relative z-10">T</span>
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-[2px]" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent tracking-widest uppercase">
              Tesla Core
            </span>
          </motion.div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden md:flex items-center space-x-2 bg-white/80 px-4 py-1.5 rounded-full shadow-sm border border-slate-100"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-slate-600 text-sm font-bold tracking-wide">{user.name}</span>
              </motion.div>
              
              <div className="w-px h-6 bg-slate-200 hidden md:block" />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-5 py-2.5 border border-slate-200 hover:border-red-200 bg-white hover:bg-red-50 
                          text-slate-500 hover:text-red-500 font-bold text-sm tracking-wider uppercase rounded-xl 
                          shadow-sm hover:shadow-md transition-all flex items-center space-x-2 group"
              >
                <span>Disconnect</span>
                <svg className="w-4 h-4 ml-1 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
