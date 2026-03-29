# Fix 404 API Errors - Progress Tracker

## Step 1: Backend - Add ProfileView [DONE]
- Edit accounts/views.py: Add ProfileView class ✓
- Edit accounts/urls.py: Add path('profile/', ProfileView.as_view()), ✓

## Step 2: Backend - Add StocksView & ModelsView [DONE]
- Edit prediction/views.py: Add StocksView (TwelveData-backed list), ModelsView (static list) ✓
- Edit prediction/urls.py: Add paths ✓

## Step 3: Backend - Add PortfolioListView [DONE]
- Edit portfolio/views.py: Add PortfolioListView (mock data) ✓
- Edit portfolio/urls.py: Add path('', PortfolioListView.as_view()), ✓

## Step 4: Frontend - Fix MarketService [DONE]
- Edit frontend/src/api/service.js: Change '/predict/market/' to '/api/market/' ✓

## Step 5: Test [TODO]
- makemigrations/migrate if needed (no)
- Restart Django server
- Refresh frontend, check console no 404s

Progress: 4/5 complete

