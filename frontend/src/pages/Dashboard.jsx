import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState('');
  const [models, setModels] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const navigate = useNavigate();

  const fetchStocks = useCallback(async () => {
    try {
      const response = await axios.get('/stocks/');
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setError('Failed to fetch stocks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModels = useCallback(async () => {
    try {
      const response = await axios.get('/models/');
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await axios.get('/portfolio/');
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchStocks();
    fetchModels();
    fetchPortfolio();
  }, [navigate, fetchStocks, fetchModels, fetchPortfolio]);

  const handleRunModel = async (model) => {
    if (!selectedStock) {
      alert('Please select a stock first');
      return;
    }

    try {
      const response = await axios.post('/models/run/', {
        model: model.name,
        symbol: selectedStock,
        days: 5
      });

      // Refresh predictions
      const predResponse = await axios.get(`/predictions/${selectedStock}/`);
      setPredictions(predResponse.data);

      alert('Model executed successfully!');
    } catch (error) {
      console.error('Error running model:', error);
      alert('Failed to run model');
    }
  };

  const handleAddToPortfolio = async (symbol) => {
    try {
      await axios.post('/portfolio/add/', { symbol });
      fetchPortfolio();
      alert(`${symbol} added to portfolio!`);
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      alert('Failed to add to portfolio');
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { type: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      const response = await axios.post('/chat/', { message: chatInput });
      const botMessage = { type: 'bot', text: response.data.response };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { type: 'bot', text: 'Sorry, I am unable to respond right now.' };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1>AlphaMind Dashboard</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/stock/' + selectedStock)} disabled={!selectedStock}>
            View Stock Detail
          </button>
          <button onClick={() => setIsChatOpen(!isChatOpen)}>
            {isChatOpen ? 'Close Chat' : 'Open Chat'}
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <div className="stock-selector">
            <h3>Select Stock</h3>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
            >
              <option value="">Choose a stock</option>
              {stocks.map(stock => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name}
                </option>
              ))}
            </select>
          </div>

          <div className="portfolio">
            <h3>My Portfolio</h3>
            {portfolio.length === 0 ? (
              <p>No stocks in portfolio</p>
            ) : (
              <ul>
                {portfolio.map(stock => (
                  <li key={stock.symbol}>
                    {stock.symbol} - {stock.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Market Overview */}
          <section className="market-overview">
            <h2>Market Overview</h2>
            <div className="stocks-grid">
              {stocks.map(stock => (
                <div key={stock.symbol} className="stock-card">
                  <h3>{stock.symbol}</h3>
                  <p>{stock.name}</p>
                  <div className="stock-price">
                    <span className="current-price">${stock.price}</span>
                    <span className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </span>
                  </div>
                  <button onClick={() => handleAddToPortfolio(stock.symbol)}>
                    Add to Portfolio
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Model Control Panel */}
          <section className="model-panel">
            <h2>AI Model Control</h2>
            <div className="models-grid">
              {models.map(model => (
                <div key={model.name} className="model-card">
                  <h3>{model.name}</h3>
                  <p>{model.description}</p>
                  <div className="model-actions">
                    <span className="status">Status: {model.status}</span>
                    <button onClick={() => handleRunModel(model)}>
                      Run Model
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Predictions */}
          <section className="predictions">
            <h2>Recent Predictions for {selectedStock}</h2>
            {predictions.length === 0 ? (
              <p>No predictions available. Run a model to see results.</p>
            ) : (
              <div className="predictions-grid">
                {predictions.map((prediction, index) => (
                  <div key={index} className="prediction-card">
                    <h4>{prediction.model}</h4>
                    <p>Confidence: {prediction.confidence}%</p>
                    <p>Trend: {prediction.trend}</p>
                    <p>Target Price: ${prediction.target_price}</p>
                    <p>Date: {new Date(prediction.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Chatbot */}
        {isChatOpen && (
          <aside className="chatbot">
            <div className="chat-header">
              <h3>AI Assistant</h3>
              <button onClick={() => setIsChatOpen(false)}>Close</button>
            </div>
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div key={index} className={`message ${message.type}`}>
                  {message.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="chat-input-form">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything about stocks..."
              />
              <button type="submit">Send</button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
