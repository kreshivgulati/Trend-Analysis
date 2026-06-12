import React from 'react';
import { ArrowUpRight, ArrowDownRight, Zap, TrendingUp, Star } from 'lucide-react';

const StatCard = ({ title, value, type, originalValue }) => {
  // Circular Progress Ring for Trend Score
  const renderCircle = (score) => {
    const numericScore = parseFloat(score) || 0;
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(numericScore, 100) / 100) * circumference;

    return (
      <div className="flex items-center space-x-4">
        <div className="relative h-16 w-16 flex items-center justify-center">
          <svg className="absolute transform -rotate-90 w-full h-full">
            <circle
              className="text-slate-700/30"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
            />
            <circle
              className="text-blue-500 transition-all duration-1000 ease-out"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="32"
              cy="32"
            />
          </svg>
          <span className="text-sm font-bold text-slate-100">{numericScore.toFixed(1)}</span>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-slate-100">Score Out of 100</p>
        </div>
      </div>
    );
  };

  // Expected Growth with Up/Down Arrow
  const renderGrowth = (growth) => {
    const numericGrowth = parseFloat(growth) || 0;
    const isPositive = numericGrowth >= 0;

    return (
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-extrabold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{numericGrowth.toFixed(1)}%
          </p>
        </div>
      </div>
    );
  };

  // Future Potential Badge
  const renderPotential = (potential) => {
    const config = {
      "Very High": { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
      "High": { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
      "Moderate": { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
      "Low": { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" },
    };

    const style = config[potential] || config["Low"];

    return (
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${style.bg} ${style.text}`}>
          <Star className="h-6 w-6 fill-current" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{title}</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${style.bg} ${style.border} ${style.text} mt-1`}>
            {potential}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-center min-h-[100px] shadow-xl relative overflow-hidden group">
      {/* Accent hover glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {type === 'score' && renderCircle(value)}
      {type === 'growth' && renderGrowth(value)}
      {type === 'potential' && renderPotential(value)}
    </div>
  );
};

export default StatCard;
