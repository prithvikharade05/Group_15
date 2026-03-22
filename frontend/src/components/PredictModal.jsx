import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import PredictionChart from './Chart';

const MODEL_CONFIGS = {
  arima: { name: 'ARIMA', endpoint: '/predict/arima/', color: 'from-blue-500 to-blue-600' },
  lstm: { name: 'LSTM+CNN', endpoint: '/predict/lstm/', color: 'from-purple-500 to-violet-600' },
  regression: { name: 'Linear Regression', endpoint: '/predict/regression/', color: 'from-green-500 to-emerald-600' },
  cluster: { name: 'Clustering', endpoint: '/predict/cluster/', color: 'from-orange-500 to-red-600', multiStock: true },
  portfolio: { name: 'Portfolio Analysis', endpoint: '/portfolio/analyze/', color: 'from-indigo-500 to-purple-600', multiStock: true }
};

const PredictModal = ({ model = 'arima', isOpen, onClose }) => {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [days, setDays] = useState(7);
  const [stocks, setStocks] = useState('RELIANCE,TCS,INFY');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const config = MODEL_CONFIGS[model];
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
        setError(res.data.error || 'Prediction failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error');
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0 }}
          className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-8 border-b border-white/10 sticky top-0 bg-white/5 backdrop-blur-xl rounded-t-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {config.name}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
              >
                ✕
              </motion.button>
            </div>
            <p className="text-white/60 text-lg">
              {isPortfolio ? 'Analyze portfolio allocation' : 'Enter symbol for neural prediction'}
            </p>
          </div>

          {/* Controls */}
          <div className="p-8 space-y-8">
            {!isPortfolio && !isClustering && (
              <>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2 font-semibold">Stock Symbol</label>
                    <input
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-lg text-white 
                               focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 
                               transition-all text-lg font-mono tracking-wider"
                      placeholder="RELIANCE, TCS, INFY.NS..."
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/80 mb-2 font-semibold">Forecast Days</label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 
                                [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:bg-blue-500 
                                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                                [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:bg-blue-500 
                                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-lg"
                    />
                    <span className="text-white/80 ml-2">{days} days</span>
                  </div>
                </motion.div>
              </>
            )}

            {(isPortfolio || isClustering) && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2 font-semibold">
                    {isPortfolio ? 'Stocks (comma separated)' : 'Stocks for Clustering'}
                  </label>
                  <input
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-lg text-white 
                             focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 
                             transition-all text-lg font-mono tracking-wider"
                    placeholder="RELIANCE,TCS,INFY,HDFCBANK"
                    value={stocks}
                    onChange={(e) => setStocks(e.target.value.toUpperCase())}
                  />
                </div>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePredict}
              disabled={loading || (!symbol && !stocks)}
              className={`w-full font-bold py-6 px-8 rounded-2xl shadow-2xl transition-all duration-300 text-lg ${
                loading || (!symbol && !stocks)
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : `bg-gradient-to-r ${config.color} hover:shadow-[0_0_40px_${config.color.replace('from-', '').replace('to-', '').split(' ')[0]}/30] shadow-lg`
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin inline mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Running Neural Prediction...
                </>
              ) : (
                `Activate ${config.name}`
              )}
            </motion.button>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-100 backdrop-blur-xl"
              >
                <p className="font-semibold">⚠️ {error}</p>
              </motion.div>
            )}
          </div>

          {/* Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-8 border-t border-white/10 bg-white/5 rounded-b-3xl"
            >
              <PredictionChart
                historical={result.historical_prices || []}
                forecast={result.forecast_prices || []}
                dates={result.forecast_dates || []}
                modelName={config.name}
              />
              {result.confidence && (
                <div className="mt-6 p-4 bg-white/10 rounded-2xl">
                  <p className="text-white/80 text-sm">
                    <span className="font-semibold text-green-400">Accuracy:</span> {result.confidence?.toFixed(2)}%
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PredictModal;
