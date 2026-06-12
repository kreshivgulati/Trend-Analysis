import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, AlertCircle, TrendingUp } from 'lucide-react';
import { getTopics, getLeaderboard } from '../api';
import TopicCard from '../components/TopicCard';

const HomePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allTopics, leaderboardData] = await Promise.all([
          getTopics(),
          getLeaderboard()
        ]);
        setTopics(allTopics);
        setTrending(leaderboardData.slice(0, 5));
        setError(null);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError("Unable to communicate with the prediction server. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter autocomplete suggestions based on query
  useEffect(() => {
    if (query.trim() === '') {
      setFilteredTopics([]);
    } else {
      const match = topics.filter(t => 
        t.lowerCase ? t.toLowerCase().includes(query.toLowerCase()) : t.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTopics(match);
    }
  }, [query, topics]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/predict/${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (topic) => {
    setQuery(topic);
    setShowSuggestions(false);
    navigate(`/predict/${encodeURIComponent(topic)}`);
  };

  const handleCardClick = (topic) => {
    navigate(`/predict/${encodeURIComponent(topic)}`);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 flex flex-col items-center">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="text-center max-w-3xl z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-6 animate-pulse-soft">
          <Sparkles className="h-4.5 w-4.5" />
          <span>Next-Gen Trend Forecasting</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-none">
          Predict Research{' '}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Trends
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 font-medium mb-8 max-w-2xl mx-auto">
          Powered by arXiv metadata, historical publication growth metrics, and XGBoost Machine Learning models.
        </p>

        {/* Analyze Card in Hero */}
        <div className="max-w-md mx-auto mb-8 glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg text-left">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">📄</div>
            <div>
              <h4 className="text-sm font-bold text-white">Analyze a Paper</h4>
              <p className="text-xs text-slate-400 mt-0.5">Paste any abstract to get trend predictions</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/analyze')}
            className="px-4 py-2 bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            Try it
          </button>
        </div>
      </div>

      {/* Search Bar Container */}
      <div className="w-full max-w-xl z-25 relative mb-20">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="absolute left-4 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search topic (e.g., Generative AI, Quantum Computing...)"
            className="w-full pl-12 pr-28 py-4 rounded-2xl glass-input text-slate-200 outline-none transition-all duration-300 font-medium"
          />
          <button
            type="submit"
            className="absolute right-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-md shadow-blue-500/20"
          >
            Analyze
          </button>
        </form>

        {/* Search Autocomplete Suggestions */}
        {showSuggestions && filteredTopics.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl border border-white/5 py-2 shadow-2xl overflow-hidden z-50">
            {filteredTopics.map((topic) => (
              <li 
                key={topic}
                onMouseDown={() => handleSuggestionClick(topic)}
                className="px-5 py-3 text-sm text-slate-300 hover:bg-blue-500/20 hover:text-white cursor-pointer transition-colors duration-150 font-medium"
              >
                {topic}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="w-full max-w-2xl glass border border-rose-500/20 rounded-2xl p-6 mb-12 flex items-center space-x-4 text-rose-400">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Connection Error</h4>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Trending / Top 5 section */}
      <div className="w-full z-10">
        <div className="flex items-center space-x-2 mb-8">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-extrabold text-slate-200 tracking-tight">Top Trending Research Fields</h2>
        </div>
        
        {loading ? (
          // Loading Skeletons
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl h-48 animate-pulse flex flex-col justify-between">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-8 bg-slate-800 rounded w-1/2" />
                <div className="h-4 bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {trending.map((item) => (
              <TopicCard
                key={item.topic}
                item={item}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
