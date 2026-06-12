import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { predictTopic } from '../api';
import StatCard from '../components/StatCard';
import TrendChart from '../components/TrendChart';

const ResultPage = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setError(null);
        const prediction = await predictTopic(decodeURIComponent(topic));
        setData(prediction);
      } catch (err) {
        console.error("Error fetching topic prediction:", err);
        if (err.response && err.response.status === 404) {
          setError(`The topic "${decodeURIComponent(topic)}" is not supported by our models. Please search for a different topic.`);
        } else {
          setError("Failed to fetch predictions. Please check your network connection and verify the backend is running.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      fetchPrediction();
    }
  }, [topic]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Loading Skeletons */}
        <div className="flex items-center space-x-3 mb-8 animate-pulse">
          <div className="w-8 h-8 rounded bg-slate-800" />
          <div className="h-8 bg-slate-800 rounded w-1/3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl h-28 animate-pulse bg-slate-900/40" />
          ))}
        </div>

        <div className="glass-card p-6 rounded-2xl h-[400px] animate-pulse bg-slate-900/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 mb-6 border border-rose-500/20">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-3">Analysis Failed</h2>
        <p className="text-slate-400 mb-8 max-w-sm">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Search Another Topic</span>
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Back navigation */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition-colors py-2 group"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Search</span>
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors py-2 px-4 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10"
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>Compare Another</span>
        </button>
      </div>

      {/* Topic Name Heading */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-8">
        {data.topic}
      </h2>

      {/* Three Stat Cards Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Predicted Trend Score" 
          value={data.predicted_score} 
          type="score" 
        />
        <StatCard 
          title="Expected Growth" 
          value={data.expected_growth} 
          type="growth" 
        />
        <StatCard 
          title="Future Potential" 
          value={data.future_potential} 
          type="potential" 
        />
      </div>

      {/* Future Aspects Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => navigate('/future/' + encodeURIComponent(data.topic))}
          className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-purple-500/25 flex items-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
        >
          <span>🔮 View Future Aspects</span>
        </button>
      </div>

      {/* Recharts Timeline Line Chart */}
      <div className="mb-12">
        <TrendChart data={data.historical_data} />
      </div>

      {/* Action Footer */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20"
        >
          Search Another Topic
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
