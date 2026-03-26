import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    const observerRef = useRef(null);

    useEffect(() => {
        // Intersection Observer for scroll-triggered fade-in animations
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.reveal');
        elements.forEach((el) => observerRef.current.observe(el));

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, []);

    const scrollToNext = () => {
        const el = document.getElementById('value-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="landing-v2">

            {/* ═══════════════════════════════════════════════ */}
            {/* STEP 1 — FULLSCREEN VIDEO HERO                  */}
            {/* ═══════════════════════════════════════════════ */}
            <section className="hero-v2">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="video-bg"
                    aria-hidden="true"
                >
                    <source src="/media/trading-loop.mp4" type="video/mp4" />
                </video>

                {/* Very-light overlay — just enough for text legibility */}
                <div className="hero-overlay" />

                <div className="hero-center">
                    <div className="hero-content-float">
                        <h1 className="hero-title-v2">AlphaMind</h1>
                        <h2 className="hero-subtitle-v2">The Future of AI Powered Trading</h2>
                        <p className="hero-desc-v2">
                            Multi-model intelligence platform delivering real-time stock predictions,
                            AI insights, and institutional-grade analytics.
                        </p>
                        <div className="hero-cta-v2">
                            <Link to="/dashboard" className="btn-glow-primary">
                                Launch Dashboard
                            </Link>
                            <Link to="/dashboard" className="btn-glow-secondary">
                                Explore Models
                            </Link>
                        </div>
                    </div>
                </div>

                {/* STEP 2 — Scroll Indicator */}
                <button className="scroll-indicator" onClick={scrollToNext} aria-label="Scroll down">
                    <span className="scroll-arrow">↓</span>
                    <span className="scroll-label">Scroll</span>
                </button>
            </section>

            {/* ═══════════════════════════════════════════════ */}
            {/* STEP 3 — VALUE PROPOSITION  (3D cards)         */}
            {/* ═══════════════════════════════════════════════ */}
            <section className="value-v2" id="value-section">
                <div className="container-v2">
                    <h2 className="section-title-v2 reveal">What We Deliver</h2>
                    <div className="features-grid-v2">

                        {[
                            { icon: '📊', title: 'Real-time Stock Intelligence', desc: 'Live market data with AI-powered insights and trend analysis.' },
                            { icon: '🤖', title: 'Multi-model Predictions',      desc: 'ARIMA, LSTM, and Regression models working together for accuracy.' },
                            { icon: '🧠', title: 'AI-driven Insights',           desc: 'Advanced algorithms providing actionable trading recommendations.' },
                            { icon: '⚡', title: 'Automated Data Pipelines',     desc: 'Seamless integration with real-time data sources and processing.' },
                        ].map((f, i) => (
                            <div className="feature-card-v2 reveal" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="feature-icon-v2">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                                <div className="card-glow" />
                            </div>
                        ))}

                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════ */}
            {/* STEP 4 — HOW IT WORKS (Horizontal Timeline)    */}
            {/* ═══════════════════════════════════════════════ */}
            <section className="how-v2">
                <div className="container-v2">
                    <h2 className="section-title-v2 reveal">How It Works</h2>
                    <div className="timeline-wrapper">
                        <div className="timeline-track" />
                        {[
                            { n: '1', title: 'Select Stock',        desc: 'Choose from thousands of available stocks and assets.' },
                            { n: '2', title: 'Fetch Live Data',      desc: 'Real-time data retrieval from integrated market sources.' },
                            { n: '3', title: 'Store & Process',      desc: 'Advanced data processing and preparation for analysis.' },
                            { n: '4', title: 'Run ML Model',         desc: 'Multiple AI models analyze patterns and generate predictions.' },
                            { n: '5', title: 'Generate Prediction',  desc: 'Comprehensive analysis with charts and actionable insights.' },
                        ].map((s, i) => (
                            <div className="timeline-step reveal" key={i}>
                                <div className="step-circle">{s.n}</div>
                                <div className="step-body">
                                    <h3>{s.title}</h3>
                                    <p>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════ */}
            {/* STEP 5 — AI CAPABILITIES GRID                  */}
            {/* ═══════════════════════════════════════════════ */}
            <section className="capabilities-v2">
                <div className="container-v2">
                    <h2 className="section-title-v2 reveal">Our AI Capabilities</h2>
                    <div className="capabilities-grid-v2">
                        {[
                            { title: 'ARIMA Forecasting',    desc: 'Time series analysis for trend prediction and seasonal patterns.',        icon: '📈' },
                            { title: 'LSTM + CNN Prediction', desc: 'Deep learning models for complex pattern recognition.',                   icon: '🔮' },
                            { title: 'Regression Analysis',  desc: 'Statistical modeling for price movement prediction.',                     icon: '📉' },
                            { title: 'Clustering Engine',    desc: 'Market segmentation and asset correlation analysis.',                      icon: '🔗' },
                            { title: 'Portfolio Allocator',  desc: 'Optimal asset distribution based on risk and return analysis.',            icon: '💼' },
                            { title: 'Sentiment Nexus',      desc: 'NLP-driven market sentiment analysis from news and social media.',         icon: '🧬' },
                            { title: 'AI Advisor',           desc: 'Personalized trading recommendations and strategy guidance.',              icon: '🤖' },
                        ].map((c, i) => (
                            <div className="capability-card-v2 reveal" key={i}>
                                <span className="cap-icon">{c.icon}</span>
                                <h3>{c.title}</h3>
                                <p>{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════ */}
            {/* STEP 6 — INTELLIGENCE ENGINES (NEW SECTION)    */}
            {/* ═══════════════════════════════════════════════ */}
            <section className="engines-v2">
                <div className="container-v2">
                    <h2 className="section-title-v2 reveal">⚡ Intelligence Engines Powering AlphaMind</h2>
                    <div className="engines-grid">
                        {[
                            { icon: '🔗', title: 'Clustering Engine',        desc: 'Groups correlated assets using K-Means & DBSCAN to reveal hidden market structures and inter-sector relationships.' },
                            { icon: '🧬', title: 'Sentiment Analysis Engine', desc: 'NLP pipeline parses financial news, earnings calls, and social signals to derive real-time market mood scores.' },
                            { icon: '🔮', title: 'Prediction Models',         desc: 'Ensemble of ARIMA for classical series, LSTM for sequential deep learning, capturing short and long-term patterns.' },
                            { icon: '💼', title: 'Portfolio Optimizer',        desc: 'Markowitz mean-variance framework calculates the efficient frontier for risk-adjusted optimal allocation.' },
                        ].map((e, i) => (
                            <div className="engine-card reveal" key={i}>
                                <div className="engine-icon">{e.icon}</div>
                                <h3>{e.title}</h3>
                                <p>{e.desc}</p>
                                <div className="engine-glow" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════ */}
            {/* STEP 7 — TRUST SECTION                         */}
            {/* ═══════════════════════════════════════════════ */}
            <section className="trust-v2">
                <div className="container-v2">
                    <h2 className="section-title-v2 reveal">Trusted by Professionals</h2>
                    <div className="trust-grid">
                        {[
                            { icon: '⚡', title: 'Real-time Processing',    desc: 'Sub-second data processing and prediction generation.' },
                            { icon: '🔗', title: 'Backend Integration',     desc: 'Seamless connection with institutional-grade data sources.' },
                            { icon: '📈', title: 'Scalable Architecture',   desc: 'Enterprise-level infrastructure handling millions of requests.' },
                        ].map((t, i) => (
                            <div className="trust-card reveal" key={i}>
                                <div className="trust-icon-v2">{t.icon}</div>
                                <h3>{t.title}</h3>
                                <p>{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════ */}
            {/* STEP 8 — FINAL CTA                             */}
            {/* ═══════════════════════════════════════════════ */}
            <section className="final-cta-v2">
                <div className="cta-inner reveal">
                    <h2 className="cta-title-v2">Start Using AlphaMind Today</h2>
                    <p className="cta-subtitle-v2">
                        Join thousands of traders who have already discovered the power of AI-driven trading.
                    </p>
                    <Link to="/dashboard" className="btn-cta-pulse">
                        Get Started →
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default Landing;