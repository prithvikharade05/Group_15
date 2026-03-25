from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .scraper import fetch_sector_news
from .sentiment_engine import aggregate_sector


def build_report(label: str, score: float, news, top_pos, top_neg):
    summary = f"Sector shows {label.lower()} sentiment with score {score}." if label else ""

    key_drivers = []
    for item in list(top_pos or [])[:2] + list(top_neg or [])[:2]:
        direction = "positive" if item.get("numeric", 0) > 0 else "negative"
        key_drivers.append(f"{item.get('title','')} ({direction}, impact {item.get('impact','')})")

    impact_analysis = (
        "Bullish tilt may lift large-caps first with spillover to mid-caps."
        if label == "Bullish"
        else "Bearish bias could pressure mid-caps more while large-caps stay relatively resilient."
        if label == "Bearish"
        else "Neutral tone suggests range-bound moves; stock selection will drive alpha."
    )

    risk_signals = [f"{item.get('title','')} (impact {item.get('impact','')})" for item in list(top_neg or [])[:3]]
    final_insight = "Monitor upcoming earnings and macro data; reassess if sentiment shifts sharply."

    return {
        "summary": summary or "",
        "key_drivers": key_drivers if isinstance(key_drivers, list) else [],
        "impact_analysis": impact_analysis or "",
        "risk_signals": risk_signals if isinstance(risk_signals, list) else [],
        "final_insight": final_insight or "",
    }


class SectorSentimentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, sector):
        articles = fetch_sector_news(sector)

        if not articles:
            return Response(
                {
                    "sector": sector,
                    "score": 0,
                    "label": "Neutral",
                    "news_count": 0,
                    "top_positive_stocks": [],
                    "top_negative_stocks": [],
                    "key_positive_news": [],
                    "key_negative_news": [],
                    "report": {
                        "summary": "No news available currently.",
                        "key_drivers": [],
                        "impact_analysis": "Insufficient data.",
                        "risk_signals": [],
                        "final_insight": "Market sentiment cannot be determined.",
                    },
                }
            )

        agg = aggregate_sector(articles)

        key_positive_news = [
            {"title": n.get("title", ""), "impact": n.get("impact", ""), "score": round(n.get("confidence", 0), 3)}
            for n in list(agg.get("top_positive", []))[:3]
        ]
        key_negative_news = [
            {"title": n.get("title", ""), "impact": n.get("impact", ""), "score": round(n.get("confidence", 0), 3)}
            for n in list(agg.get("top_negative", []))[:3]
        ]

        report = build_report(
            agg["label"], agg["score"], agg["news"], agg["top_positive"], agg["top_negative"]
        )

        return Response(
            {
                "sector": sector,
                "score": agg.get("score", 0),
                "label": agg.get("label", "Neutral"),
                "news_count": len(agg.get("news", [])),
                "top_positive_stocks": list(agg.get("top_positive_stocks", [])),
                "top_negative_stocks": list(agg.get("top_negative_stocks", [])),
                "key_positive_news": key_positive_news,
                "key_negative_news": key_negative_news,
                "report": report,
            }
        )
