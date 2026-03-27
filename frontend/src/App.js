import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import API from './api/axios';
import './App.css';
import Navbar from './components/Navbar';
import MarketStrip from './components/MarketStrip';
import ChatWidget from './components/chatbot/ChatWidget';
import Login from "./pages/Login";
import Register from "./pages/Register";
import MPIN from "./pages/MPIN";
import Dashboard from "./pages/Dashboard";
import StockDetail from "./pages/StockDetail";
import Landing from "./pages/Landing";
import Portfolio from "./pages/Portfolio";
import SectorSentiment from "./pages/SectorSentiment";

// ── Protected Route ─────────────────────────────────────────
// Requires both token AND mpinVerified; otherwise redirects to /login
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mpinVerified, setMpinVerified] = useState(
    () => localStorage.getItem('mpinVerified') === 'true'
  );
  const [user, setUser] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  // User is fully authenticated only after login + MPIN
  const isAuthenticated = isLoggedIn && mpinVerified;

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await API.get('/api/auth/profile/');
      setUser(response.data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setIsLoggedIn(false);
      localStorage.removeItem('token');
    }
  }, []);

  const fetchMarketData = useCallback(async () => {
    try {
      const response = await API.get('/api/market/');
      setMarketData(response.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile();
    } else {
      setIsLoggedIn(false);
    }
    fetchMarketData();
  }, [fetchUserProfile, fetchMarketData]);

  // Called after successful login (pre-MPIN)
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    // Do NOT set mpinVerified here — user must pass MPIN first
  };

  // Called after successful MPIN verification
  const handleMpinSuccess = () => {
    localStorage.setItem('mpinVerified', 'true');
    setMpinVerified(true);
  };

  // Full logout — clears token, mpinVerified, resets state
  const handleLogout = () => {
    setIsLoggedIn(false);
    setMpinVerified(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('mpinVerified');
  };

  return (
    <Router>
      <div className="App">
        <Navbar
          isLoggedIn={isLoggedIn}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
        <MarketStrip data={marketData} loading={loading} />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/mpin" element={<MPIN onMpinSuccess={handleMpinSuccess} />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/stock" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StockDetail />
            </ProtectedRoute>
          } />
          <Route path="/stock/:symbol" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StockDetail />
            </ProtectedRoute>
          } />
          <Route path="/portfolio" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Portfolio />
            </ProtectedRoute>
          } />
          <Route path="/portfolio/:sector" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Portfolio />
            </ProtectedRoute>
          } />
          <Route path="/sector-sentiment/:sector" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SectorSentiment />
            </ProtectedRoute>
          } />
        </Routes>

        {/* Global floating chatbot — visible on all pages when authenticated */}
        <ChatWidget isAuthenticated={isAuthenticated} />
      </div>
    </Router>
  );
}

export default App;
