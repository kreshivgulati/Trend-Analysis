import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, AlertTriangle, Cpu, Tag, Sparkles, Loader2 } from 'lucide-react';
import { analyzePaper } from '../api';
import StatCard from '../components/StatCard';
import TrendChart from '../components/TrendChart';

const PaperAnalyzerPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);

  const maxAbstractLength = 2000;

  const exampleTitle = "Attention Is All You Need";
  const exampleAbstract = "We propose a new network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU.";

  // Cycle loading steps during analysis
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 3);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Handle results panel slide-in animation
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => setAnimateIn(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [result]);

  const handlePrefill = (e) => {
    e.preventDefault();
    setTitle(exampleTitle);
    setAbstract(exampleAbstract);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) {
      setError("Please fill out both the title and abstract.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const data = await analyzePaper(title, abstract);
      setResult(data);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze paper. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceStyle = (confidence) => {
    if (confidence > 70) {
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    } else if (confidence >= 40) {
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    } else {
      return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center md:text-left mb-12 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 rounded-full mb-4">
          <FileText className="h-4.5 w-4.5" />
          <span>Research Analytics</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Analyze Your Research Paper
        </h2>
        <p className="text-slate-400 mt-2 text-base md:text-lg max-w-2xl font-medium">
          Paste your title and abstract to discover its future potential and matching trend fields.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="glass border border-rose-500/20 rounded-2xl p-6 mb-8 flex items-center space-x-4 text-rose-400 max-w-xl">
          <AlertTriangle className="h-6 w-6 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* LEFT PANEL - Input Form */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl shadow-xl border border-white/5">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-slate-300 mb-2">
                Paper Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the title of your paper..."
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-200 outline-none transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="abstract" className="text-sm font-bold text-slate-300">
                  Abstract
                </label>
                <span className={`text-xs ${abstract.length > maxAbstractLength - 200 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {abstract.length} / {maxAbstractLength}
                </span>
              </div>
              <textarea
                id="abstract"
                rows={8}
                value={abstract}
                onChange={(e) => {
                  const val = e.target.value;
                  setAbstract(val.slice(0, maxAbstractLength));
                }}
                placeholder="Paste the abstract details here..."
                className="w-full px-4 py-3 rounded-xl glass-input text-slate-200 outline-none transition-all duration-200 text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyzing Paper...</span>
                </>
              ) : (
                <>
                  <span>Analyze Paper</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <a
                href="#"
                onClick={handlePrefill}
                className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Try an example</span>
              </a>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL - Results / Loading State */}
        <div className="lg:col-span-7 min-h-[400px]">
          {loading && (
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center min-h-[400px] text-center border border-white/5 space-y-8">
              <div className="relative flex items-center justify-center w-20 h-20">
                <div className="absolute w-full h-full rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin" />
                <Cpu className="h-8 w-8 text-blue-400 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-200">Processing Abstract</h3>
                <p className="text-xs text-slate-400">Our machine learning models are analyzing content density...</p>
              </div>

              {/* Cycling Step Indicators */}
              <div className="w-full max-w-sm space-y-3 mt-4">
                <div className="flex items-center justify-between text-xs font-semibold px-2">
                  <span className={loadingStep === 0 ? "text-blue-400 font-bold" : "text-slate-500"}>
                    1. Extracting keywords
                  </span>
                  <div className={`flex space-x-1 ${loadingStep === 0 ? "animate-pulse-soft text-blue-400" : "text-slate-700"}`}>
                    <span>•</span><span>•</span><span>•</span>
                  </div>
                  <span className={loadingStep === 1 ? "text-blue-400 font-bold" : "text-slate-500"}>
                    2. Matching topic
                  </span>
                  <div className={`flex space-x-1 ${loadingStep === 1 ? "animate-pulse-soft text-blue-400" : "text-slate-700"}`}>
                    <span>•</span><span>•</span><span>•</span>
                  </div>
                  <span className={loadingStep === 2 ? "text-blue-400 font-bold" : "text-slate-500"}>
                    3. Running ML models
                  </span>
                </div>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center min-h-[400px] text-center border border-white/5 text-slate-500">
              <FileText className="h-16 w-16 mb-4 text-slate-700" />
              <h3 className="text-lg font-bold text-slate-400">Analysis Results</h3>
              <p className="text-sm text-slate-500 max-w-xs mt-2">
                Fill in the title and abstract, then submit to see predictions, fields, complexity, and trend scoring.
              </p>
            </div>
          )}

          {/* Results Panel Container with Slide-in Animation */}
          {!loading && result && (
            <div className={`transition-all duration-700 ease-out space-y-6 ${
              animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              
              {/* Top Banner details */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
                
                {/* Low Confidence Warning */}
                {result.match_confidence < 40 && (
                  <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl mb-2">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                      <strong>Low confidence match ({result.match_confidence}%).</strong> This topic may not be well represented in our dataset, which might affect prediction accuracy.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Matched Topic Chip */}
                  <div className="flex items-center space-x-3">
                    <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                      <Tag className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Matched Field Topic</p>
                      <h4 className="text-lg font-bold text-white mt-0.5 flex items-center">
                        {result.matched_topic}
                        {result.data_source === "semantic_scholar" && (
                          <span style={{
                            background: "#10b981",
                            color: "white",
                            fontSize: "10px",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            marginLeft: "8px"
                          }}>
                            S2 Verified
                          </span>
                        )}
                      </h4>
                      {result.real_citations !== null && (
                        <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "6px" }}>
                          📚 Real Citations: {result.real_citations.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Match Confidence Badge */}
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border ${getConfidenceStyle(result.match_confidence)}`}>
                    🏷 {result.match_confidence}% Match Confidence
                  </span>
                </div>

                {/* Badges row */}
                <div className="flex items-center space-x-3 pt-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/5 text-xs font-semibold">
                    Field: {result.research_field}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/5 text-xs font-semibold">
                    Complexity: {result.paper_complexity}
                  </span>
                </div>

                {/* Key Concepts row */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Key Concepts Extracted</p>
                  <div className="flex flex-wrap gap-2">
                    {result.key_concepts.map((concept) => (
                      <span 
                        key={concept} 
                        className="px-3 py-1 rounded-full border border-blue-500/20 bg-transparent text-blue-400 text-xs font-semibold"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Insight Quote Box */}
                <div className="p-4 rounded-xl bg-slate-900/60 border-l-2 border-blue-500/60 text-slate-300 text-sm italic">
                  "{result.insight}"
                </div>
              </div>

              {/* Three Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Trend Score" 
                  value={result.predicted_score} 
                  type="score" 
                />
                <StatCard 
                  title="Expected Growth" 
                  value={result.expected_growth} 
                  type="growth" 
                />
                <StatCard 
                  title="Future Potential" 
                  value={result.future_potential} 
                  type="potential" 
                />
              </div>

              {/* Chart */}
              <div>
                <TrendChart data={result.historical_data} />
              </div>

              {/* Button Report */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/future/' + encodeURIComponent(result.matched_topic))}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all duration-300 shadow-md shadow-purple-500/25 text-sm cursor-pointer"
                >
                  🔮 Explore Future Aspects
                </button>
                <button
                  onClick={() => navigate(`/predict/${encodeURIComponent(result.matched_topic)}`)}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all duration-300 shadow-md shadow-blue-500/20 text-sm cursor-pointer"
                >
                  View Full Topic Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperAnalyzerPage;
