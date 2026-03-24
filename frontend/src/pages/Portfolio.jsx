import React, { useEffect, useState } from 'react';
import './Portfolio.css';

const Portfolio = () => {
    const [view, setView] = useState('overview');
    const [selectedPortfolio, setSelectedPortfolio] = useState('');
    const [sectors, setSectors] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [selectedSector, setSelectedSector] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchSectors = async (portfolio) => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/sectors/?portfolio=${portfolio}`);
            const data = await response.json();
            setSectors(data);
            setSelectedPortfolio(portfolio);
            setView('sectors');
        } catch (error) {
            console.error('Error fetching sectors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStocks = async (sector) => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://127.0.0.1:8000/api/stocks/?portfolio=${selectedPortfolio}&sector=${encodeURIComponent(sector)}`
            );
            const data = await response.json();
            setStocks(data);
            setSelectedSector(sector);
            setView('stocks');
        } catch (error) {
            console.error('Error fetching stocks:', error);
        } finally {
            setLoading(false);
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
                ← Back to Portfolios
            </button>
            <h2 className="portfolio-title">{selectedPortfolio} - Sectors</h2>
            <div className="portfolio-grid">
                {sectors.map((sector, index) => (
                    <div
                        key={index}
                        className="portfolio-card sector-card"
                        onClick={() => fetchStocks(sector)}
                    >
                        <h3>{sector}</h3>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStocksView = () => (
        <div>
            <button className="back-button" onClick={() => setView('sectors')}>
                ← Back to Sectors
            </button>
            <h2 className="portfolio-title">{selectedPortfolio} - {selectedSector}</h2>

            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Company</th>
                            <th style={thStyle}>Symbol</th>
                            <th style={thStyle}>LTP</th>
                            <th style={thStyle}>Change %</th>
                            <th style={thStyle}>Market Cap</th>
                            <th style={thStyle}>52W High</th>
                            <th style={thStyle}>52W Low</th>
                            <th style={thStyle}>Volume</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(stocks) && stocks.map((stock, index) => (
                            <tr key={index}>
                                <td style={tdStyle}>{stock.company}</td>
                                <td style={tdStyle}>{stock.symbol}</td>
                                <td style={tdStyle}>{stock.ltp ?? '-'}</td>
                                <td style={tdStyle}>{stock.change_percent ?? '-'}</td>
                                <td style={tdStyle}>{stock.market_cap || '-'}</td>
                                <td style={tdStyle}>{stock.high_52w ?? '-'}</td>
                                <td style={tdStyle}>{stock.low_52w ?? '-'}</td>
                                <td style={tdStyle}>{stock.volume || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="portfolio-container">
            <h1 className="portfolio-title">Your Portfolios</h1>

            {loading && <p>Loading...</p>}

            {!loading && view === 'overview' && renderOverview()}
            {!loading && view === 'sectors' && renderSectorView()}
            {!loading && view === 'stocks' && renderStocksView()}
        </div>
    );
};

const thStyle = {
    border: '1px solid #ddd',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    textAlign: 'left'
};

const tdStyle = {
    border: '1px solid #ddd',
    padding: '12px',
    textAlign: 'left'
};

export default Portfolio;