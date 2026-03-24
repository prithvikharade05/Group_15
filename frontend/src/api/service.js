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
  analyze: (stocks) => API.post('/portfolio/analyze/', { stocks }),
};

export const SentimentService = {
  analyze: (symbol) => API.post('/sentiment/analyze/', { symbol }),
};

export const ChatbotService = {
  ask: (message) => API.post('/chatbot/ask/', { message }),
};
