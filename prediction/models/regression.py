# 🔥 REGRESSION ENGINE (FIXED - MULTI DAY FORECAST)

import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import warnings

warnings.filterwarnings('ignore')


# =========================
# FETCH DATA
# =========================
def fetch_stock_data(symbol, period="max"):
    try:
        df = yf.Ticker(symbol + ".NS").history(period=period)
        return df if not df.empty else None
    except:
        return None


# =========================
# FEATURES
# =========================
def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    rs = gain.rolling(period).mean() / loss.rolling(period).mean()
    return 100 - (100 / (1 + rs))


def create_features(df):
    df = df.copy()
    close = df['Close']

    df['return_1d'] = close.pct_change(1)
    df['return_5d'] = close.pct_change(5)
    df['ma20'] = close.rolling(20).mean()
    df['ma50'] = close.rolling(50).mean()
    df['volatility'] = close.rolling(20).std()
    df['rsi'] = calculate_rsi(close)

    df['target'] = close.pct_change().shift(-1)

    return df.dropna()


# =========================
# TRAIN MODEL
# =========================
def train_model(data):

    features = ['return_1d', 'return_5d', 'ma20', 'ma50', 'volatility', 'rsi']

    X = data[features].values
    y = data['target'].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = LinearRegression()
    model.fit(X_scaled, y)

    return model, scaler, features


# =========================
# 🔥 MULTI DAY FORECAST
# =========================
def forecast_next_days(df, model, scaler, features, days=5):

    predictions = []

    temp_close = df['Close'].tolist()

    for i in range(days):

        close_series = pd.Series(temp_close)

        # 🔥 RECOMPUTE FEATURES ONLY FROM CLOSE
        return_1d = close_series.pct_change(1).iloc[-1]
        return_5d = close_series.pct_change(5).iloc[-1]
        ma20 = close_series.rolling(20).mean().iloc[-1]
        ma50 = close_series.rolling(50).mean().iloc[-1]
        volatility = close_series.rolling(20).std().iloc[-1]

        # RSI
        delta = close_series.diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        rs = gain.rolling(14).mean() / loss.rolling(14).mean()
        rsi = (100 - (100 / (1 + rs))).iloc[-1]

        X = np.array([
            return_1d,
            return_5d,
            ma20,
            ma50,
            volatility,
            rsi
        ]).reshape(1, -1)

        # Handle NaN
        if np.isnan(X).any():
            predictions.append(float(temp_close[-1]))
            temp_close.append(temp_close[-1])
            continue

        X_scaled = scaler.transform(X)

        pred_return = model.predict(X_scaled)[0]

        last_price = temp_close[-1]
        next_price = last_price * (1 + pred_return)

        predictions.append(float(next_price))

        # 🔥 APPEND NEW PRICE (CRITICAL)
        temp_close.append(next_price)

    return predictions

# =========================
# MAIN FUNCTION
# =========================
def run_regression_forecast(symbol, days=5):

    df = fetch_stock_data(symbol)

    if df is None:
        return {"success": False, "error": "Data fetch failed"}

    data = create_features(df)

    if len(data) < 50:
        return {"success": False, "error": "Not enough data"}

    model, scaler, features = train_model(data)

    predictions = forecast_next_days(data, model, scaler, features, days)

    last_date = df.index[-1]

    future_dates = pd.date_range(
        start=last_date + pd.Timedelta(days=1),
        periods=days
    ).strftime('%Y-%m-%d').tolist()

    return {
        "success": True,
        "symbol": symbol,
        "current_price": float(df['Close'].iloc[-1]),
        "forecast_prices": predictions,
        "forecast_dates": future_dates,
        "historical_dates": df.index.strftime('%Y-%m-%d').tolist(),
        "historical_prices": df['Close'].tolist()
    }