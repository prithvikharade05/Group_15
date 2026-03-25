import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Chart from '../components/Chart';
import PredictModal from '../components/PredictModal';
import './StockDetail.css';

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
    fetchStockData();
    fetchPredictions();
    fetchModels();
  }, [symbol, fetchStockData, fetchPredictions, fetchModels]);

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
        <button onClick={() => navigate('/dashboard')} className="sd-back-btn">
          ← Dashboard
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
