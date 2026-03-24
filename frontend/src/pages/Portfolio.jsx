import React from 'react';
import './Portfolio.css';

const Portfolio = () => {
    return (
        <div className="portfolio-container">
            <h1 className="portfolio-title">Your Portfolios</h1>
            
            <div className="portfolio-grid">
                <div className="portfolio-card">
                    <h3>Nifty200 stocks</h3>
                    <p>Track and analyze your top 200 Indian stocks from the Nifty index.</p>
                </div>

                <div className="portfolio-card">
                    <h3>USA200 stocks</h3>
                    <p>Monitor your selection of the top 200 US-based equity assets.</p>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
