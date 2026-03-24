import { useState, useEffect } from 'react';
import { MarketService } from '../api/service';

const MarketStrip = () => {
  const [tickers, setTickers] = useState([]);

  // Nifty 50 stocks list
  const nifty50Stocks = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS',
    'ICICIBANK.NS', 'SBIN.NS', 'KOTAKBANK.NS', 'BAJFINANCE.NS',
    'BHARTIARTL.NS', 'ITC.NS', 'AXISBANK.NS', 'LT.NS', 'ASIANPAINT.NS',
    'MARUTI.NS', 'WIPRO.NS', 'SUNPHARMA.NS', 'ULTRACEMCO.NS', 'NESTLEIND.NS',
    'INDUSINDBK.NS', 'JSWSTEEL.NS', 'GRASIM.NS', 'POWERGRID.NS', 'TATASTEEL.NS',
    'HDFCLIFE.NS', 'BAJAJFINSV.NS', 'DRREDDY.NS', 'EICHERMOT.NS', 'DIVISLAB.NS',
    'CIPLA.NS', 'SBILIFE.NS', 'SHREECEM.NS', 'APOLLOHOSP.NS',
    'COALINDIA.NS', 'UPL.NS', 'NTPC.NS', 'BPCL.NS', 'HEROMOTOCO.NS',
    'HINDALCO.NS', 'IOC.NS', 'ONGC.NS', 'ADANIPORTS.NS', 'GAIL.NS',
    'ADANIENT.NS', 'BAJAJ-AUTO.NS', 'SIEMENS.NS', 'VEDL.NS',
    'GODREJCP.NS', 'AMBUJACEM.NS', 'HAVELLS.NS', 'BOSCHLTD.NS',
    'DABUR.NS', 'BEL.NS', 'BRITANNIA.NS', 'CHOLAFIN.NS', 'COLPAL.NS'
  ];

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await MarketService.getTicker();
        if (response.data.success) {
          const allTickers = response.data.tickers || [];
          const symbolsToMatch = nifty50Stocks.map(s => s.replace('.NS', ''));
          
          const validTickers = allTickers
            .filter(t => symbolsToMatch.includes(t.symbol))
            .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
            
          if (validTickers.length > 0) {
            setTickers(validTickers);
          }
        }
      } catch (e) {
        console.error("Market strip error", e);
      }
    };

    fetchTickers();

    // Update every 3 seconds for real-time feel
    const interval = setInterval(fetchTickers, 5000);

    // No need for toggle functionality - always run continuously
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (tickers.length === 0) return null;

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '0.00';
    if (price >= 1000) {
      return `₹${(price / 1000).toFixed(2)}K`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)}L`;
    } else if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)}Cr`;
    }
    return `₹${price.toLocaleString()}`;
  };

  const formatVolume = (volume) => {
    if (volume === undefined || volume === null) return '0';
    if (volume >= 10000000) {
      return `${(volume / 10000000).toFixed(1)}Cr`;
    } else if (volume >= 100000) {
      return `${(volume / 100000).toFixed(1)}L`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toLocaleString();
  };

  return (
    <div className="w-full bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 border-b border-slate-700 overflow-hidden py-3 relative z-40 shadow-2xl shadow-black/50">
      {/* Premium Header */}
      <div className="flex items-center justify-between px-6 py-1 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-bold text-sm tracking-wider font-mono">LIVE</span>
          </div>
          <span className="text-slate-300 text-xs font-medium tracking-wide">NIFTY 50 REAL-TIME MARKET DATA</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 text-xs font-medium">Updated: {new Date().toLocaleTimeString()}</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Main Ticker */}
      <div className="relative">
        <div className="flex animate-[ticker_20s_linear_infinite] whitespace-nowrap">
          {[...tickers, ...tickers, ...tickers].map((ticker, index) => {
            const isPositive = ticker.change >= 0;
            const changeColor = isPositive ? 'from-emerald-400 to-emerald-600' : 'from-red-400 to-red-600';
            const bgColor = isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10';

            return (
              <div key={`${ticker.symbol}-${index}`} className="flex items-center space-x-2 mx-4 min-w-max group hover:bg-white/5 transition-all duration-300 px-2 py-1 rounded-lg">
                {/* Symbol with premium styling */}
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg tracking-wide font-mono group-hover:text-purple-300 transition-colors">
                    {ticker.symbol}
                  </span>
                  <span className="text-slate-400 text-sm font-medium tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatVolume(ticker.volume)} vol
                  </span>
                </div>

                {/* Price with gradient */}
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg font-mono bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {formatPrice(ticker.price)}
                  </span>
                  <span className="text-slate-400 text-sm font-medium font-mono">
                    {ticker.change_val !== undefined && ticker.change_val !== null ? (ticker.change_val >= 0 ? '+' : '') + ticker.change_val.toFixed(2) : '0.00'}
                  </span>
                </div>

                {/* Change with premium gradient */}
                <div className={`px-3 py-1 rounded-full border ${bgColor} border-current/20`}>
                  <span className={`font-bold text-sm font-mono bg-gradient-to-r ${changeColor} bg-clip-text text-transparent`}>
                    {isPositive ? '▲' : '▼'} {ticker.change !== undefined && ticker.change !== null ? (ticker.change >= 0 ? '+' : '') + ticker.change.toFixed(2) : '0.00'}%
                  </span>
                </div>

                {/* Decorative element */}
                <div className={`w-1 h-6 rounded-full ${isPositive ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-red-400 to-red-600'}`}></div>
              </div>
            );
          })}
        </div>

        {/* Gradient overlays for premium effect */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-900/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-900/80 to-transparent z-10 pointer-events-none"></div>

        {/* Speed control indicators */}

      </div>

      {/* Custom CSS for premium animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }

          .animate-[ticker_20s_linear_infinite] {
            animation: ticker 20s linear infinite;
          }

          /* Premium hover effects */
          .group:hover {
            transform: scale(1.02);
            box-shadow: 0 0 20px rgba(255, 255, 255, 1);
          }
        `
      }} />
    </div>
  );
};

export default MarketStrip;
