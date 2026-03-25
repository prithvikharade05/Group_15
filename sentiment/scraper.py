import logging
import time
from typing import List, Dict
import requests
from bs4 import BeautifulSoup
import feedparser

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept-Language": "en-US,en;q=0.9",
}


# --- MoneyControl (primary) ---------------------------------------------------
def fetch_moneycontrol(sector: str, limit: int = 20) -> List[Dict]:
    sector_slug = sector.lower().replace(" ", "-")
    url = f"https://www.moneycontrol.com/news/tags/{sector_slug}.html"
    logging.info("MoneyControl URL: %s", url)
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
    except Exception as exc:
        logging.exception("MoneyControl fetch failed: %s", exc)
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    articles = []

    for li in soup.select("ul li.clearfix")[:limit]:
        title_tag = li.select_one("h2 a")
        desc_tag = li.select_one("p")
        time_tag = li.select_one("span")

        title = (title_tag.text or "").strip() if title_tag else ""
        description = (desc_tag.text or "").strip() if desc_tag else ""
        link = title_tag["href"].strip() if title_tag and title_tag.has_attr("href") else ""
        timestamp = (time_tag.text or "").strip() if time_tag else ""

        if not title:
            continue

        stock = None
        for token in title.split():
            if token.isupper() and 2 <= len(token) <= 6:
                stock = token.strip(",.:-")
                break

        articles.append(
            {
                "title": title,
                "description": description,
                "link": link,
                "timestamp": timestamp,
                "stock": stock,
                "source": "MoneyControl",
            }
        )

    logging.info("MoneyControl fetched %s articles for %s", len(articles), sector)
    time.sleep(1)
    return articles


# --- Google News RSS (fallback 1) --------------------------------------------
def fetch_google_news(sector: str, limit: int = 20) -> List[Dict]:
    query = requests.utils.quote(f"{sector} stock india")
    url = f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"
    try:
        feed = feedparser.parse(url)
    except Exception as exc:
        logging.exception("Google News fetch failed: %s", exc)
        return []

    articles = []
    for entry in feed.entries[:limit]:
        title = (entry.get("title") or "").strip()
        description = (entry.get("summary") or "").strip()
        link = entry.get("link") or ""
        if not title:
            continue
        articles.append(
            {
                "title": title,
                "description": description,
                "link": link,
                "timestamp": entry.get("published", ""),
                "stock": None,
                "source": "Google News",
            }
        )
    logging.info("Google News fetched %s articles for %s", len(articles), sector)
    time.sleep(1)
    return articles


# --- Yahoo Finance RSS (fallback 2) ------------------------------------------
def fetch_yahoo_news(sector: str, limit: int = 15) -> List[Dict]:
    # Generic finance feed; still valuable as fallback
    url = "https://finance.yahoo.com/news/rss"
    try:
        feed = feedparser.parse(url)
    except Exception as exc:
        logging.exception("Yahoo Finance fetch failed: %s", exc)
        return []

    articles = []
    for entry in feed.entries[:limit]:
        title = (entry.get("title") or "").strip()
        description = (entry.get("summary") or "").strip()
        link = entry.get("link") or ""
        if not title:
            continue
        articles.append(
            {
                "title": title,
                "description": description,
                "link": link,
                "timestamp": entry.get("published", ""),
                "stock": None,
                "source": "Yahoo Finance",
            }
        )
    logging.info("Yahoo Finance fetched %s articles", len(articles))
    time.sleep(1)
    return articles


# --- Normalization & Deduplication ------------------------------------------
def normalize_news(items: List[Dict]) -> List[Dict]:
    normalized = []
    for item in items:
        normalized.append(
            {
                "title": item.get("title", "") or "",
                "description": item.get("description", "") or "",
                "link": item.get("link", "") or "",
                "timestamp": item.get("timestamp", "") or "",
                "stock": item.get("stock") or None,
                "source": item.get("source", "unknown") or "unknown",
            }
        )
    return normalized


def deduplicate_news(items: List[Dict]) -> List[Dict]:
    seen = set()
    deduped = []
    for item in items:
        title_key = (item.get("title", "") or "").lower()
        if not title_key or title_key in seen:
            continue
        seen.add(title_key)
        deduped.append(item)
    return deduped


# --- Orchestrator ------------------------------------------------------------
def fetch_sector_news(sector: str, limit: int = 25) -> List[Dict]:
    news: List[Dict] = []

    mc = fetch_moneycontrol(sector, limit=limit)
    news.extend(mc)

    if len(news) < 20:
        gn = fetch_google_news(sector, limit=limit)
        news.extend(gn)

    if len(news) < 20:
        yh = fetch_yahoo_news(sector, limit=limit)
        news.extend(yh)

    news = normalize_news(news)
    news = deduplicate_news(news)

    if not news:
        news = [
            {
                "title": "No major news available currently",
                "description": "Market is stable with no strong sentiment signals.",
                "link": "",
                "timestamp": "",
                "stock": None,
                "source": "fallback",
            }
            for _ in range(5)
        ]

    logging.info("Final aggregated articles: %s", len(news))
    return news[:limit]
