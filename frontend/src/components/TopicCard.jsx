import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

const TopicCard = ({ item, onClick }) => {
  const isPositive = item.growth >= 0;
  
  const potentialStyles = {
    "Very High": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "High": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Moderate": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Low": "bg-rose-500/10 text-rose-400 border-rose-500/20"
  };

  const style = potentialStyles[item.potential] || potentialStyles["Low"];

  return (
    <div 
      onClick={() => onClick(item.topic)}
      className="glass-card glass-card-hover p-6 rounded-2xl cursor-pointer shadow-lg flex flex-col justify-between h-48 relative overflow-hidden group border border-white/5"
    >
      {/* Accent Background Glow on Hover */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500" />
      
      <div className="flex justify-between items-start">
        {/* Topic Rank and Name */}
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 font-bold text-sm">
            #{item.rank}
          </span>
          <h4 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
            {item.topic}
          </h4>
        </div>
        {/* Growth badge */}
        <span className={`inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{item.growth.toFixed(1)}%</span>
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Latest Trend Score</p>
        <p className="text-3xl font-extrabold text-slate-100 mt-1 flex items-baseline space-x-1">
          <span>{item.latest_score.toFixed(1)}</span>
          <span className="text-xs font-medium text-slate-400">/ 100</span>
        </p>
      </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-slate-400">Potential</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style}`}>
          {item.potential}
        </span>
      </div>
    </div>
  );
};

export default TopicCard;
