import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const TrendChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Custom tooltips with Tailwind styles matching dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 rounded-xl border border-white/10 shadow-2xl text-xs">
          <p className="font-bold text-slate-200 mb-2">Year: {label}</p>
          <div className="space-y-1">
            <p className="text-blue-400">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
              Trend Score: <span className="font-semibold text-slate-100">{payload[0].value.toFixed(1)}</span>
            </p>
            {payload[1] && (
              <p className="text-indigo-400">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2"></span>
                Papers Count: <span className="font-semibold text-slate-100">{payload[1].value.toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 rounded-2xl w-full h-[400px] shadow-xl">
      <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center justify-between">
        <span>Historical Growth & Trend Score</span>
        <span className="text-xs font-normal text-slate-400">Dual Axis Timeline</span>
      </h3>
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis 
              dataKey="year" 
              stroke="#94a3b8" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            {/* Left Y Axis for Trend Score */}
            <YAxis
              yAxisId="left"
              stroke="#3b82f6"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
              dx={-10}
            />
            {/* Right Y Axis for Papers Count */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6366f1"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
              dx={10}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="trend_score"
              name="Trend Score"
              stroke="#3b82f6"
              strokeWidth={3}
              activeDot={{ r: 6, stroke: '#1e293b', strokeWidth: 2 }}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="papers_count"
              name="Papers Count"
              stroke="#6366f1"
              strokeWidth={3}
              activeDot={{ r: 6, stroke: '#1e293b', strokeWidth: 2 }}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
