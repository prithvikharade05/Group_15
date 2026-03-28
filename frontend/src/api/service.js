import API from './axios';

export const MarketService = {
  getTicker: () => API.get('/market/'),
  getQuote: (symbol) => API.get(`/quote/?symbol=${symbol}`),
};

export const PredictionService = {
  runArima: (symbol, days) => API.post('/arima/', { symbol, days }),
  runLstm: (symbol, days) => API.post('/lstm/', { symbol, days }),
  runRegression: (symbol, days) => API.post('/regression/', { symbol, days }),
  runCluster: (stocks) => API.post('/cluster/', { stocks }),
};

export const PortfolioService = {
  addStock: (symbol) => API.post('/portfolio/add/', { symbol }),
  removeStock: (symbol) => API.delete(`/portfolio/remove/${symbol}/`),
};

export const SentimentService = {
  analyze: (sector) => API.get(`/sentiment/sector/${sector}/`),
};

export const ChatbotService = {
  createSession: () => API.post('/chatbot/sessions/'),
  ask: (sessionId, message) => API.post(`/chatbot/sessions/${sessionId}/messages/`, { message }),
};
