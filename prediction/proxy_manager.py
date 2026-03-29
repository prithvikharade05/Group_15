"""
Lightweight proxy manager for free rotating proxies.
- Pulls from multiple public lists
- Validates and prunes dead proxies
- Refreshes every 10–15 minutes
"""
import logging
import random
import threading
import time
from typing import List, Optional

import requests

logger = logging.getLogger(__name__)

PROXY_SOURCES = [
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=3000&country=all",
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
    "https://raw.githubusercontent.com/jetkai/proxy-list/main/online-proxies/txt/proxies-http.txt",
]

REFRESH_MIN = 600  # 10 minutes
REFRESH_MAX = 900  # 15 minutes
VALIDATION_URL = "https://httpbin.org/ip"
VALIDATION_TIMEOUT = 4

_proxies: List[str] = []
_last_refresh = 0.0
_lock = threading.Lock()


def _needs_refresh() -> bool:
    return (time.time() - _last_refresh) > random.randint(REFRESH_MIN, REFRESH_MAX) or not _proxies


def load_proxies(force: bool = False):
    global _proxies, _last_refresh
    with _lock:
        if not force and not _needs_refresh():
            return
        pool: List[str] = []
        for url in PROXY_SOURCES:
            try:
                resp = requests.get(url, timeout=5)
                if resp.ok:
                    for line in resp.text.splitlines():
                        candidate = line.strip()
                        if candidate and ":" in candidate:
                            pool.append(candidate)
            except Exception as exc:  # noqa: BLE001
                logger.debug("Proxy source failed %s: %s", url, exc)
        random.shuffle(pool)
        _proxies = pool[:300]  # cap to reasonable pool
        _last_refresh = time.time()
        logger.info("Loaded %s proxies", len(_proxies))


def validate_proxy(proxy: str) -> bool:
    try:
        resp = requests.get(VALIDATION_URL, proxies={"http": f"http://{proxy}", "https": f"http://{proxy}"}, timeout=VALIDATION_TIMEOUT)
        return resp.ok
    except Exception:
        return False


def get_proxy() -> Optional[str]:
    load_proxies()
    with _lock:
        if not _proxies:
            return None
        proxy = random.choice(_proxies)
    # lazy validation; if it fails caller will remove
    return proxy


def remove_bad_proxy(proxy: str):
    with _lock:
        try:
            _proxies.remove(proxy)
        except ValueError:
            pass


def background_refresh():
    while True:
        try:
            load_proxies(force=True)
        except Exception:
            pass
        time.sleep(random.randint(REFRESH_MIN, REFRESH_MAX))


# Optionally start background refresher in long-running processes
def ensure_background_thread():
    t = threading.Thread(target=background_refresh, daemon=True)
    t.start()
