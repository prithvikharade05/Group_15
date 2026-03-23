import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MarketStrip from "../components/MarketStrip";
import { MarketService } from "../api/service";

const MODELS_LIST = [
  { name: 'ARIMA Core', desc: 'Time series forecasting & moving average analysis', status: 'Active', key: 'arima' },
  { name: 'LSTM+CNN', desc: 'Deep learning sequence matrix prediction', status: 'Active', key: 'lstm' },
  { name: 'Regression', desc: 'Linear statistical modeling algorithms', status: 'Active', key: 'regression' },
  { name: 'Clustering Vectors', desc: 'Multi-asset classification logic', status: 'Standby', key: 'cluster' },
];

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [marketSnapshot, setMarketSnapshot] = useState([]);

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        const res = await MarketService.getTicker();
        if (res.data.success) {
          setMarketSnapshot(res.data.tickers);
        }
      } catch(e) {}
    };
    fetchSnapshot();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/stock/${search.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <MarketStrip />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        {/* 1. SEARCH-FIRST INTERFACE */}
        <div className="flex flex-col items-center justify-center py-16 mb-12 border-b border-slate-200">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 font-space tracking-tight">Search for a company</h2>
          <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl relative">
             <input 
               type="text" 
               className="w-full p-5 pl-6 pr-16 text-lg border-2 border-slate-200 rounded-xl shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-inter"
               placeholder="Eg: RELIANCE, TCS, HDFCBANK"
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
             <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
             </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* 2. QUICK MARKET SNAPSHOT */}
          <div className="col-span-1 lg:col-span-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 font-inter">Market Snapshot</h3>
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {marketSnapshot.map((tick, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-semibold text-slate-700">{tick.symbol}</td>
                      <td className="py-3 px-4 text-sm text-slate-900 text-right font-medium">₹{tick.price.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-sm text-right font-semibold ${tick.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tick.change >= 0 ? '+' : ''}{tick.change}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. AI MODELS SECTION (CLEAN LIST VIEW) */}
          <div className="col-span-1 lg:col-span-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 font-inter">Available AI Models</h3>
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Model Name</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MODELS_LIST.map((model, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-4 text-sm font-bold text-slate-800">{model.name}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{model.desc}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${model.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                          {model.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-sm text-blue-600 font-semibold hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors border border-blue-200 shadow-sm opacity-0 group-hover:opacity-100">
                          Execute →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="text-xs text-slate-400 mt-4 text-center">Execute individual matrix runs by searching a target ticker above.</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Home;
