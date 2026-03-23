import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    return (
        <div className="landing">
            {/* HERO SECTION */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">AlphaMind</h1>
                        <h2 className="hero-subtitle">The Future of AI Powered Trading</h2>
                        <p className="hero-description">
                            Multi-model intelligence platform delivering real-time stock predictions,
                            AI insights, and institutional-grade analytics.
                        </p>
                        <div className="hero-cta">
                            <Link to="/dashboard" className="btn-primary">Launch Dashboard</Link>
                            <Link to="/dashboard" className="btn-secondary">Explore Models</Link>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="ai-illustration">
                            <div className="ai-circle">
                                <div className="ai-dot"></div>
                                <div className="ai-dot"></div>
                                <div className="ai-dot"></div>
                            </div>
                            <div className="ai-wave"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VALUE PROPOSITION */}
            <section className="value-prop">
                <div className="container">
                    <h2 className="section-title">What We Deliver</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Real-time Stock Intelligence</h3>
                            <p>Live market data with AI-powered insights and trend analysis.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🤖</div>
                            <h3>Multi-model Predictions</h3>
                            <p>ARIMA, LSTM, and Regression models working together for accuracy.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🧠</div>
                            <h3>AI-driven Insights</h3>
                            <p>Advanced algorithms providing actionable trading recommendations.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3>Automated Data Pipelines</h3>
                            <p>Seamless integration with real-time data sources and processing.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="process-flow">
                        <div className="process-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Select Stock</h3>
                                <p>Choose from thousands of available stocks and assets.</p>
                            </div>
                        </div>
                        <div className="process-arrow">→</div>
                        <div className="process-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Fetch Live Data</h3>
                                <p>Real-time data retrieval from integrated market sources.</p>
                            </div>
                        </div>
                        <div className="process-arrow">→</div>
                        <div className="process-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Store & Process</h3>
                                <p>Advanced data processing and preparation for analysis.</p>
                            </div>
                        </div>
                        <div className="process-arrow">→</div>
                        <div className="process-step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h3>Run ML Model</h3>
                                <p>Multiple AI models analyze patterns and generate predictions.</p>
                            </div>
                        </div>
                        <div className="process-arrow">→</div>
                        <div className="process-step">
                            <div className="step-number">5</div>
                            <div className="step-content">
                                <h3>Generate Prediction</h3>
                                <p>Comprehensive analysis with charts and actionable insights.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="stats">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <h3 className="stat-number">15+</h3>
                            <p className="stat-label">AI Models</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="stat-number">10M+</h3>
                            <p className="stat-label">Data Points</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="stat-number">95%</h3>
                            <p className="stat-label">Accuracy Rate</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="stat-number">24/7</h3>
                            <p className="stat-label">Active Tracking</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI CAPABILITIES */}
            <section className="capabilities">
                <div className="container">
                    <h2 className="section-title">Our AI Capabilities</h2>
                    <div className="capabilities-grid">
                        <div className="capability-card">
                            <h3>ARIMA Forecasting</h3>
                            <p>Time series analysis for trend prediction and seasonal patterns.</p>
                        </div>
                        <div className="capability-card">
                            <h3>LSTM + CNN Prediction</h3>
                            <p>Deep learning models for complex pattern recognition.</p>
                        </div>
                        <div className="capability-card">
                            <h3>Regression Analysis</h3>
                            <p>Statistical modeling for price movement prediction.</p>
                        </div>
                        <div className="capability-card">
                            <h3>Clustering Engine</h3>
                            <p>Market segmentation and asset correlation analysis.</p>
                        </div>
                        <div className="capability-card">
                            <h3>Portfolio Allocator</h3>
                            <p>Optimal asset distribution based on risk and return analysis.</p>
                        </div>
                        <div className="capability-card">
                            <h3>Sentiment Nexus</h3>
                            <p>NLP-driven market sentiment analysis from news and social media.</p>
                        </div>
                        <div className="capability-card">
                            <h3>AI Advisor</h3>
                            <p>Personalized trading recommendations and strategy guidance.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST SECTION */}
            <section className="trust">
                <div className="container">
                    <h2 className="section-title">Trusted by Professionals</h2>
                    <div className="trust-content">
                        <div className="trust-item">
                            <div className="trust-icon">⚡</div>
                            <h3>Real-time Processing</h3>
                            <p>Sub-second data processing and prediction generation.</p>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon">🔗</div>
                            <h3>Backend Integration</h3>
                            <p>Seamless connection with institutional-grade data sources.</p>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon">📈</div>
                            <h3>Scalable Architecture</h3>
                            <p>Enterprise-level infrastructure handling millions of requests.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="final-cta">
                <div className="container">
                    <h2 className="cta-title">Start Using AlphaMind Today</h2>
                    <p className="cta-subtitle">
                        Join thousands of traders who have already discovered the power of AI-driven trading.
                    </p>
                    <Link to="/dashboard" className="btn-primary btn-large">Get Started</Link>
                </div>
            </section>
        </div>
    );
};

export default Landing;