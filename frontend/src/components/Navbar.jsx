import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Minimal user stub to prevent breaking old state checks, though not functionally required for layout demo
  const user = { name: "Operator" };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/stock/${search.trim().toUpperCase()}`);
      setSearch('');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-30 flex items-center justify-between">

        {/* Left: Logo & Subtitle */}
        <div className="flex flex-col justify-center flex-shrink-0 cursor-pointer group" onClick={() => navigate('/')}>
          <h1 className="text-5xl font-extrabold tracking-tight font-space mb-1">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-400 bg-clip-text text-transparent animate-pulse">
              AlphaMind
            </span>
          </h1>
          <span className="text-xs text-slate-600 font-medium tracking-widest uppercase opacity-100 group-hover:opacity-100 transition-all duration-300">
            The Future of AI Powered Trading
          </span>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl leading-6 bg-gradient-to-r from-slate-50 to-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:shadow-lg transition-all duration-300 font-inter text-sm font-medium"
              placeholder="Search stocks, indices, or macro trends..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Right: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-slate-600 hover:text-purple-600 text-base font-semibold transition-all duration-300 hover:scale-105 transform font-inter tracking-wide">Dashboards</Link>
          <Link to="/dashboard" className="text-slate-600 hover:text-purple-600 text-base font-semibold transition-all duration-300 hover:scale-105 transform font-inter tracking-wide">Models</Link>
          <Link to="/portfolio" className="text-slate-600 hover:text-purple-600 text-base font-semibold transition-all duration-300 hover:scale-105 transform font-inter tracking-wide">Portfolio</Link>
          <Link to="/" className="text-slate-600 hover:text-purple-600 text-base font-semibold transition-all duration-300 hover:scale-105 transform font-inter tracking-wide">AI Insights</Link>

          <div className="w-px h-8 bg-gradient-to-b from-transparent via-purple-300 to-transparent mx-4" />

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-12">
              {user.name.charAt(0)}
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-700">{user.name}</div>
              <div className="text-xs text-slate-400 font-medium">AI Operator</div>
            </div>
          </div>
        </nav>

      </div>
    </header>
  );
};

export default Navbar;
