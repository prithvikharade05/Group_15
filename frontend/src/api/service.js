import API from './axios';

export const MarketService = {
  getTicker: () => API.get('/api/market/'),
  getQuote: (symbol) => API.get(`/api/quote/?symbol=${symbol}`),
};

export const PredictionService = {
  runArima: (symbol, days) => API.post('/api/arima/', { symbol, days }),
  runLstm: (symbol, days) => API.post('/api/lstm/', { symbol, days }),
  runRegression: (symbol, days) => API.post('/api/regression/', { symbol, days }),
  runCluster: (stocks) => API.post('/api/cluster/', { stocks }),
};

export const PortfolioService = {
  analyze: (stocks) => API.post('/api/portfolio/analyze/', { stocks }),
};

export const SentimentService = {
  analyze: (symbol) => API.post('/api/sentiment/analyze/', { symbol }),
};

export const ChatbotService = {
  ask: (message) => API.post('/api/chatbot/ask/', { message }),
};
