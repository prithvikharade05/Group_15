import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Legend
} from 'recharts';

const PredictionChart = ({ historical, forecast, dates, modelName }) => {
  // Combine historical + forecast data
  const chartData = [
    ...historical.map((price, i) => ({
      date: dates[i] || `H-${historical.length - i}`,
      price: parseFloat(price),
      type: 'Historical',
      model: modelName
    })),
    ...forecast.map((price, i) => ({
      date: dates[historical.length + i] || `F+${i + 1}`,
      price: parseFloat(price),
      type: 'Forecast',
      model: modelName
    }))
  ];

  return (
    <div className="w-full h-[400px] bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-end mb-6 pl-2">
        <h3 className="text-2xl font-black bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent uppercase tracking-wider">
          {modelName} Neural Forecast
        </h3>
        <span className="text-xs font-bold text-indigo-500 tracking-widest uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          {forecast.length} days ahead
        </span>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2}/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="historicalLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <CartesianGrid 
            vertical={false} 
            stroke="#f1f5f9" 
            strokeDasharray="4 4"
          />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
            tickMargin={12}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
            tickMargin={12}
            width={50}
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
            }}
            labelStyle={{ color: '#1e293b', fontWeight: '800', marginBottom: '4px' }}
            itemStyle={{ color: '#6366f1', fontWeight: '600' }}
          />
          <Legend wrapperStyle={{ paddingTop: '15px' }} />
          
          <Line 
            type="monotone" 
            dataKey="price" 
            name="Historical" 
            stroke="url(#historicalLine)" 
            strokeWidth={4}
            dot={false}
            yAxisId={0}
            connectNulls={true}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            name="Forecast" 
            stroke="#8b5cf6" 
            strokeWidth={4}
            strokeDasharray="6 6"
            dot={{ fill: '#8b5cf6', strokeWidth: 3, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            yAxisId={0}
          />
          <Area 
            type="monotone" 
            dataKey="price"
            stroke="none"
            fill="url(#forecastFill)"
            data={chartData.slice(-forecast.length)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionChart;
