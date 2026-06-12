import React from 'react';
import { ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';

const LeaderboardTable = ({ data, onTopicClick }) => {
  const getPotentialStyle = (potential) => {
    switch (potential) {
      case "Very High":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      case "High":
        return "bg-blue-500/10 text-blue-400 border-blue-500/25";
      case "Moderate":
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
      case "Low":
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/25";
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 ring-2 ring-amber-400/20";
    if (rank === 2) return "bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 ring-2 ring-slate-400/20";
    if (rank === 3) return "bg-gradient-to-r from-amber-700 to-amber-800 text-white ring-2 ring-amber-800/20";
    return "bg-slate-800 text-slate-300 border border-white/5";
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/5">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5 text-left">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Topic</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Score</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Growth</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Future Potential</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/20">
            {data.map((item) => {
              const isPositive = item.growth >= 0;
              const badgeStyle = getPotentialStyle(item.potential);
              
              return (
                <tr 
                  key={item.topic}
                  onClick={() => onTopicClick(item.topic)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors duration-200 group"
                >
                  {/* Animated Rank */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs shadow-md transition-all duration-300 group-hover:scale-110 ${getRankBadge(item.rank)}`}>
                        {item.rank === 1 && <Award className="w-3.5 h-3.5 mr-0.5" />}
                        {item.rank}
                      </span>
                    </div>
                  </td>
                  {/* Topic Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                      {item.topic}
                    </div>
                  </td>
                  {/* Latest Score */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-extrabold text-slate-200">
                      {item.latest_score.toFixed(1)}
                    </div>
                  </td>
                  {/* Expected Growth */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>{isPositive ? '+' : ''}{item.growth.toFixed(1)}%</span>
                    </span>
                  </td>
                  {/* Future Potential */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
                      {item.potential}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
