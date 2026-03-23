# CNN + LSTM Hybrid Model (FIXED VERSION)

import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings

warnings.filterwarnings('ignore')

# TensorFlow
try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Conv1D, MaxPooling1D, LSTM, Dense, Dropout
    from tensorflow.keras.optimizers import Adam

    TF_AVAILABLE = True
except:
    TF_AVAILABLE = False


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
# CLEAN DATA
# =========================
def clean_data(df):
    if df is None or df.empty:
        return None

    df = df[['Open', 'High', 'Low', 'Close', 'Volume']]
    df = df.dropna()

    if len(df) < 100:
        return None

    return df


# =========================
# SEQUENCES
# =========================
def create_sequences(data, look_back=60):
    X, y = [], []
    for i in range(look_back, len(data)):
        X.append(data[i-look_back:i])
        y.append(data[i, 3])  # Close price
    return np.array(X), np.array(y)


# =========================
# MODEL
# =========================
def build_model(input_shape):
    if not TF_AVAILABLE:
        return None

    model = Sequential([
        Conv1D(64, 3, activation='relu', input_shape=input_shape),
        MaxPooling1D(2),
        Dropout(0.2),
        LSTM(100),
        Dropout(0.2),
        Dense(50, activation='relu'),
        Dense(1)
    ])

    model.compile(optimizer=Adam(0.001), loss='mse')
    return model


# =========================
# TRAIN
# =========================
def train_model(model, X_train, y_train):
    return model.fit(
        X_train, y_train,
        epochs=10,
        batch_size=32,
        verbose=0
    )


# =========================
# PREDICT
# =========================
def predict_future(model, scaler, last_seq, days=5):
    preds = []
    seq = last_seq.copy()

    for _ in range(days):
        pred = model.predict(seq.reshape(1, seq.shape[0], seq.shape[1]), verbose=0)[0][0]
        preds.append(pred)

        new_row = seq[-1].copy()
        new_row[3] = pred
        seq = np.vstack([seq[1:], new_row])

    dummy = np.zeros((len(preds), 5))
    dummy[:, 3] = preds

    return scaler.inverse_transform(dummy)[:, 3].tolist()


# =========================
# 🔥 FIXED EVALUATION
# =========================
def evaluate_model(model, X_test, y_test, scaler):

    y_pred = model.predict(X_test, verbose=0)

    dummy_test = np.zeros((len(y_test), 5))
    dummy_pred = np.zeros((len(y_pred), 5))

    dummy_test[:, 3] = y_test
    dummy_pred[:, 3] = y_pred.flatten()

    y_test_actual = scaler.inverse_transform(dummy_test)[:, 3]
    y_pred_actual = scaler.inverse_transform(dummy_pred)[:, 3]

    # ₹ scale
    mae = mean_absolute_error(y_test_actual, y_pred_actual)
    rmse = np.sqrt(mean_squared_error(y_test_actual, y_pred_actual))
    r2 = r2_score(y_test_actual, y_pred_actual)

    # % scale
    mean_price = np.mean(y_test_actual)

    mae_pct = (mae / mean_price) * 100
    rmse_pct = (rmse / mean_price) * 100

    accuracy = 100 - rmse_pct
    accuracy = max(0, min(100, accuracy))

    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mae_percent": round(mae_pct, 2),
        "rmse_percent": round(rmse_pct, 2),
        "r2": round(r2, 2),
        "accuracy": round(accuracy, 2)
    }


# =========================
# MAIN FUNCTION
# =========================
def run_cnn_lstm_forecast(ticker, period="max", forecast_days=5):

    if not TF_AVAILABLE:
        return {"success": False, "error": "TensorFlow not installed"}

    df = fetch_stock_data(ticker, period)
    df = clean_data(df)

    if df is None:
        return {"success": False, "error": "Data issue"}

    data = df.values

    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(data)

    X, y = create_sequences(scaled)

    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    model = build_model((X_train.shape[1], X_train.shape[2]))
    train_model(model, X_train, y_train)

    metrics = evaluate_model(model, X_test, y_test, scaler)

    last_seq = scaled[-60:]
    predictions = predict_future(model, scaler, last_seq, forecast_days)

    future_dates = pd.date_range(
        start=df.index[-1] + pd.Timedelta(days=1),
        periods=forecast_days
    ).strftime('%Y-%m-%d').tolist()

    return {
        "success": True,
        "historical_dates": df.index.strftime('%Y-%m-%d').tolist(),
        "historical_prices": df['Close'].tolist(),
        "forecast_prices": predictions,
        "forecast_dates": future_dates,
        **metrics
    }


# =========================
# SYMBOL CONVERTER
# =========================
def convert_symbol(symbol):
    symbol = symbol.upper().replace('.NS', '')
    return symbol + ".NS"