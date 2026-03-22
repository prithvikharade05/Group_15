import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import PredictModal from '../components/PredictModal';

const Dashboard = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const models = [
    { key: 'arima', name: 'ARIMA Core', icon: '📈', desc: 'Predictive Time Series Forecasting', color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { key: 'lstm', name: 'LSTM+CNN Matrix', icon: '🧠', desc: 'Deep Learning Pattern Recognition', color: 'from-violet-500 to-fuchsia-600', shadow: 'shadow-violet-500/20' },
    { key: 'regression', name: 'Regression', icon: '📊', desc: 'Linear Trajectory Analysis', color: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { key: 'cluster', name: 'Clustering Engine', icon: '🔗', desc: 'Multi-Asset Correlation Grouping', color: 'from-orange-400 to-rose-500', shadow: 'shadow-orange-500/20' },
    { key: 'portfolio', name: 'Portfolio Allocator', icon: '💼', desc: 'Optimal Risk Analysis Matrix', color: 'from-indigo-400 to-purple-600', shadow: 'shadow-indigo-500/20' },
    { key: 'sentiment', name: 'Sentiment Nexus', icon: '⚡', desc: 'NLP Market Mood (Coming Soon)', disabled: true, color: 'from-slate-400 to-slate-500' },
    { key: 'chatbot', name: 'AI Advisor', icon: '💬', desc: 'Conversational Neural Assistant (Coming Soon)', disabled: true, color: 'from-slate-400 to-slate-500' }
  ];

  const openModal = (model) => {
    setActiveModal(model);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden text-slate-800">
      {/* Soft Pastel Background Effects */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-sky-200/40 rounded-full blur-[150px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-rose-200/40 rounded-full blur-[150px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-violet-200/30 rounded-full blur-[150px] pointer-events-none mix-blend-multiply" />

      {/* Grid Overlay for Clean Tech Vibe */}
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block p-1 px-5 mb-6 rounded-full border border-sky-200 bg-white/80 backdrop-blur-md shadow-sm"
        >
          <span className="text-sky-600 text-sm font-bold tracking-widest uppercase">System Online • Connection Secure</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black mb-8 tracking-tight"
        >
          <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-sm">
            Neural Command
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-slate-500/90 max-w-3xl mx-auto mb-20 leading-relaxed font-medium"
        >
          Activate quantum-inspired algorithms for unparalleled market foresight and intelligent continuous asset allocation.
        </motion.p>
      </div>

      {/* Neural Interface Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {models.map((model, index) => (
            <motion.div
              key={model.key}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`group relative overflow-hidden rounded-[2rem] p-8 h-[340px] flex flex-col justify-between 
                        transition-all duration-500 cursor-pointer border 
                        bg-white/70 backdrop-blur-2xl 
                        ${model.disabled 
                          ? 'opacity-60 cursor-not-allowed grayscale border-slate-200' 
                          : `border-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:border-indigo-100 hover:${model.shadow}`}`}
              onClick={() => !model.disabled && openModal(model.key)}
            >
              {/* Background Soft Glow Flow */}
              {!model.disabled && (
                <div className={`absolute inset-0 bg-gradient-to-br ${model.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700`} />
              )}
              
              {/* Glowing Top Border Line */}
              {!model.disabled && (
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${model.color} opacity-0 group-hover:opacity-100 transition-all duration-500`} />
              )}

              {/* Icon */}
              <motion.div 
                className={`w-20 h-20 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-4xl mb-6 relative z-10 transition-all shadow-sm ${!model.disabled ? `group-hover:border-indigo-100 group-hover:shadow-lg` : ''}`}
                animate={!model.disabled ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="drop-shadow-sm">{model.icon}</span>
                {!model.disabled && <div className={`absolute inset-0 bg-gradient-to-br ${model.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />}
              </motion.div>

              {/* Content */}
              <div className="relative z-10 flex-grow">
                <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-violet-600 transition-all">
                  {model.name}
                </h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed transition-colors">
                  {model.desc}
                </p>
              </div>

              {/* Activation Status */}
              <div className="relative z-10 mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-xs font-bold tracking-widest uppercase ${model.disabled ? 'text-slate-400' : 'text-indigo-600 group-hover:text-indigo-700'}`}>
                  {model.disabled ? 'OFFLINE' : 'SYSTEM READY'}
                </span>
                {!model.disabled && (
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-sm"
                    whileHover={{ scale: 1.1, rotate: 45 }}
                  >
                    ↗
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Modal */}
      <PredictModal 
        model={activeModal} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
