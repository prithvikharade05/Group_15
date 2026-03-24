import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchStockData();
    fetchPredictions();
    fetchModels();
  }, [symbol]);

  const fetchStockData = async () => {
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
  };

  const fetchPredictions = async () => {
    try {
      const response = await axios.get(`/predictions/${symbol}/`);
      setPredictions(response.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get('/models/');
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleRunPrediction = async () => {
    if (!selectedModel) {
      alert('Please select a model');
      return;
    }

    try {
      await axios.post('/predictions/', {
        symbol,
        model: selectedModel
      });

      fetchPredictions();
      alert('Prediction executed successfully!');
    } catch (error) {
      console.error('Error running prediction:', error);
      alert('Failed to run prediction');
    }
  };

  const handleViewPrediction = (prediction) => {
    // Navigate to prediction detail or open modal
    console.log('Viewing prediction:', prediction);
  };

  if (loading) {
    return (
      <div className="stock-detail">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-detail">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="stock-detail">
        <div className="error">Stock not found</div>
      </div>
    );
  }

  return (
    <div className="stock-detail">
      {/* Header */}
      <header className="stock-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <div className="stock-info">
          <h1>{stockData.symbol}</h1>
          <h2>{stockData.name}</h2>
          <div className="stock-stats">
            <div className="stat">
              <span className="label">Current Price:</span>
              <span className="value">${stockData.price}</span>
            </div>
            <div className="stat">
              <span className="label">Change:</span>
              <span className={`value ${stockData.change >= 0 ? 'positive' : 'negative'}`}>
                {stockData.change >= 0 ? '+' : ''}{stockData.change}%
              </span>
            </div>
            <div className="stat">
              <span className="label">Volume:</span>
              <span className="value">{stockData.volume.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="stock-content">
        {/* Left Column */}
        <aside className="stock-sidebar">
          <div className="prediction-form">
            <h3>Run Prediction</h3>
            <div className="form-group">
              <label>Select Model:</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="">Choose a model</option>
                {models.map(model => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleRunPrediction} className="run-btn">
              Run Prediction
            </button>
          </div>

          <div className="recent-predictions">
            <h3>Recent Predictions</h3>
            {predictions.length === 0 ? (
              <p>No predictions available</p>
            ) : (
              <div className="predictions-list">
                {predictions.map((prediction, index) => (
                  <div key={index} className="prediction-item">
                    <div className="prediction-header">
                      <span className="model">{prediction.model}</span>
                      <span className="date">{new Date(prediction.date).toLocaleDateString()}</span>
                    </div>
                    <div className="prediction-details">
                      <span className="confidence">Confidence: {prediction.confidence}%</span>
                      <span className={`trend ${prediction.trend.toLowerCase()}`}>
                        {prediction.trend}
                      </span>
                    </div>
                    <button
                      onClick={() => handleViewPrediction(prediction)}
                      className="view-btn"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="stock-main">
          <div className="chart-section">
            <h3>Stock Price Analysis & Predictions</h3>
            <div className="chart-container">
              <Chart
                historical={stockData.historical_prices || []}
                forecast={predictions.map(p => p.target_price) || []}
                dates={stockData.historical_dates || []}
                modelName={`${symbol} Price Forecast`}
              />
            </div>
          </div>

          <div className="analysis-section">
            <h3>AI Analysis</h3>
            <div className="analysis-content">
              {predictions.length > 0 ? (
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <h4>Trend Analysis</h4>
                    <p>{predictions[0].trend}</p>
                  </div>
                  <div className="analysis-card">
                    <h4>Confidence Score</h4>
                    <p>{predictions[0].confidence}%</p>
                  </div>
                  <div className="analysis-card">
                    <h4>Target Price</h4>
                    <p>${predictions[0].target_price}</p>
                  </div>
                </div>
              ) : (
                <p>No analysis available. Run a prediction to see AI insights.</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Prediction Modal */}
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