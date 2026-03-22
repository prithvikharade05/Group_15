import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import PredictModal from '../components/PredictModal';

const Dashboard = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const models = [
    { key: 'arima', name: 'ARIMA', icon: '📈', desc: 'Time Series Forecasting' },
    { key: 'lstm', name: 'LSTM+CNN', icon: '🧠', desc: 'Deep Learning Prediction' },
    { key: 'regression', name: 'Regression', icon: '📊', desc: 'Trend Analysis' },
    { key: 'cluster', name: 'Clustering', icon: '🔗', desc: 'Stock Grouping' },
    { key: 'portfolio', name: 'Portfolio', icon: '💼', desc: 'Risk Analysis' },
    { key: 'sentiment', name: 'Sentiment', icon: '😊', desc: 'Coming Soon', disabled: true },
    { key: 'chatbot', name: 'AI Chat', icon: '💬', desc: 'Coming Soon', disabled: true }
  ];

  const openModal = (model) => {
    setActiveModal(model);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen text-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-7xl font-black mb-8 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-2xl"
        >
          Tesla AI Trading Dashboard
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white/70 max-w-2xl mx-auto mb-20 leading-relaxed"
        >
          Activate cutting-edge AI models for stock prediction and portfolio optimization
        </motion.p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {models.map((model, index) => (
            <motion.div
              key={model.key}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`group relative overflow-hidden rounded-3xl p-8 h-64 flex flex-col justify-between 
                        transition-all duration-500 cursor-pointer border border-white/10
                        bg-gradient-to-br bg-white/5 backdrop-blur-xl hover:shadow-2xl hover:shadow-cyan-500/20
                        ${model.disabled ? 'opacity-50 cursor-not-allowed hover:shadow-none' : ''}`}
              onClick={() => !model.disabled && openModal(model.key)}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 
                             ${model.color || 'from-cyan-500/20 via-blue-500/20 to-purple-500/20'}`} />
              
              {/* Icon */}
              <motion.div 
                className="text-5xl relative z-10 drop-shadow-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {model.icon}
              </motion.div>

              {/* Content */}
              <div className="relative z-10 space-y-3">
                <h3 className="text-2xl font-black relative bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                  {model.name}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{model.desc}</p>
              </div>

              {/* Hover Action */}
              {!model.disabled && (
                <motion.div 
                  className="absolute bottom-6 right-6 w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-600 
                            rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 
                            shadow-2xl group-hover:shadow-cyan-500/50 transition-all duration-500"
                  whileHover={{ scale: 1.15, rotate: 360 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                >
                  <span className="text-white font-bold text-sm">ACTIVATE</span>
                </motion.div>
              )}
              
              {model.disabled && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              )}
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
