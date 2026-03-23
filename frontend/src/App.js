import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from './api/axios';
import './App.css';
import Navbar from './components/Navbar';
import MarketStrip from './components/MarketStrip';
import Login from "./pages/Login";
import Register from "./pages/Register";
import MPIN from "./pages/MPIN";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import StockDetail from "./pages/StockDetail";
import Landing from "./pages/Landing";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile();
    }
    fetchMarketData();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile/');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await axios.get('/api/market/');
      setMarketData(response.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <MarketStrip data={marketData} loading={loading} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={
            isLoggedIn ? <Dashboard /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mpin" element={<MPIN />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
