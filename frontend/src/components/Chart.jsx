import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const formatCurrency = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
};

const buildSequentialDates = (count, direction = 'past') => {
  const dates = [];
  const today = new Date();

  if (direction === 'past') {
    for (let i = count - 1; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
  } else {
    for (let i = 1; i <= count; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
  }

  return dates;
};

const PredictionChart = ({ historical = [], forecast = [], dates = [], modelName = 'Forecast' }) => {
  const hasHistorical = Array.isArray(historical) && historical.length > 0;
  const hasForecast = Array.isArray(forecast) && forecast.length > 0;

  if (!hasHistorical && !hasForecast) {
    return null;
  }

  const historicalDates =
    dates && dates.length >= historical.length
      ? dates.slice(0, historical.length)
      : buildSequentialDates(historical.length, 'past');

  const forecastDates = buildSequentialDates(forecast.length, 'future');
  const labels = [...historicalDates, ...forecastDates];

  const historicalData = [
    ...historical.map((value) => formatCurrency(value)),
    ...Array(forecast.length).fill(null)
  ];

  const forecastData = [
    ...Array(historical.length).fill(null),
    ...forecast.map((value) => formatCurrency(value))
  ];

  const hasValues = historicalData.some((v) => Number.isFinite(v)) || forecastData.some((v) => Number.isFinite(v));
  if (!hasValues) {
    return null;
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Historical Price',
        data: historicalData,
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
        pointBackgroundColor: '#6366f1',
        tension: 0.25,
        spanGaps: true
      },
      {
        label: 'Forecast Price',
        data: forecastData,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.18)',
        pointBackgroundColor: '#8b5cf6',
        pointRadius: 4,
        borderDash: [6, 6],
        tension: 0.25,
        spanGaps: true,
        fill: 'origin'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: modelName,
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (!Number.isFinite(value)) return '';
            return `INR ${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { maxRotation: 0, minRotation: 0 },
        grid: { display: false }
      },
      y: {
        grid: { color: '#e2e8f0' },
        ticks: {
          callback: (val) => `INR ${Number(val).toLocaleString()}`
        }
      }
    },
    elements: {
      point: { radius: 3, hoverRadius: 5 },
      line: { borderWidth: 2 }
    }
  };

  return (
    <div className="w-full h-[600px] bg-white rounded-2xl border border-slate-200 shadow-lg p-4">
      <Line data={data} options={options} />
    </div>
  );
};

export default PredictionChart;
