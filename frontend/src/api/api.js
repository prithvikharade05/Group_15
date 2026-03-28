import API from './axios';

// Centralized API layer for backend integration

export const api = {
    // Market Data
    getStocks: () => API.get('/stocks/'),
    getStockData: (symbol) => API.get(`/stocks/${symbol}/`),

    // Model Management
    getModels: () => API.get('/models/'),
    runModel: (model, symbol) => API.post('/models/run/', { model, symbol }),
    // Removed getModelResults as it doesn't exist in backend URLs

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
    getSentiment: (sector) => API.get(`/sentiment/sector/${sector}/`),

    // Chatbot
    getChatResponse: (sessionId, message) => API.post(`/chatbot/sessions/${sessionId}/messages/`, { message }),
    createSession: () => API.post('/chatbot/sessions/'),
};
