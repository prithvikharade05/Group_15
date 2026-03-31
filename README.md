# AlphaMind - AI-Powered Trading Platform 🚀

AlphaMind is an end-to-end trading intelligence suite that fuses live market data, multi-model forecasting, sentiment analytics, and a conversational copilot. The platform pairs a Django/DRF + PostgreSQL core with a React/Tailwind experience, and layers TensorFlow/PyTorch models plus LangGraph-powered chat for decision support.

## Value at a glance ✨
- ⚡ Real-time market fabric: `prediction/fetch_engine.py` orchestrates TwelveData calls with disk/memory caches, DB snapshots, and rate limiting to stay compliant while keeping quotes fresh.
- 🧠 Ensemble forecasting: ARIMA, CNN-LSTM, and Linear Regression in `prediction/models/` behind a unified run endpoint for rapid what-if analysis.
- 📊 Portfolio intelligence: Sector fetch + KMeans labeling in `portfolio/views.py` surface strong/neutral/weak movers, trend bias, and leaders/laggards.
- 📰 Sentiment radar: `sentiment/views.py` scrapes sector news, scores it, and returns key drivers, risk signals, and a concise narrative.
- 🤖 AI copilot: `chatbot/pipeline.py` blends Chroma vector search with Gemini (optional) and a rule-based fallback so answers never go dark.
- 🔐 Defense in depth: JWT auth plus MPIN second factor (`accounts/views.py`, `frontend/src/pages/MPIN.jsx`) guard privileged actions.
- 🎛️ Immersive UX: Cinematic landing page and data-rich dashboard (`frontend/src/pages/Landing.jsx`, `frontend/src/pages/Dashboard.jsx`) with model controls, prediction cards, and an embedded chat drawer.

## Tech stack & tooling 🧰
- Backend: Django 5, Django REST Framework, PostgreSQL, SimpleJWT, CORS Headers.
- Data/ML: TensorFlow, Keras, PyTorch, scikit-learn, statsmodels, pandas, numpy, ChromaDB (vector store), LangGraph, SentenceTransformers, TwelveData REST API.
- Frontend: React, Tailwind CSS, Axios, React Router.
- Infra/ops: dotenv for config, requests/httpx, uvicorn/fastapi deps (Chroma), throttling/caching in `prediction/fetch_engine.py`, rate gate + disk/memory cache.
- Security: JWT + MPIN flow, auth middleware, global 401 interceptor in `frontend/src/api/axios.js`.

## Architecture map 🗺️
- `core/` - Django settings, URLs, CORS/JWT config.
- `accounts/` - Custom user + MPIN and JWT endpoints.
- `portfolio/` - Sector/portfolio listing, clustering, market snapshots.
- `prediction/` - Data fetcher, model runners (ARIMA, LSTM, Regression, Clustering), scheduler, market quotes.
- `sentiment/` - News scrape and sentiment aggregation.
- `chatbot/` - Sessioned chat API, LangGraph pipeline, Chroma persistence.
- `frontend/` - React + Tailwind UI (landing, login, MPIN, dashboard, API client).

## Key API surface (prefixed with `/api`) 📡
- Auth: `POST /auth/register/`, `POST /auth/login/`, `POST /auth/set-mpin/`, `POST /auth/verify-mpin/`, `GET /auth/profile/`.
- Market data: `GET /market/`, `GET /quote/?symbol=`, `GET /stocks/`, `GET /stocks/<sym>/`.
- Predictions: `POST /arima/`, `POST /lstm/`, `POST /regression/`, `POST /cluster/`, `GET /predictions/<sym>/`, `POST /models/run/`.
- Portfolio & sectors: `GET /portfolio/`, `GET /portfolios/`, `GET /sectors/?portfolio=`, `GET /stocks/?portfolio=&sector=`, `GET /sector-data/`, `GET /cluster-data/`.
- Sentiment: `GET /sentiment/sector/<name>/`.
- Chatbot: `POST /chatbot/sessions/`, `GET /chatbot/sessions/`, `POST /chatbot/sessions/<id>/messages/`, `GET /chatbot/sessions/<id>/`.

## Runbook (local) 🛠️
Prereqs: Python 3.12+, Node 18+, PostgreSQL, TwelveData API key; Gemini key optional for richer chat.

Backend
- `python -m venv venv && ./venv/Scripts/activate`
- `pip install -r requirements.txt`
- Create `.env` with `TWELVEDATA_API_KEY=...` and optionally `GEMINI_API_KEY=...`
- Set DB creds in `core/settings.py` or via env vars
- `python manage.py migrate`
- `python manage.py runserver 0.0.0.0:8000`

Frontend
- `cd frontend`
- `npm install`
- `npm start` (dev) or `npm run build` (prod)
- Axios base URL auto-switches: `http://127.0.0.1:8000/api` (dev) vs `/api` (prod) in `frontend/src/api/axios.js`.

## Demo path 🎯
1. Register and log in (JWT issued).
2. Set a 4 digit MPIN to unlock protected views.
3. Landing -> Dashboard: pick a stock, add to portfolio, trigger ARIMA/LSTM/Regression runs, and read prediction cards.
4. Open the chat drawer for strategy Q&A; Gemini-enhanced answers use retrieved stock context.
5. Call sector sentiment and clustering endpoints for macro color.

## Operational notes 🧭
- Market calls are throttled and cached (memory + disk + Postgres) to respect TwelveData limits while serving fresh prices.
- Clustering and sentiment enrich sector views with labels and concise narrative insights.
- Chroma DB lives in `data/chroma_db`; safe to clear for a clean rebuild.
- Toggle DEBUG/ALLOWED_HOSTS in `core/settings.py` before deploying.

## Test and quality gates ✅
- Backend: `python manage.py test`
- Frontend: `npm test`

Made with ❤️ By Prithviraj
