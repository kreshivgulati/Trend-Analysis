// npm install && npm run dev
// API base URL: http://localhost:8000

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PaperAnalyzerPage from './pages/PaperAnalyzerPage';
import FutureAspectsPage from './pages/FutureAspectsPage';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Add or remove "dark" class on document root to toggle Tailwind dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#0b0f19';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f8fafc';
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-navy-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        {/* Common Navbar */}
        <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />
        
        {/* Main Content Area */}
        <main className="w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/predict/:topic" element={<ResultPage />} />
            <Route path="/analyze" element={<PaperAnalyzerPage />} />
            <Route path="/future/:topic" element={<FutureAspectsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="w-full py-8 text-center text-xs text-slate-500 border-t border-white/5 mt-12">
          <p>© {new Date().getFullYear()} TrendScope. Built with XGBoost and FastAPI.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
