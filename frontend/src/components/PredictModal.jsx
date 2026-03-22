import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import PredictionChart from './Chart';

const MODEL_CONFIGS = {
  arima: { name: 'ARIMA Core', endpoint: '/predict/arima/', color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30', accent: 'text-indigo-600' },
  lstm: { name: 'LSTM+CNN Matrix', endpoint: '/predict/lstm/', color: 'from-violet-500 to-fuchsia-600', shadow: 'shadow-violet-500/30', accent: 'text-violet-600' },
  regression: { name: 'Regression', endpoint: '/predict/regression/', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/30', accent: 'text-emerald-600' },
  cluster: { name: 'Clustering Engine', endpoint: '/predict/cluster/', color: 'from-orange-400 to-rose-500', multiStock: true, shadow: 'shadow-orange-500/30', accent: 'text-rose-600' },
  portfolio: { name: 'Portfolio Allocator', endpoint: '/portfolio/analyze/', color: 'from-indigo-400 to-purple-500', multiStock: true, shadow: 'shadow-indigo-500/30', accent: 'text-purple-600' }
};

const PredictModal = ({ model = 'arima', isOpen, onClose }) => {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [days, setDays] = useState(7);
  const [stocks, setStocks] = useState('RELIANCE,TCS,INFY');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const config = MODEL_CONFIGS[model] || MODEL_CONFIGS['arima'];
  const isPortfolio = model === 'portfolio';
  const isClustering = model === 'cluster';

  const handlePredict = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let data = { symbol, days };
      
      if (isPortfolio || isClustering) {
        data.stocks = stocks.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        delete data.symbol;
        delete data.days;
      }

      const res = await API.post(config.endpoint, data);
      
      if (res.data.success) {
        setResult(res.data);
      } else {
        setError(res.data.error || 'Sequence prediction failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Neural Network offline or disconnected');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white/90 backdrop-blur-3xl border border-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_20px_70px_-15px_rgba(0,0,0,0.15)] relative overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Background Glow */}
          <div className={`absolute top-0 right-0 w-3/4 h-32 bg-gradient-to-l ${config.color} opacity-10 blur-[100px] pointer-events-none mix-blend-multiply`} />

          {/* Header */}
          <div className="p-8 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-2xl rounded-t-[2.5rem] z-20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${config.color} shadow-lg ${config.shadow} animate-pulse`} />
                <h2 className={`text-3xl font-black bg-gradient-to-r ${config.color} bg-clip-text text-transparent uppercase tracking-wider`}>
                  {config.name}
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                ✕
              </motion.button>
            </div>
            <p className="text-slate-500 text-sm tracking-wide ml-[1.8rem] font-medium uppercase font-mono">
              {isPortfolio ? 'EXECUTE MULTI-ASSET OPTIMIZATION' : 'INITIALIZE NEURAL FORECAST MATRIX'}
            </p>
          </div>

          {/* Controls */}
          <div className="p-8 space-y-8 relative z-10 bg-slate-50/50">
            {!isPortfolio && !isClustering && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="relative group">
                  <label className="block text-slate-500 text-xs font-bold tracking-widest uppercase mb-3 ml-2">Target Asset Identifier</label>
                  <input
                    className="w-full p-5 bg-white border border-slate-200 rounded-2xl backdrop-blur-xl text-slate-800 
                             focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 
                             transition-all text-xl font-mono tracking-widest uppercase shadow-sm"
                    placeholder="E.G., RELIANCE, TSLA"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  />
                </div>
                
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-end mb-5">
                    <label className="block text-slate-500 text-xs font-bold tracking-widest uppercase">Temporal Forecast Horizon</label>
                    <span className={`font-mono text-3xl font-black ${config.accent} drop-shadow-sm`}>{days} <span className="text-sm text-slate-400 font-bold">DAYS</span></span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500 
                              [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-indigo-500 
                              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                              [&::-webkit-slider-thumb]:appearance-none transition-all"
                  />
                </div>
              </motion.div>
            )}

            {(isPortfolio || isClustering) && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="relative group">
                  <label className="block text-slate-500 text-xs font-bold tracking-widest uppercase mb-3 ml-2">
                    {isPortfolio ? 'Asset Matrix (Comma Separated)' : 'Clustering Pool Array'}
                  </label>
                  <input
                    className="w-full p-5 bg-white border border-slate-200 rounded-2xl backdrop-blur-xl text-slate-800 
                             focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 
                             transition-all text-lg font-mono tracking-widest shadow-sm"
                    placeholder="RELIANCE,TCS,INFY,HDFCBANK"
                    value={stocks}
                    onChange={(e) => setStocks(e.target.value.toUpperCase())}
                  />
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePredict}
              disabled={loading || (!symbol && !stocks)}
              className={`w-full font-black py-5 pl-8 pr-6 border border-white/50 rounded-2xl shadow-xl transition-all duration-300 text-lg uppercase tracking-widest flex items-center justify-between group ${
                loading || (!symbol && !stocks)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : `bg-gradient-to-r ${config.color} text-white hover:opacity-90 ${config.shadow}`
              }`}
            >
              <span>
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin mr-4 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing Quantum Matrix...
                  </span>
                ) : (
                  `Execute ${config.name}`
                )}
              </span>
              {!loading && (symbol || stocks) && (
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-inner">
                  <svg className="w-5 h-5 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
              )}
            </motion.button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-600 backdrop-blur-md flex items-start space-x-3 shadow-sm"
              >
                <span className="text-xl">⚠️</span>
                <p className="font-mono text-sm font-bold leading-relaxed mt-0.5">CRITICAL EXCEPTION: {error}</p>
              </motion.div>
            )}
          </div>

          {/* Results Area */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-8 pb-8 pt-6 border-t border-slate-100 bg-white"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase">Telemetry Data Output</h3>
                  {result.confidence && (
                    <div className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-mono font-bold shadow-sm">
                      CONFIDENCE LEVEL: {result.confidence.toFixed(2)}%
                    </div>
                  )}
                </div>
                
                <div className="bg-white border border-slate-100 p-2 rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
                  <PredictionChart
                    historical={result.historical_prices || []}
                    forecast={result.forecast_prices || []}
                    dates={result.forecast_dates || []}
                    modelName={config.name}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PredictModal;
