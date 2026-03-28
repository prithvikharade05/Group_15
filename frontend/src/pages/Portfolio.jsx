import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import './Portfolio.css';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const Portfolio = () => {
  const navigate = useNavigate();
  const { sector: sectorParam } = useParams();

  const [view, setView] = useState('overview');
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [sectors, setSectors] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clusterData, setClusterData] = useState(null);
  const [clusterLoading, setClusterLoading] = useState(false);
  const [clusterError, setClusterError] = useState(null);

  const clusterReport = clusterData?.report || {};

  useEffect(() => {
    if (sectorParam) {
      const decodedSector = decodeURIComponent(sectorParam);
      setSelectedSector(decodedSector);
      setView('stocks');
      fetchSectorData(decodedSector, selectedPortfolio || 'NIFTY200');
    }
  }, [sectorParam, selectedPortfolio]);

  const fetchSectors = async (portfolio) => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/portfolio/sectors/', { params: { portfolio } });
      if (res.data.success) {
        setSectors(Array.isArray(res.data.data) ? res.data.data : []);
        setSelectedPortfolio(portfolio);
        setView('sectors');
        navigate('/portfolio');
      } else {
        setError(res.data.error || 'Unable to load sectors.');
      }
    } catch (err) {
      console.error('Error fetching sectors:', err);
      setError('Unable to load sectors right now.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectorData = async (sector, portfolioValue) => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/portfolio/sector-data/', {
        params: { sector, portfolio: portfolioValue }
      });
      if (res.data.success) {
        setStockData(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setError(res.data.error || 'Failed to load sector data.');
        setStockData([]);
      }
    } catch (err) {
      console.error('Error fetching live sector data:', err);
      const apiMessage = err.response?.data?.error;
      setError(apiMessage || 'Failed to load live data. Please try again.');
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  const runClusterEngine = async () => {
    if (!selectedSector || !selectedPortfolio) {
      setClusterError('Select a portfolio and sector first.');
      return;
    }
    try {
      setClusterLoading(true);
      setClusterError(null);
      const res = await API.get('/portfolio/cluster-data/', {
        params: {
          sector: selectedSector,
          portfolio: selectedPortfolio
        }
      });
      if (res.data.success) {
        setClusterData(res.data.data);
      } else {
        setClusterError(res.data.error || 'Failed to run clustering engine');
      }
    } catch (error) {
      console.error('Cluster error:', error);
      setClusterError('Failed to run clustering engine');
    } finally {
      setClusterLoading(false);
    }
  };

  const handleSelectSector = (sector) => {
    setSelectedSector(sector);
    setView('stocks');
    navigate(`/portfolio/${encodeURIComponent(sector)}`);
    fetchSectorData(sector, selectedPortfolio);
  };

  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';
    return Number(value).toFixed(decimals);
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';
    return `INR ${Number(value).toFixed(2)}`;
  };

  const formatChange = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return { text: 'N/A', color: 'inherit' };
    }
    const num = Number(value);
    const text = `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    const color = num > 0 ? '#16a34a' : num < 0 ? '#dc2626' : 'inherit';
    return { text, color };
  };

  const formatVolume = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';
    return Number(value).toLocaleString();
  };

  const getChartData = () => {
    if (!clusterData || !Array.isArray(clusterData.points) || clusterData.points.length === 0) {
      return null;
    }

    const strong = [];
    const weak = [];
    const neutral = [];

    clusterData.points.forEach((p) => {
      const point = {
        x: p.change,
        y: p.volume,
        label: p.symbol
      };

      if (p.label === 'Strong') strong.push(point);
      else if (p.label === 'Weak') weak.push(point);
      else neutral.push(point);
    });

    return {
      datasets: [
        {
          label: 'Strong',
          data: strong,
          backgroundColor: 'green'
        },
        {
          label: 'Weak',
          data: weak,
          backgroundColor: 'red'
        },
        {
          label: 'Neutral',
          data: neutral,
          backgroundColor: 'yellow'
        }
      ]
    };
  };

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Price Change (%)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Volume'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.raw.label;
            return `${label} | Change: ${context.raw.x}% | Volume: ${context.raw.y}`;
          }
        }
      }
    }
  };

  const renderOverview = () => (
    <div className="portfolio-grid">
      <div className="portfolio-card" onClick={() => fetchSectors('NIFTY200')}>
        <h3>Nifty200 stocks</h3>
        <p>Track and analyze your top 200 Indian stocks from the Nifty index.</p>
      </div>

      <div className="portfolio-card" onClick={() => fetchSectors('USA200')}>
        <h3>USA200 stocks</h3>
        <p>Monitor your selection of the top 200 US-based equity assets.</p>
      </div>
    </div>
  );

  const renderSectorView = () => (
    <div>
      <button className="back-button" onClick={() => setView('overview')}>
        Back to Portfolios
      </button>
      <h2 className="portfolio-title">{selectedPortfolio} - Sectors</h2>
      <div className="portfolio-grid">
        {sectors.map((sector) => (
          <div
            key={sector}
            className="portfolio-card sector-card"
            onClick={() => handleSelectSector(sector)}
          >
            <h3>{sector}</h3>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStocksView = () => (
    <div>
      <div className="stocks-header">
        <div className="header-left">
          <button className="back-button" onClick={() => setView('sectors')}>
            Back to Sectors
          </button>
          <div className="header-titles">
            <h2 className="portfolio-title">
              {selectedPortfolio && `${selectedPortfolio} - `}{selectedSector}
            </h2>
            <p className="portfolio-subtitle">Live Market Data</p>
          </div>
        </div>
        <button
          className="refresh-button"
          onClick={() => fetchSectorData(selectedSector, selectedPortfolio)}
        >
          Refresh
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="table-wrapper">
        <table className="stocks-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Symbol</th>
              <th>LTP</th>
              <th>Change %</th>
              <th>Market Cap</th>
              <th>52W High</th>
              <th>52W Low</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(stockData) && stockData.length > 0 ? (
              stockData.map((stock) => {
                const change = formatChange(stock.change);
                return (
                  <tr key={`${stock.symbol || 'sym'}-${stock.company || 'co'}`}>
                    <td>{stock.company || 'N/A'}</td>
                    <td>{stock.symbol || 'N/A'}</td>
                    <td>{formatPrice(stock.ltp)}</td>
                    <td style={{ color: change.color }}>{change.text}</td>
                    <td>{stock.market_cap || 'N/A'}</td>
                    <td>{formatNumber(stock.high_52w)}</td>
                    <td>{formatNumber(stock.low_52w)}</td>
                    <td>{formatVolume(stock.volume)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <hr className="section-divider" />

      <div className="action-buttons">
        <button className="cluster-btn" onClick={() => runClusterEngine()}>
          {'\u26A1'} Run Advanced Cluster Engine
        </button>
        <button
          className="sentiment-btn"
          disabled={!selectedSector}
          onClick={() => navigate(`/sector-sentiment/${encodeURIComponent(selectedSector || '')}`)}
        >
          {'\uD83E\uDDE0'} Sector Sentiment Analysis
        </button>
      </div>

      {clusterLoading && <p className="info-text">Running AI clustering...</p>}
      {clusterError && <p className="error-text">{clusterError}</p>}

      {clusterData && Array.isArray(clusterData.points) && clusterData.points.length > 0 && (
        <div className="cluster-section">
          <h3 className="section-title">Cluster Summary</h3>
          <div className="cluster-summary">
            <p>Trend: {clusterReport.trend || 'N/A'}</p>
            <p>Strong Stocks: {clusterReport.strong_count ?? 'N/A'}</p>
            <p>Weak Stocks: {clusterReport.weak_count ?? 'N/A'}</p>
            <p>Neutral Stocks: {clusterReport.neutral_count ?? 'N/A'}</p>
          </div>

          <div className="cluster-visual">
            <h3>Cluster Visualization</h3>
            {(() => {
              const chartData = getChartData();
              return chartData ? <Scatter data={chartData} options={chartOptions} /> : null;
            })()}
          </div>

          <div className="ai-report">
            <h3>AI Market Report</h3>
            <p>Trend: <b>{clusterReport.trend || 'N/A'}</b></p>
            <p>Strong Stocks: {clusterReport.strong_count ?? 'N/A'}</p>
            <p>Weak Stocks: {clusterReport.weak_count ?? 'N/A'}</p>
            <p>Neutral Stocks: {clusterReport.neutral_count ?? 'N/A'}</p>
            <p>Top Gainer: {clusterReport.top_gainer || 'N/A'}</p>
            <p>Weakest: {clusterReport.top_loser || 'N/A'}</p>
            <p>Insight: {clusterReport.message || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="portfolio-page">
      <div className="portfolio-container">
        <h1 className="portfolio-title main-title">Your Portfolios</h1>

        {loading && <p>Loading...</p>}

        {!loading && view === 'overview' && renderOverview()}
        {!loading && view === 'sectors' && renderSectorView()}
        {!loading && view === 'stocks' && renderStocksView()}
      </div>
    </div>
  );
};

export default Portfolio;
