import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, TrendingUp, ChevronDown } from 'lucide-react';

const Navbar = ({ darkMode, toggleTheme }) => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path 
      ? "text-blue-500 font-semibold" 
      : "text-slate-400 hover:text-slate-200 transition-colors";
  };

  const topics = [
    "Generative AI",
    "Natural Language Processing",
    "Computer Vision",
    "Reinforcement Learning",
    "Quantum Computing",
    "Robotics",
    "Cybersecurity",
    "Bioinformatics",
    "Graph Neural Networks",
    "Explainable AI"
  ];

  return (
    <nav className="glass border-b border-white/5 sticky top-0 z-50 w-full select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-all">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              TrendScope
            </span>
          </Link>

          {/* Links and Toggle */}
          <div className="flex items-center space-x-6">
            <Link to="/" className={isActive("/")}>
              Home
            </Link>
            
            <Link to="/analyze" className={isActive("/analyze")}>
              Analyze Paper
            </Link>
            
            {/* Future Aspects Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button 
                className={`flex items-center space-x-1 py-2 cursor-pointer focus:outline-none ${
                  location.pathname.startsWith('/future') ? 'text-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'
                } transition-colors`}
              >
                <span>Future Aspects</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-[-30px] sm:right-0 w-60 mt-0 rounded-xl glass border border-white/10 shadow-2xl py-2 z-50 animate-fade-in">
                  {topics.map((t) => (
                    <Link
                      key={t}
                      to={`/future/${encodeURIComponent(t)}`}
                      className="block px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-blue-500/10 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/leaderboard" className={isActive("/leaderboard")}>
              Leaderboard
            </Link>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 transition-all cursor-pointer"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
