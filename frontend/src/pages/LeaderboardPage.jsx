import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, AlertCircle } from 'lucide-react';
import { getLeaderboard } from '../api';
import LeaderboardTable from '../components/LeaderboardTable';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard();
        setLeaderboard(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Could not load the leaderboard. Please ensure the backend server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleTopicClick = (topicName) => {
    navigate(`/predict/${encodeURIComponent(topicName)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative">
      {/* Decorative Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 z-10 relative">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 rounded-full mb-4">
            <Trophy className="h-4.5 w-4.5" />
            <span>Leaderboard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
            Research Trend Leaderboard
          </h2>
          <p className="text-slate-400 mt-3 text-base md:text-lg max-w-2xl font-medium">
            Top research topics ranked by their latest actual trend score computed from publication output and citation proxies.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass border border-rose-500/20 rounded-2xl p-6 flex items-center space-x-4 text-rose-400 max-w-2xl mx-auto">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm font-sans">Connection Error</h4>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!error && (
        <div className="z-10 relative">
          {loading ? (
            // Loading Skeletons Table
            <div className="glass-card rounded-2xl p-6 w-full animate-pulse space-y-4">
              <div className="h-6 bg-slate-800 rounded w-1/4" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-800/60 rounded w-full" />
              ))}
            </div>
          ) : (
            <LeaderboardTable 
              data={leaderboard} 
              onTopicClick={handleTopicClick} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
