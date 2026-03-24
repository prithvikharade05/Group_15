import axios from './axios';

// Centralized API layer for backend integration

export const api = {
    // Market Data
    getStocks: () => axios.get('/stocks/'),
    getStockData: (symbol) => axios.get(`/stocks/${symbol}/`),

    // Model Management
    getModels: () => axios.get('/models/'),
    runModel: (model, symbol) => axios.post('/models/run/', { model, symbol }),
    getModelResults: (symbol) => axios.get(`/models/results/${symbol}/`),

    // Predictions
    getPredictions: (symbol) => axios.get(`/predictions/${symbol}/`),
    runPrediction: (symbol, model) => axios.post('/predictions/', { symbol, model }),

    // User Authentication
    login: (credentials) => axios.post('/auth/login/', credentials),
    register: (userData) => axios.post('/auth/register/', userData),
    logout: () => axios.post('/auth/logout/'),

    // Portfolio
    getPortfolio: () => axios.get('/portfolio/'),
    addStock: (symbol) => axios.post('/portfolio/add/', { symbol }),
    removeStock: (symbol) => axios.delete(`/portfolio/remove/${symbol}/`),

    // Sentiment Analysis
    getSentiment: (symbol) => axios.get(`/api/sentiment/${symbol}/`),

    // Chatbot
    getChatResponse: (message) => axios.post('/api/chat/', { message }),
};
