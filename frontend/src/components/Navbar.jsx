import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/stock/${search.trim().toUpperCase()}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* Left: Logo & Subtitle */}
        <div
          className="flex flex-col justify-center flex-shrink-0 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <h1 className="text-3xl font-extrabold tracking-tight leading-none">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-400 bg-clip-text text-transparent">
              AlphaMind
            </span>
          </h1>
          <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-0.5">
            The Future of AI Powered Trading
          </span>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-2.5 border-2 border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300 text-sm font-medium text-slate-700"
              placeholder="Search stocks, indices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Right: Navigation Links + Auth */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-slate-600 hover:text-purple-600 text-sm font-semibold transition-all duration-200 hover:scale-105 transform tracking-wide"
          >
            Dashboard
          </Link>
          <Link
            to="/stock"
            className="text-slate-600 hover:text-purple-600 text-sm font-semibold transition-all duration-200 hover:scale-105 transform tracking-wide"
          >
            Models
          </Link>
          <Link
            to="/portfolio"
            className="text-slate-600 hover:text-purple-600 text-sm font-semibold transition-all duration-200 hover:scale-105 transform tracking-wide"
          >
            Portfolio
          </Link>

          <div className="w-px h-6 bg-slate-200 mx-1" />

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-sm font-bold shadow-md shadow-purple-200 hover:shadow-purple-300 hover:scale-105 transition-all duration-200 border border-purple-400/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-slate-600 hover:text-purple-600 text-sm font-semibold transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-sm font-bold shadow-md shadow-purple-200 hover:scale-105 transition-all duration-200"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2 flex flex-col gap-3">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              className="block w-full pl-4 pr-4 py-2.5 border-2 border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-all duration-300 text-sm"
              placeholder="Search stocks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <Link to="/" className="text-slate-600 hover:text-purple-600 text-sm font-semibold py-1" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/dashboard" className="text-slate-600 hover:text-purple-600 text-sm font-semibold py-1" onClick={() => setMenuOpen(false)}>Models</Link>
          <Link to="/portfolio" className="text-slate-600 hover:text-purple-600 text-sm font-semibold py-1" onClick={() => setMenuOpen(false)}>Portfolio</Link>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-sm font-bold shadow-md text-center"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-center text-slate-600 hover:text-purple-600 text-sm font-semibold py-1" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="text-center w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-sm font-bold shadow-md" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
