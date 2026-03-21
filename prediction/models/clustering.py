# 🔥 ADVANCED CLUSTERING ENGINE (FIXED)

import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import warnings

warnings.filterwarnings('ignore')


# =========================
# FETCH FEATURES
# =========================
def extract_features(stock_symbols):

    features = {}

    for symbol in stock_symbols:
        try:
            ticker = yf.Ticker(symbol + ".NS")
            hist = ticker.history(period="1y")

            if hist.empty:
                continue

            close = hist['Close']
            current = float(close.iloc[-1])
            high = float(close.max())

            if high == 0:
                continue

            features[symbol] = {
                "return_1m": close.pct_change(21).iloc[-1] * 100,
                "return_3m": close.pct_change(63).iloc[-1] * 100,
                "return_6m": close.pct_change(126).iloc[-1] * 100,
                "discount": ((high - current) / high) * 100,
                "ratio": current / high
            }

        except:
            continue

    return features


# =========================
# SCALE
# =========================
def scale_features(features_dict):

    symbols = []
    matrix = []

    for s, f in features_dict.items():
        vals = list(f.values())

        if all(np.isfinite(vals)):
            symbols.append(s)
            matrix.append(vals)

    if len(symbols) < 3:
        return None, symbols, None

    X = np.array(matrix)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, symbols, scaler


# =========================
# 🔥 SMART K SELECTION
# =========================
def get_optimal_k(n_samples):

    # Minimum 3 stocks per cluster
    max_k = n_samples // 3

    if max_k < 2:
        return 1

    return min(max_k, 5)


# =========================
# CLUSTER
# =========================
def run_clustering(X_scaled, n_samples):

    k = get_optimal_k(n_samples)

    if k == 1:
        return np.zeros(n_samples)

    model = KMeans(n_clusters=k, random_state=42, n_init=10)
    return model.fit_predict(X_scaled)


# =========================
# PCA
# =========================
def generate_pca(X_scaled):

    if len(X_scaled) < 3:
        return np.zeros(len(X_scaled)), np.zeros(len(X_scaled))

    pca = PCA(n_components=2)
    res = pca.fit_transform(X_scaled)

    return res[:, 0], res[:, 1]


# =========================
# MAIN
# =========================
def run_clustering_engine(stock_symbols):

    features = extract_features(stock_symbols)

    if len(features) < 3:
        return {
            "success": False,
            "message": "Need at least 3 stocks"
        }

    X_scaled, symbols, _ = scale_features(features)

    if X_scaled is None:
        return {
            "success": False,
            "message": "Scaling failed"
        }

    labels = run_clustering(X_scaled, len(symbols))

    pca_x, pca_y = generate_pca(X_scaled)

    result = []

    for i, s in enumerate(symbols):
        result.append({
            "symbol": s,
            "cluster": int(labels[i]),
            "x": float(pca_x[i]),
            "y": float(pca_y[i])
        })

    return {
        "success": True,
        "clusters": len(set(labels)),
        "data": result
    }