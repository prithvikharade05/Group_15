import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const StatCard = ({ label, value }) => (
  <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
    <div className="text-xs uppercase text-slate-500 font-semibold">{label}</div>
    <div className="text-2xl font-bold text-slate-800 mt-1">{value}</div>
  </div>
);

const NewsList = ({ title, items }) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    </div>
    {!Array.isArray(items) || items.length === 0 ? (
      <p className="text-slate-500 text-sm">No entries.</p>
    ) : (
      items.map((item, idx) => (
        <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
          <div className="text-sm font-semibold text-slate-800">{item.title}</div>
          <div className="text-xs text-slate-500 mt-1">
            Impact: <span className="font-semibold">{item.impact}</span> | Score: {item.score}
          </div>
        </div>
      ))
    )}
  </div>
);

const BulletList = ({ title, items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <h4 className="text-base font-semibold text-slate-800 mb-2">{title}</h4>
        <p className="text-slate-500 text-sm">No data available.</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
      <h4 className="text-base font-semibold text-slate-800 mb-2">{title}</h4>
      <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm">
        {items.map((it, idx) => (
          <li key={idx}>{it}</li>
        ))}
      </ul>
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center">No data.</div>;

  const sentimentColor =
    data.label === "Bullish" ? "bg-emerald-100 text-emerald-700" :
    data.label === "Bearish" ? "bg-red-100 text-red-700" :
    "bg-amber-100 text-amber-700";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 uppercase">Sector</p>
          <h1 className="text-3xl font-black text-slate-900">{sector}</h1>
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold mt-2 ${sentimentColor}`}>
            {data.label} (score {data.score})
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Score" value={data?.score ?? 0} />
        <StatCard label="News Count" value={data?.news_count ?? 0} />
        <StatCard label="Label" value={data?.label ?? "Neutral"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <h4 className="text-base font-semibold text-slate-800 mb-2">Top Positive Stocks</h4>
          <div className="flex flex-wrap gap-2">
            {!Array.isArray(data.top_positive_stocks) || data.top_positive_stocks.length === 0 ? (
              <span className="text-slate-500 text-sm">None</span>
            ) : (
              data.top_positive_stocks.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                  {s}
                </span>
              ))
            )}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <h4 className="text-base font-semibold text-slate-800 mb-2">Top Negative Stocks</h4>
          <div className="flex flex-wrap gap-2">
            {!Array.isArray(data.top_negative_stocks) || data.top_negative_stocks.length === 0 ? (
              <span className="text-slate-500 text-sm">None</span>
            ) : (
              data.top_negative_stocks.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                  {s}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md-grid-cols-2 md:grid-cols-2 gap-4">
        <NewsList title="Key Positive News" items={data?.key_positive_news || []} />
        <NewsList title="Key Negative News" items={data?.key_negative_news || []} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Smart AI Report</h3>
        <p className="text-slate-800 text-sm font-semibold">Summary</p>
        <p className="text-slate-700 text-sm">{data.report.summary}</p>

        <BulletList title="Key Drivers" items={data?.report?.key_drivers || []} />
        <BulletList title="Impact Analysis" items={data?.report?.impact_analysis ? [data.report.impact_analysis] : []} />
        <BulletList title="Risk Signals" items={data?.report?.risk_signals || []} />
        <p className="text-slate-800 text-sm font-semibold">Final Insight</p>
        <p className="text-slate-700 text-sm">{data?.report?.final_insight || "No insight available."}</p>
      </div>
    </div>
  );
};

export default SectorSentiment;
