"""
Caching utilities:
- Memory cache with per-entry TTL
- Negative cache support (stores failures briefly)
- Disk cache for offline fallback

All functions are thread-safe and can be swapped for Redis later.
"""
import os
import json
import time
import threading
import random
from typing import Any, Optional

SUCCESS_DEFAULT_TTL = 180  # 3 minutes (within required 60-300s window)
FAIL_TTL_RANGE = (120, 300)  # 2-5 minutes


class MemoryCache:
    def __init__(self, default_ttl: int = SUCCESS_DEFAULT_TTL):
        self.default_ttl = default_ttl
        self._store = {}
        self._lock = threading.Lock()

    @staticmethod
    def _is_expired(expiry: float) -> bool:
        return time.time() > expiry

    @staticmethod
    def is_fail(value: Any) -> bool:
        return isinstance(value, dict) and value.get("__fail__") is not None

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            expiry, value = entry
            if self._is_expired(expiry):
                self._store.pop(key, None)
                return None
            return value

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        ttl_to_use = ttl if ttl is not None else self.default_ttl
        with self._lock:
            self._store[key] = (time.time() + ttl_to_use, value)

    def set_fail(self, key: str, reason: str, ttl: Optional[int] = None):
        fail_ttl = ttl if ttl is not None else random.randint(*FAIL_TTL_RANGE)
        self.set(key, {"__fail__": reason}, ttl=fail_ttl)

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
