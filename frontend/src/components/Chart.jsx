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
  // Generate proper dates for historical data if not provided
  const generateHistoricalDates = (count) => {
    const dates = [];
    const today = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  };

  // Generate forecast dates
  const generateForecastDates = (count) => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= count; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  };

  // Use provided dates or generate them
  const historicalDates = dates && dates.length >= historical.length
    ? dates.slice(0, historical.length)
    : generateHistoricalDates(historical.length);

  const forecastDates = generateForecastDates(forecast.length);

  // Combine historical + forecast data with proper formatting
  const chartData = [
    ...historical.map((price, i) => ({
      date: historicalDates[i],
      price: parseFloat(price),
      type: 'Historical',
      model: modelName
    })),
    ...forecast.map((price, i) => ({
      date: forecastDates[i],
      price: parseFloat(price),
      type: 'Forecast',
      model: modelName
    }))
  ];

  // Calculate price range for better Y-axis scaling
  const allPrices = [...historical, ...forecast].map(p => parseFloat(p));
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1; // 10% padding

  return (
    <div className="w-full h-[600px] bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Chart Header */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight font-inter">
              {modelName}
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              Historical Data & AI-Powered Forecast
            </p>
          </div>
          <div className="text-right">
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
              Forecast Period
            </div>
            <div className="text-slate-800 font-mono font-bold text-lg">
              {forecast.length} Days
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4 bg-white">
        <ResponsiveContainer width="100%" height={480}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 40, left: 20, bottom: 30 }}
          >
            {/* Grid and Background */}
            <defs>
              <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="historicalLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="chartBackground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>

            {/* Chart Grid */}
            <CartesianGrid
              vertical={false}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              horizontalPoints={[minPrice - padding, maxPrice + padding]}
            />

            {/* X-Axis (Dates) */}
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#64748b',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'Inter, system-ui'
              }}
              tickMargin={15}
              minTickGap={50}
              interval="preserveStartEnd"
            />

            {/* Y-Axis (Prices) */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#64748b',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'Inter, system-ui'
              }}
              tickMargin={15}
              width={80}
              domain={[minPrice - padding, maxPrice + padding]}
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
              allowDecimals={true}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                color: '#334155',
                fontFamily: 'Inter, system-ui',
                fontSize: '13px',
                fontWeight: 700,
                padding: '12px 16px',
                backdropFilter: 'blur(10px)'
              }}
              itemStyle={{
                color: '#0f172a',
                fontSize: '12px',
                fontWeight: 600
              }}
              labelStyle={{
                color: '#64748b',
                marginBottom: '6px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              formatter={(value, name) => [
                `₹${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                name === 'price' ? 'Price' : name
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />

            {/* Legend */}
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{
                paddingTop: '10px',
                paddingBottom: '10px'
              }}
              formatter={(value, entry) => (
                <span className="font-inter font-bold text-sm text-slate-700 uppercase tracking-wide">
                  {value}
                </span>
              )}
            />

            {/* Historical Line */}
            <Line
              type="monotone"
              dataKey="price"
              name="Historical Price"
              stroke="url(#historicalLine)"
              strokeWidth={3}
              dot={false}
              yAxisId={0}
              connectNulls={true}
              isAnimationActive={true}
              animationDuration={1500}
            />

            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="price"
              name="Forecast Price"
              stroke="#8b5cf6"
              strokeWidth={3}
              strokeDasharray="8 8"
              dot={{
                fill: '#8b5cf6',
                strokeWidth: 2,
                r: 4,
                stroke: '#ffffff',
                strokeWidth: 2
              }}
              activeDot={{
                r: 6,
                strokeWidth: 0,
                fill: '#8b5cf6',
                stroke: '#ffffff',
                strokeWidth: 2
              }}
              yAxisId={0}
              isAnimationActive={true}
              animationDuration={1500}
            />

            {/* Forecast Area Fill */}
            <Area
              type="monotone"
              dataKey="price"
              stroke="none"
              fill="url(#forecastFill)"
              data={chartData.slice(-forecast.length)}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex justify-between items-center text-sm text-slate-600">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
              <span>Historical Data</span>
            </span>
            <span className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-purple-500 rounded-full"></div>
              <span>Forecast Data</span>
            </span>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-slate-500 uppercase tracking-wide">
              Last Updated
            </div>
            <div className="font-mono font-bold text-sm text-slate-700">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;
