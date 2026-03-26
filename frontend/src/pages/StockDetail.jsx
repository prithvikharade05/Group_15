import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Chart from '../components/Chart';
import PredictModal from '../components/PredictModal';
import './StockDetail.css';

/* ── Stock Search Landing (shown when no symbol in URL) ── */
const StockSearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const popularStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'WIPRO', 'SBIN'];

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/stock/${query.trim().toUpperCase()}`);
  };

  return (
    <div className="sd-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 560, width: '100%', padding: '2rem' }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '0 auto 1.5rem',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          boxShadow: '0 0 32px rgba(124,58,237,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32
        }}>🔮</div>

        <h1 style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 900, marginBottom: '0.6rem',
          background: 'linear-gradient(135deg, #fff 30%, #a78bfa 70%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>AI Prediction Models</h1>

        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' }}>
          Search for any stock to run ARIMA, LSTM, or Regression predictions
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Enter stock symbol (e.g. RELIANCE, TCS)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, padding: '0.85rem 1.2rem', borderRadius: 14, fontSize: '0.95rem',
              background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)',
              color: '#f1f5f9', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
            onFocus={(e) => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.2)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
          />
          <button type="submit" style={{
            padding: '0.85rem 1.6rem', borderRadius: 14, fontWeight: 700, fontSize: '0.9rem',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', border: 'none',
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)'
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(124,58,237,0.6)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.4)'; }}
          >
            Analyse →
          </button>
        </form>

        {/* Quick picks */}
        <div>
          <p style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.75rem', fontWeight: 600 }}>Popular Stocks</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {popularStocks.map(s => (
              <button
                key={s}
                onClick={() => navigate(`/stock/${s}`)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: 50, fontSize: '0.82rem', fontWeight: 600,
                  background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
                  color: '#a78bfa', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.25)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; e.currentTarget.style.color = '#a78bfa'; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [models, setModels] = useState([]);

  const fetchStockData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/stocks/${symbol}/`);
      setStockData(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const fetchPredictions = useCallback(async () => {
    try {
      const response = await axios.get(`/predictions/${symbol}/`);
      setPredictions(response.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  }, [symbol]);

  const fetchModels = useCallback(async () => {
    try {
      const response = await axios.get('/models/');
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  }, []);

  useEffect(() => {
    if (!symbol) return;  // skip if no symbol
    fetchStockData();
    fetchPredictions();
    fetchModels();
  }, [symbol, fetchStockData, fetchPredictions, fetchModels]);

  // Show search page when no symbol (must be AFTER all hooks)
  if (!symbol) return <StockSearchPage />;

  const handleRunPrediction = async () => {
    if (!selectedModel) {
      alert('Please select a model');
      return;
    }
    try {
      await axios.post('/predictions/', { symbol, model: selectedModel });
      fetchPredictions();
      alert('Prediction executed successfully!');
    } catch (error) {
      console.error('Error running prediction:', error);
      alert('Failed to run prediction');
    }
  };

  const handleViewPrediction = (prediction) => {
    console.log('Viewing prediction:', prediction);
  };

  /* ── Loading / Error / Empty states ── */
  if (loading) {
    return (
      <div className="sd-page">
        <div className="sd-state-screen">
          <div className="sd-spinner" />
          <p>Loading market data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sd-page">
        <div className="sd-state-screen">
          <p className="sd-error-msg">⚠ {error}</p>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="sd-page">
        <div className="sd-state-screen">
          <p className="sd-error-msg">Stock not found</p>
        </div>
      </div>
    );
  }

  const isPositive = stockData.change >= 0;

  return (
    <div className="sd-page">

      {/* ─── HEADER ─────────────────────────────────────── */}
      <header className="sd-header">
        <button onClick={() => navigate('/stock')} className="sd-back-btn">
          ← Back
        </button>

        <div className="sd-stock-identity">
          <h1 className="sd-symbol">{stockData.symbol}</h1>
          <h2 className="sd-name">{stockData.name}</h2>
        </div>

        {/* Stats row */}
        <div className="sd-stats-row">
          <div className="sd-stat-card">
            <span className="sd-stat-label">Current Price</span>
            <span className="sd-stat-value sd-price">${stockData.price}</span>
          </div>
          <div className="sd-stat-card">
            <span className="sd-stat-label">Change</span>
            <span className={`sd-stat-value ${isPositive ? 'sd-positive' : 'sd-negative'}`}>
              {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{stockData.change}%
            </span>
          </div>
          <div className="sd-stat-card">
            <span className="sd-stat-label">Volume</span>
            <span className="sd-stat-value">{stockData.volume.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* ─── BODY GRID ──────────────────────────────────── */}
      <div className="sd-body">

        {/* ── SIDEBAR / AI ENGINE ── */}
        <aside className="sd-sidebar">

          {/* Engine label */}
          <div className="sd-engine-label">
            <span className="sd-engine-dot" />
            AI Prediction Engine
          </div>

          {/* Run Prediction form */}
          <div className="sd-panel sd-engine-panel">
            <h3 className="sd-panel-title">Run Prediction</h3>
            <div className="sd-form-group">
              <label className="sd-label">Select Model</label>
              <select
                className="sd-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="">Choose a model</option>
                {models.map(model => (
                  <option key={model.name} value={model.name}>{model.name}</option>
                ))}
              </select>
            </div>
            <button onClick={handleRunPrediction} className="sd-run-btn">
              🔥 Execute Prediction
            </button>
          </div>

          {/* Recent predictions */}
          <div className="sd-panel sd-predictions-panel">
            <h3 className="sd-panel-title">Recent Predictions</h3>
            {predictions.length === 0 ? (
              <p className="sd-empty">No predictions available</p>
            ) : (
              <div className="sd-predictions-list">
                {predictions.map((prediction, index) => (
                  <div key={index} className="sd-prediction-card">
                    <div className="sd-pred-header">
                      <span className="sd-model-badge">{prediction.model}</span>
                      <span className="sd-pred-date">
                        {new Date(prediction.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="sd-pred-meta">
                      <span className="sd-confidence-pill">
                        {prediction.confidence}% confidence
                      </span>
                      <span className={`sd-trend-pill ${prediction.trend.toLowerCase()}`}>
                        {prediction.trend === 'up' ? '▲' : '▼'} {prediction.trend}
                      </span>
                    </div>
                    <button
                      onClick={() => handleViewPrediction(prediction)}
                      className="sd-view-btn"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="sd-main">

          {/* Chart */}
          <div className="sd-chart-panel">
            <div className="sd-chart-header">
              <h3 className="sd-panel-title">Stock Price Analysis &amp; Predictions</h3>
              <span className="sd-live-badge">● LIVE</span>
            </div>
            <div className="sd-chart-container">
              <Chart
                historical={stockData.historical_prices || []}
                forecast={predictions.map(p => p.target_price) || []}
                dates={stockData.historical_dates || []}
                modelName={`${symbol} Price Forecast`}
              />
            </div>
          </div>

          {/* AI Analysis */}
          <div className="sd-analysis-panel">
            <h3 className="sd-panel-title">⚡ AI Insight Panel</h3>
            {predictions.length > 0 ? (
              <div className="sd-insight-grid">
                <div className="sd-insight-card">
                  <span className="sd-insight-icon">📈</span>
                  <h4 className="sd-insight-label">Trend Analysis</h4>
                  <p className={`sd-insight-value ${predictions[0].trend.toLowerCase()}`}>
                    {predictions[0].trend === 'up' ? '▲' : '▼'} {predictions[0].trend}
                  </p>
                </div>
                <div className="sd-insight-card">
                  <span className="sd-insight-icon">🎯</span>
                  <h4 className="sd-insight-label">Confidence Score</h4>
                  <p className="sd-insight-value sd-conf-val">{predictions[0].confidence}%</p>
                </div>
                <div className="sd-insight-card">
                  <span className="sd-insight-icon">💰</span>
                  <h4 className="sd-insight-label">Target Price</h4>
                  <p className="sd-insight-value sd-price">${predictions[0].target_price}</p>
                </div>
              </div>
            ) : (
              <p className="sd-empty">No analysis available. Run a prediction to see AI insights.</p>
            )}
          </div>

        </main>
      </div>

      {/* Prediction Modal — unchanged */}
      <PredictModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        symbol={symbol}
        predictions={predictions}
      />
    </div>
  );
};

export default StockDetail;
