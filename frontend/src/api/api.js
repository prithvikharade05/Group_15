import axios from './axios';

// Centralized API layer for backend integration

export const api = {
    // Market Data
    getStocks: () => axios.get('/api/stocks/'),
    getStockData: (symbol) => axios.get(`/api/stocks/${symbol}/`),

    // Model Management
    getModels: () => axios.get('/api/models/'),
    runModel: (model, symbol) => axios.post('/api/models/run/', { model, symbol }),
    getModelResults: (symbol) => axios.get(`/api/models/results/${symbol}/`),

    // Predictions
    getPredictions: (symbol) => axios.get(`/api/predictions/${symbol}/`),
    runPrediction: (symbol, model) => axios.post('/api/predictions/', { symbol, model }),

    // User Authentication
    login: (credentials) => axios.post('/api/auth/login/', credentials),
    register: (userData) => axios.post('/api/auth/register/', userData),
    logout: () => axios.post('/api/auth/logout/'),

    // Portfolio
    getPortfolio: () => axios.get('/api/portfolio/'),
    addStock: (symbol) => axios.post('/api/portfolio/add/', { symbol }),
    removeStock: (symbol) => axios.delete(`/api/portfolio/remove/${symbol}/`),

    // Sentiment Analysis
    getSentiment: (symbol) => axios.get(`/api/sentiment/${symbol}/`),

    // Chatbot
    getChatResponse: (message) => axios.post('/api/chat/', { message }),
};
