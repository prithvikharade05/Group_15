import API from './axios';

// Centralized API layer for backend integration

export const api = {
    // Market Data
    getStocks: () => API.get('/stocks/'),
    getStockData: (symbol) => API.get(`/stocks/${symbol}/`),

    // Model Management
    getModels: () => API.get('/models/'),
    runModel: (model, symbol) => API.post('/models/run/', { model, symbol }),
    getModelResults: (symbol) => API.get(`/models/results/${symbol}/`),

    // Predictions
    getPredictions: (symbol) => API.get(`/predictions/${symbol}/`),
    runPrediction: (symbol, model) => API.post('/predictions/', { symbol, model }),

    // User Authentication
    login: (credentials) => API.post('/auth/login/', credentials),
    register: (userData) => API.post('/auth/register/', userData),
    logout: () => API.post('/auth/logout/'),

    // Portfolio
    getPortfolio: () => API.get('/portfolio/'),
    addStock: (symbol) => API.post('/portfolio/add/', { symbol }),
    removeStock: (symbol) => API.delete(`/portfolio/remove/${symbol}/`),

    // Sentiment Analysis
    getSentiment: (symbol) => API.get(`/sentiment/${symbol}/`),

    // Chatbot
    getChatResponse: (message) => API.post('/chat/', { message }),
};
