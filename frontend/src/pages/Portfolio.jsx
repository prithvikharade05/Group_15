import React, { useState } from 'react';
import './Portfolio.css';

const Portfolio = () => {
    const [view, setView] = useState('overview'); // 'overview', 'nifty', 'usa'

    const sectors = [
        "Financial Services",
        "Capital Goods",
        "Construction Materials",
        "Power",
        "Metals & Mining",
        "Services",
        "Oil Gas & Consumable Fuels",
        "Healthcare",
        "Consumer Durables",
        "Automobile and Auto Components",
        "Fast Moving Consumer Goods",
        "Telecommunication",
        "Information Technology",
        "Consumer Services",
        "Chemicals",
        "Realty",
        "Construction",
        "Textiles"
    ];

    const niftySectors = sectors.slice(0, 14);
    const usaSectors = sectors; // 18 sectors

    const renderOverview = () => (
        <div className="portfolio-grid">
            <div className="portfolio-card" onClick={() => setView('nifty')}>
                <h3>Nifty200 stocks</h3>
                <p>Track and analyze your top 200 Indian stocks from the Nifty index.</p>
            </div>

            <div className="portfolio-card" onClick={() => setView('usa')}>
                <h3>USA200 stocks</h3>
                <p>Monitor your selection of the top 200 US-based equity assets.</p>
            </div>
        </div>
    );

    const renderSectorView = (title, sectorList) => (
        <div>
            <button className="back-button" onClick={() => setView('overview')}>
                ← Back to Portfolios
            </button>
            <h2 className="portfolio-title">{title} - Sectors</h2>
            <div className="portfolio-grid">
                {sectorList.map((sector, index) => (
                    <div key={index} className="portfolio-card sector-card">
                        <h3>{sector}</h3>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="portfolio-container">
            {view === 'overview' && (
                <>
                    <h1 className="portfolio-title">Your Portfolios</h1>
                    {renderOverview()}
                </>
            )}
            {view === 'nifty' && renderSectorView('Nifty200 Stocks', niftySectors)}
            {view === 'usa' && renderSectorView('USA200 Stocks', usaSectors)}
        </div>
    );
};

export default Portfolio;
