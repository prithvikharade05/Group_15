"""
Lightweight in-memory cache with TTL used for stock/market data.
Thread-safe and intentionally simple for single-process deployments. In
multi-worker setups (gunicorn multiple workers), switch to Redis by
replacing this module's API with a Redis-backed implementation.
"""

import time
import threading


class MemoryCache:
    def __init__(self, ttl_seconds: int = 60):
        self.ttl = ttl_seconds
        self._store = {}
        self._lock = threading.Lock()

    def get(self, key):
        now = time.time()
        with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            expiry, value = entry
            if now > expiry:
                self._store.pop(key, None)
                return None
            return value

    def set(self, key, value):
        with self._lock:
            self._store[key] = (time.time() + self.ttl, value)

    def clear(self):
        with self._lock:
            self._store.clear()


# Global cache instance used across fetchers
global_cache = MemoryCache(ttl_seconds=60)
