function Dashboard() {
  const cards = [
    "ARIMA",
    "LSTM",
    "Regression",
    "Clustering",
    "Sentiment",
    "Chatbot"
  ];

  return (
    <div className="bg-black min-h-screen text-white p-10">

      <h1 className="text-3xl mb-10">⚡ AI Trading Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">

        {cards.map((c, i) => (
          <div key={i}
               className="bg-white/10 p-6 rounded-xl backdrop-blur hover:scale-105 transition">
            {c}
          </div>
        ))}

      </div>
    </div>
  );
}

export default Dashboard;