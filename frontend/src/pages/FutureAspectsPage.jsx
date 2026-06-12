import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, ArrowRight, ShieldAlert, CheckCircle2, 
  AlertTriangle, Cpu, Layers, Compass, Share2, ArrowLeft, Loader2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { getFutureAspects, predictTopic } from '../api';

const FutureAspectsPage = () => {
  const { topic } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [historical, setHistorical] = useState([]);
  const [error, setError] = useState(null);
  
  // Typewriter effect state
  const [displayedLength, setDisplayedLength] = useState(0);
  // Sharing clipboard notification state
  const [copied, setCopied] = useState(false);
  // Fade-in animations trigger
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const fetchFutureData = async () => {
      try {
        setLoading(true);
        setError(null);
        setAnimate(false);

        // Fetch both future aspects and general history for the chart
        const [futureRes, predictRes] = await Promise.all([
          getFutureAspects(topic),
          predictTopic(topic)
        ]);

        setData(futureRes);
        setHistorical(predictRes.historical_data || []);
        setAnimate(true);
      } catch (err) {
        console.error("Error fetching future aspects:", err);
        setError("Could not load future prediction report. Make sure the backend is active.");
      } finally {
        setLoading(false);
      }
    };

    fetchFutureData();
  }, [topic]);

  // Typewriter effect trigger when data loads
  useEffect(() => {
    if (!data || !data.insight_summary) return;
    setDisplayedLength(0);
    const timer = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev >= data.insight_summary.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 15);
    return () => clearInterval(timer);
  }, [data]);

  const summaryText = data && data.insight_summary ? data.insight_summary.slice(0, displayedLength) : '';

  if (loading) {
    return (
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-bold text-sm">Generating Future Prediction Model...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[70vh] max-w-xl mx-auto px-4 flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-white">Prediction Error</h3>
          <p className="text-sm text-slate-400 mt-2">{error || "Topic prediction unavailable."}</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compile unified chart dataset: Historical + Forecast
  // Connect historical and forecast at 2024
  const lastHistoricalVal = historical.length > 0 ? historical[historical.length - 1].trend_score : data.current_score;
  
  const chartData = [
    ...historical.map(h => ({
      year: h.year,
      score: h.trend_score,
      lower: null,
      upper: null,
      isForecast: false
    })),
    // Connecting year (2024)
    {
      year: 2024,
      score: lastHistoricalVal,
      lower: lastHistoricalVal,
      upper: lastHistoricalVal,
      isForecast: true
    },
    ...data.yearly_forecast.map(f => ({
      year: f.year,
      score: f.predicted_score,
      lower: f.lower_bound,
      upper: f.upper_bound,
      isForecast: true
    }))
  ];

  const getAdoptionStageStyle = (stage) => {
    switch (stage) {
      case 'Emerging': return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case 'Growth': return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case 'Mainstream': return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case 'Saturated': return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf > 75) return "from-emerald-500 to-teal-400 text-emerald-400";
    if (conf > 50) return "from-amber-500 to-yellow-400 text-amber-400";
    return "from-rose-500 to-red-400 text-rose-400";
  };

  const getConfidenceBorderColor = (conf) => {
    if (conf > 75) return "border-emerald-500/30 shadow-emerald-500/5";
    if (conf > 50) return "border-amber-500/30 shadow-amber-500/5";
    return "border-rose-500/30 shadow-rose-500/5";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12 select-text">
      
      {/* SECTION 1 - HERO BANNER */}
      <section className={`transition-all duration-700 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} glass-card p-8 rounded-2xl border border-white/5 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4">
            <Link to={`/predict/${encodeURIComponent(data.topic)}`} className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Topic Report</span>
            </Link>
            
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {data.topic}
              </h1>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getAdoptionStageStyle(data.adoption_stage)}`}>
                ⚡ {data.adoption_stage} Stage
              </span>
            </div>
            
            {/* Badges row */}
            <div className="flex flex-wrap gap-4 pt-1">
              <div className="px-4 py-2 bg-slate-900/50 rounded-xl border border-white/5 text-xs text-slate-300 font-medium">
                Peak growth year: <strong className="text-white">{data.peak_year}</strong>
              </div>
              <div className="px-4 py-2 bg-slate-900/50 rounded-xl border border-white/5 text-xs text-slate-300 font-medium">
                Saturation Risk: <strong className={data.saturation_risk === 'Low' ? 'text-emerald-400' : data.saturation_risk === 'Medium' ? 'text-amber-400' : 'text-rose-400'}>{data.saturation_risk}</strong>
              </div>
              <div className="px-4 py-2 bg-slate-900/50 rounded-xl border border-white/5 text-xs text-slate-300 font-medium">
                Disruption: <strong className="text-white">{data.disruption_potential}</strong>
              </div>
            </div>
          </div>

          {/* Current vs 5Yr Score block */}
          <div className="flex items-center space-x-6 bg-slate-900/40 p-6 rounded-2xl border border-white/5 sm:self-center">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Current Score</p>
              <h4 className="text-2xl font-extrabold text-slate-300 mt-1">{data.current_score}</h4>
            </div>
            <div className="text-blue-500 animate-pulse flex flex-col items-center">
              <ArrowRight className="h-6 w-6" />
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-1">5 Years</span>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Projected (5Yr)</p>
              <h4 className="text-2xl font-extrabold text-blue-400 mt-1">{data.predictions.next_5_years.score}</h4>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - FORECAST CHART */}
      <section className={`transition-all duration-700 delay-100 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} glass-card p-6 rounded-2xl border border-white/5 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white">10-Year Prediction Trajectory</h3>
            <p className="text-xs text-slate-400">Combines historical publication measurements with future neural projections (with 94%-106% error intervals).</p>
          </div>
        </div>

        <div className="h-[350px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="histColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="forecastColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 'auto']} />
              
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                  fontSize: '12px'
                }}
                formatter={(value, name, props) => {
                  if (name === "Historical") return [value, "Trend Score"];
                  if (name === "Projected") return [value, "Predicted Score"];
                  if (name === "Interval") return [`${value[0]} - ${value[1]}`, "Confidence Range"];
                  return [value, name];
                }}
              />
              
              {/* Vertical line splitting historical and forecast */}
              <ReferenceLine 
                x={2024} 
                stroke="#3b82f6" 
                strokeWidth={1}
                strokeDasharray="4 4" 
                label={{ 
                  value: '← Historical | Forecast →', 
                  position: 'top', 
                  fill: '#64748b', 
                  fontSize: 10,
                  fontWeight: 'bold',
                  offset: 10
                }} 
              />

              {/* Confidence Interval Band Area */}
              <Area 
                name="Interval"
                type="monotone"
                dataKey={(d) => d.isForecast ? [d.lower, d.upper] : null}
                stroke="none"
                fill="#3b82f6"
                fillOpacity={0.1}
                connectNulls
              />
              
              {/* Historical Area */}
              <Area 
                name="Historical"
                type="monotone" 
                dataKey={(d) => d.isForecast ? null : d.score} 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#histColor)" 
              />

              {/* Forecast Area */}
              <Area 
                name="Projected"
                type="monotone" 
                dataKey={(d) => d.isForecast ? d.score : null} 
                stroke="#60a5fa" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#forecastColor)"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* SECTION 3 - PREDICTION CARDS ROW */}
      <section className={`transition-all duration-700 delay-200 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} grid grid-cols-1 md:grid-cols-3 gap-6`}>
        {/* Card 1: 1 Year Forecast */}
        <div className={`glass-card p-6 rounded-2xl border ${getConfidenceBorderColor(data.predictions.next_1_year.confidence)} shadow-xl flex flex-col justify-between space-y-4`}>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Short-term Outlook</span>
            <h4 className="text-lg font-bold text-white mt-1">1 Year Forecast (2025)</h4>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{data.predictions.next_1_year.score}</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {data.predictions.next_1_year.growth} growth
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span>Model Confidence</span>
              <span className={getConfidenceColor(data.predictions.next_1_year.confidence).split(' ').pop()}>
                {data.predictions.next_1_year.confidence}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`bg-gradient-to-r ${getConfidenceColor(data.predictions.next_1_year.confidence)} h-full rounded-full`} 
                style={{ width: `${data.predictions.next_1_year.confidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: 3 Year Forecast */}
        <div className={`glass-card p-6 rounded-2xl border ${getConfidenceBorderColor(data.predictions.next_3_years.confidence)} shadow-xl flex flex-col justify-between space-y-4`}>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mid-term Outlook</span>
            <h4 className="text-lg font-bold text-white mt-1">3 Year Forecast (2027)</h4>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{data.predictions.next_3_years.score}</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {data.predictions.next_3_years.growth} growth
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span>Model Confidence</span>
              <span className={getConfidenceColor(data.predictions.next_3_years.confidence).split(' ').pop()}>
                {data.predictions.next_3_years.confidence}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`bg-gradient-to-r ${getConfidenceColor(data.predictions.next_3_years.confidence)} h-full rounded-full`} 
                style={{ width: `${data.predictions.next_3_years.confidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: 5 Year Forecast */}
        <div className={`glass-card p-6 rounded-2xl border ${getConfidenceBorderColor(data.predictions.next_5_years.confidence)} shadow-xl flex flex-col justify-between space-y-4`}>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Long-term Outlook</span>
            <h4 className="text-lg font-bold text-white mt-1">5 Year Forecast (2029)</h4>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{data.predictions.next_5_years.score}</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {data.predictions.next_5_years.growth} growth
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span>Model Confidence</span>
              <span className={getConfidenceColor(data.predictions.next_5_years.confidence).split(' ').pop()}>
                {data.predictions.next_5_years.confidence}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`bg-gradient-to-r ${getConfidenceColor(data.predictions.next_5_years.confidence)} h-full rounded-full`} 
                style={{ width: `${data.predictions.next_5_years.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - INSIGHTS PANEL */}
      <section className={`transition-all duration-700 delay-300 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} grid grid-cols-1 lg:grid-cols-12 gap-8`}>
        {/* Left Column: Key growth drivers + Related topics */}
        <div className="lg:col-span-6 space-y-8 flex flex-col justify-between">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 flex-1">
            <h4 className="text-lg font-bold text-white flex items-center space-x-2">
              <Layers className="h-5 w-5 text-emerald-400" />
              <span>Key Growth Drivers</span>
            </h4>
            <ul className="space-y-3 pt-2">
              {data.key_drivers.map((driver) => (
                <li key={driver} className="flex items-start space-x-3 text-sm text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <h4 className="text-lg font-bold text-white flex items-center space-x-2">
              <Compass className="h-5 w-5 text-blue-400" />
              <span>Related Fields (Overlap similarity)</span>
            </h4>
            <div className="flex flex-wrap gap-3 pt-2">
              {data.related_topics.map((t) => (
                <button
                  key={t.topic}
                  onClick={() => navigate(`/future/${encodeURIComponent(t.topic)}`)}
                  className="px-4 py-2 rounded-xl border border-blue-500/10 hover:border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-xs text-blue-300 font-bold transition-all duration-200 flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>{t.topic}</span>
                  <span className="text-[10px] text-slate-400 font-medium">({t.overlap_score}%)</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Risk Factors + AI Summary Terminal */}
        <div className="lg:col-span-6 space-y-8 flex flex-col justify-between">
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 flex-1">
            <h4 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <span>Risk Factors & Barriers</span>
            </h4>
            <ul className="space-y-3 pt-2">
              {data.risk_factors.map((risk) => (
                <li key={risk} className="flex items-start space-x-3 text-sm text-slate-300">
                  <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Terminal Summary box with Typewriter effect */}
          <div className="p-6 rounded-2xl border border-white/5 bg-slate-950 font-mono shadow-2xl relative overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Forecaster-AI v1.0</span>
            </div>

            <div className="min-h-[100px] text-sm text-emerald-400 leading-relaxed font-semibold">
              <span>{summaryText}</span>
              <span className="animate-pulse font-bold text-emerald-300 ml-0.5">_</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 - BOTTOM CTA BAR */}
      <section className={`transition-all duration-700 delay-400 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-white/5`}>
        <button
          onClick={() => navigate(`/predict/${encodeURIComponent(data.topic)}`)}
          className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to Results</span>
        </button>

        <button
          onClick={() => navigate('/analyze')}
          className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
        >
          <Cpu className="h-4.5 w-4.5" />
          <span>Analyze Another Paper</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center space-x-2"
        >
          <Share2 className="h-4.5 w-4.5" />
          <span>{copied ? "Copied Link!" : "Share Report"}</span>
        </button>
      </section>

    </div>
  );
};

export default FutureAspectsPage;
