import logging
from typing import Dict, List, Tuple
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import torch

MODEL_NAME = "ProsusAI/finbert"

_tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
_model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
_device = 0 if torch.cuda.is_available() else -1
_pipe = pipeline(
    "text-classification",
    model=_model,
    tokenizer=_tokenizer,
    return_all_scores=False,
    device=_device,
)

LABEL_MAP = {
    "positive": 1,
    "neutral": 0,
    "negative": -1,
}


def score_news_item(title: str, description: str) -> Tuple[str, float, int]:
    """
    Returns label, confidence, numeric score.
    """
    text = (title or "") + ". " + (description or "")
    if not text.strip():
        return "neutral", 0.0, 0

    try:
        res = _pipe(text, truncation=True, max_length=512)[0]
        label = res["label"].lower()
        score = float(res["score"])
    except Exception as exc:
        logging.exception("FinBERT inference failed: %s", exc)
        return "neutral", 0.0, 0

    numeric = LABEL_MAP.get(label, 0)
    return label, score, numeric


def impact_level(confidence: float) -> str:
    if confidence > 0.7:
        return "HIGH"
    if confidence >= 0.4:
        return "MEDIUM"
    return "LOW"


def aggregate_sector(news_items: List[Dict]) -> Dict:
    if not news_items:
        return {
            "score": 0,
            "label": "Neutral",
            "news": [],
            "positive_stocks": [],
            "negative_stocks": [],
        }

    scored = []
    stock_sentiments = {}

    for item in news_items:
        label, confidence, numeric = score_news_item(item.get("title", ""), item.get("description", ""))
        item["label"] = label
        item["confidence"] = confidence
        item["numeric"] = numeric
        item["impact"] = impact_level(confidence)
        scored.append(item)

        stock = item.get("stock")
        if stock:
            stock_sentiments.setdefault(stock, {"pos": 0, "neg": 0})
            if numeric > 0:
                stock_sentiments[stock]["pos"] += 1
            elif numeric < 0:
                stock_sentiments[stock]["neg"] += 1

    avg_score = sum(x["numeric"] for x in scored) / len(scored)
    label = "Bullish" if avg_score > 0.3 else "Bearish" if avg_score < -0.3 else "Neutral"

    top_positive = sorted(
        [x for x in scored if x["numeric"] > 0], key=lambda x: x["confidence"], reverse=True
    )
    top_negative = sorted(
        [x for x in scored if x["numeric"] < 0], key=lambda x: x["confidence"], reverse=True
    )

    top_positive_stocks = sorted(
        [s for s, counts in stock_sentiments.items() if counts["pos"] > counts["neg"]],
        key=lambda s: stock_sentiments[s]["pos"],
        reverse=True,
    )[:5]
    top_negative_stocks = sorted(
        [s for s, counts in stock_sentiments.items() if counts["neg"] > counts["pos"]],
        key=lambda s: stock_sentiments[s]["neg"],
        reverse=True,
    )[:5]

    return {
        "score": round(avg_score, 3),
        "label": label,
        "news": scored,
        "top_positive": top_positive,
        "top_negative": top_negative,
        "top_positive_stocks": top_positive_stocks,
        "top_negative_stocks": top_negative_stocks,
    }
