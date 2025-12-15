import React, { useState, useEffect } from 'react';
import { getPrediction, getTrendingMatches } from '../services/geminiService';
import { PredictionData, TrendingMatch } from '../types';

interface HomeViewProps {
  darkMode: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ darkMode }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [error, setError] = useState('');
  const [trendingMatches, setTrendingMatches] = useState<TrendingMatch[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
        try {
            const matches = await getTrendingMatches();
            setTrendingMatches(matches);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingTrending(false);
        }
    };
    fetchTrending();
  }, []);

  const executePrediction = async (matchQuery: string) => {
    if (!matchQuery.trim()) return;
    setLoading(true);
    setError('');
    setPrediction(null);
    setQuery(matchQuery); // Update the input field

    try {
      const data = await getPrediction(matchQuery);
      setPrediction(data);
    } catch (err) {
      setError('Failed to fetch prediction. Please check your API Key or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    executePrediction(query);
  };

  const resetSearch = () => {
      setPrediction(null);
      setQuery('');
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
        {/* Logo Section - Bigger */}
        <div className="flex flex-col items-center justify-center mb-12 animate-fade-in">
             <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                 </svg>
             </div>
             <div className={`mt-6 text-4xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                BET SMART <span className="text-green-500">AI</span>
             </div>
        </div>

      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in">
        {!prediction && (
            <>
                <h1 className={`text-4xl md:text-6xl font-extrabold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Win More with <span className="text-green-500">AI-Powered Stats</span>
                </h1>
                <p className={`text-lg md:text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Get high-probability betting predictions backed by data from top statistical sources.
                </p>
            </>
        )}

        {/* Input Form */}
        {!prediction && (
            <form onSubmit={handlePredict} className="max-w-xl mx-auto relative z-10">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter match (e.g., Man City vs Arsenal)..."
                className={`w-full px-6 py-4 rounded-full text-lg border-2 outline-none transition-all shadow-lg
                ${darkMode 
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-green-500 placeholder-gray-500' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-green-500 placeholder-gray-400'
                }`}
            />
            <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-green-500 hover:bg-green-600 text-white px-8 rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Analyzing...' : 'Predict'}
            </button>
            </form>
        )}

        {/* Featured Games Section */}
        {!prediction && !loading && (
            <div className="mt-16 max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Trending Matches Today
                    </h3>
                </div>
                
                {loadingTrending ? (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Loading trending matches...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trendingMatches.map((game) => (
                            <button
                                key={game.id}
                                onClick={() => executePrediction(`${game.home} vs ${game.away}`)}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.02] group text-left
                                    ${darkMode 
                                        ? 'bg-slate-800/50 border-slate-700 hover:border-green-500/50 hover:bg-slate-800' 
                                        : 'bg-white border-gray-100 hover:border-green-500/30 hover:shadow-lg'
                                    }`}
                            >
                                <div>
                                    <div className={`text-xs font-bold mb-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{game.league}</div>
                                    <div className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {game.home} <span className="text-gray-500 text-sm mx-1">vs</span> {game.away}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-xs px-2 py-1 rounded-full font-mono ${darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                        {game.time}
                                    </span>
                                    <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold flex items-center gap-1">
                                        Analyze <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-8 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-center animate-fade-in">
          {error}
        </div>
      )}

      {/* Prediction Result */}
      {prediction && (
        <div className={`animate-fade-in rounded-2xl overflow-hidden shadow-2xl border mb-12 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center relative">
             <button 
                onClick={resetSearch}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                title="Back to search"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </button>
             <h2 className="text-2xl font-bold">{prediction.homeTeam} vs {prediction.awayTeam}</h2>
             <div className="mt-2 text-sm opacity-90 font-medium tracking-wide uppercase">AI Probability Analysis</div>
          </div>

          <div className="p-8">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {/* Result Block */}
                <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Winner</div>
                    <div className={`text-xl font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {prediction.predictedWinner}
                    </div>
                </div>

                {/* Score Block */}
                <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                     <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Score</div>
                     <div className="text-2xl font-extrabold text-green-500">{prediction.scorePrediction}</div>
                </div>

                {/* Over/Under Block */}
                <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Goals</div>
                    <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {prediction.overUnder}
                    </div>
                </div>

                {/* BTTS Block */}
                <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">BTTS</div>
                    <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {prediction.btts}
                    </div>
                </div>
            </div>

            {/* AI Analysis & Prediction Level */}
            <div className={`mb-8 p-6 rounded-xl ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Analysis</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-yellow-600 border'}`}>
                        Confidence: {prediction.confidence}%
                    </div>
                </div>
                
                <p className={`leading-relaxed mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {prediction.reasoning}
                </p>

                {/* Prediction Level Bar */}
                <div>
                    <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-2">
                        <span className="text-gray-400">Prediction Level Status</span>
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>{prediction.predictionLevel}/100</span>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                        <div 
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out"
                            style={{ width: `${prediction.predictionLevel}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Key Stats */}
            <div className="mb-8">
                <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Key Statistics</h3>
                <ul className="space-y-3">
                    {prediction.keyStats.map((stat, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{stat}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Home / Search Again Button */}
            <button 
                onClick={resetSearch}
                className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg hover:shadow-green-500/20 transition-all flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Analyze Another Match
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;