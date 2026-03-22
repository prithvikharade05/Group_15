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
    <div className="w-full h-[400px] bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          {modelName} Neural Forecast
        </h3>
        <span className="text-sm text-white/60">
          {forecast.length} days ahead
        </span>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            vertical={false} 
            stroke="rgba(255,255,255,0.08)" 
            strokeDasharray="3 3"
          />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'white', fontSize: 11 }}
            tickMargin={12}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'white', fontSize: 11 }}
            tickMargin={12}
            width={40}
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(20,20,40,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px'
            }}
            labelStyle={{ color: 'white', fontWeight: '600' }}
            itemStyle={{ color: 'white' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Line 
            type="monotone" 
            dataKey="price" 
            name="Historical" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={false}
            yAxisId={0}
            connectNulls={true}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            name="Forecast" 
            stroke="#10B981" 
            strokeWidth={4}
            strokeDasharray="5 5"
            dot={{ fill: '#10B981', strokeWidth: 2 }}
            yAxisId={0}
          />
          <Area 
            type="monotone" 
            dataKey="price"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.1}
            data={chartData.slice(-forecast.length)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PredictionChart;
