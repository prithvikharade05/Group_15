"""
Cache manager with layered strategy:
- In-memory TTL cache for fast reads
- Optional disk cache for fallbacks (JSON per symbol)
The API is intentionally simple and can be swapped for Redis later.
"""
import os
import json
import time
import threading
from typing import Any, Optional

DEFAULT_TTL = 120  # seconds


class MemoryCache:
    def __init__(self, ttl: int = DEFAULT_TTL):
        self.ttl = ttl
        self._store = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
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

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        ttl_to_use = ttl if ttl is not None else self.ttl
        with self._lock:
            self._store[key] = (time.time() + ttl_to_use, value)

    def clear(self):
        with self._lock:
            self._store.clear()


class DiskCache:
    """
    Very lightweight disk cache used only as a last-resort fallback.
    Stored as JSON per key.
    """
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def _path(self, key: str) -> str:
        safe = key.replace(":", "_").replace("/", "_")
        return os.path.join(self.base_dir, f"{safe}.json")

    def get(self, key: str) -> Optional[Any]:
        path = self._path(key)
        if not os.path.exists(path):
            return None
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception:
            return None

    def set(self, key: str, value: Any):
        path = self._path(key)
        try:
            with open(path, "w") as f:
                json.dump(value, f)
        except Exception:
            pass


# Singleton instances
memory_cache = MemoryCache()
