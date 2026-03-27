import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const sentimentBadge = (label = "Neutral") => {
  if (label === "Bullish") return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (label === "Bearish") return "bg-red-100 text-red-700 border border-red-200";
  return "bg-slate-200 text-slate-700 border border-slate-300";
};

const MetricCard = ({ label, value, accent = "emerald" }) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-xl p-4 transition-transform duration-200 hover:-translate-y-1">
    <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-slate-50/40 to-slate-100/50 pointer-events-none" />
    <div className="relative">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-2">{value}</p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
        <div className={`h-full w-3/4 rounded-full bg-${accent}-500`} />
      </div>
    </div>
  </div>
);

const NewsCard = ({ item, positive }) => {
  const impactColor =
    item?.impact === "HIGH"
      ? "bg-red-100 text-red-700"
      : item?.impact === "MEDIUM"
      ? "bg-amber-100 text-amber-700"
      : "bg-emerald-100 text-emerald-700";

  const sentimentBar = Math.min(1, Math.max(0, item?.score ?? 0));

  return (
    <div className="p-4 rounded-xl border border-white/50 bg-white/70 backdrop-blur-xl shadow-sm transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900 leading-snug">{item?.title || "Untitled"}</p>
        <span className={`text-[11px] px-2 py-1 rounded-full ${impactColor}`}>{item?.impact || "LOW"}</span>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
        <span>{item?.source || "Unknown"}</span>
        <span>{item?.timestamp || ""}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mt-3">
        <div
          className={`h-full ${positive ? "bg-emerald-500" : "bg-red-500"}`}
          style={{ width: `${sentimentBar * 100}%`, transition: "width 0.6s ease" }}
        />
      </div>
    </div>
  );
};

const BulletList = ({ title, icon, items }) => (
  <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-4 shadow-sm space-y-2">
    <div className="flex items-center gap-2 text-slate-900 font-semibold">
      <span>{icon}</span>
      <span>{title}</span>
    </div>
    {!Array.isArray(items) || items.length === 0 ? (
      <p className="text-slate-500 text-sm">No data available.</p>
    ) : (
      <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm">
        {items.map((it, idx) => (
          <li key={idx}>{it}</li>
        ))}
      </ul>
    )}
  </div>
);

const SentimentScale = ({ score }) => {
  const pos = ((score + 1) / 2) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-slate-500">
        <span className="text-red-600 font-semibold">Bearish</span>
        <span className="text-slate-600 font-semibold">Neutral</span>
        <span className="text-emerald-600 font-semibold">Bullish</span>
      </div>
      <div className="h-2 rounded-full bg-gradient-to-r from-red-200 via-amber-200 to-emerald-200 relative">
        <div
          className="absolute -top-[6px] h-4 w-4 rounded-full border-2 border-white shadow-md bg-slate-900"
          style={{ left: `calc(${pos}% - 8px)` }}
        />
      </div>
    </div>
  );
};

const SectorSentiment = () => {
  const { sector } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/sentiment/sector/${encodeURIComponent(sector)}/`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load sentiment.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sector]);

  const label = data?.label || "Neutral";
  const score = Number(data?.score ?? 0);
  const positiveNews = useMemo(() => (Array.isArray(data?.key_positive_news) ? data.key_positive_news : []), [data]);
  const negativeNews = useMemo(() => (Array.isArray(data?.key_negative_news) ? data.key_negative_news : []), [data]);

  if (loading) return <div className="p-10 text-center text-slate-600">Loading sentiment…</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-10 text-center text-slate-600">No data.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent pointer-events-none" />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/80">Sector Sentiment</p>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{sector}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${sentimentBadge(label)}`}>{label}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black">{score}</span>
              <span className="text-sm text-white/70">Score</span>
            </div>
            <SentimentScale score={score} />
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-white/80 hover:text-white border border-white/30 px-3 py-1.5 rounded-lg backdrop-blur-sm"
          >
            Back
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Score" value={score} accent="emerald" />
        <MetricCard label="News Count" value={data?.news_count ?? 0} accent="cyan" />
        <MetricCard label="Label" value={label} accent="amber" />
        <MetricCard label="Confidence" value={`${Math.min(100, Math.abs(score) * 100).toFixed(0)}%`} accent="indigo" />
      </div>

      {/* News */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <span>🟢</span> <span>Positive News</span>
          </div>
          {!positiveNews.length ? (
            <p className="text-slate-500 text-sm">No data available.</p>
          ) : (
            <div className="space-y-3">
              {positiveNews.map((n, idx) => (
                <NewsCard key={idx} item={n} positive />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <span>🔴</span> <span>Negative News</span>
          </div>
          {!negativeNews.length ? (
            <p className="text-slate-500 text-sm">No data available.</p>
          ) : (
            <div className="space-y-3">
              {negativeNews.map((n, idx) => (
                <NewsCard key={idx} item={n} positive={false} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report */}
      <div className="rounded-3xl border border-white/40 bg-white/80 backdrop-blur-xl shadow-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <span className="text-2xl">🧠</span>
          <h3 className="text-2xl font-black">Smart AI Report</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BulletList title="🧠 Summary" icon="" items={[data?.report?.summary || "No summary available."]} />
          <BulletList
            title="📉 Impact Analysis"
            icon=""
            items={[data?.report?.impact_analysis || "No impact analysis available."]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BulletList title="⚡ Key Drivers" icon="" items={data?.report?.key_drivers || []} />
          <BulletList title="🚨 Risk Signals" icon="" items={data?.report?.risk_signals || []} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <span>🎯</span>
            <span>Final Insight</span>
          </div>
          <p className="text-slate-700 text-sm">{data?.report?.final_insight || "No insight available."}</p>
        </div>
      </div>
    </div>
  );
};

export default SectorSentiment;
