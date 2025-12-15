import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ViewState } from '../types';

interface RegisterViewProps {
  darkMode: boolean;
  setView: (view: ViewState) => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ darkMode, setView }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      setView(ViewState.HOME);
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full pt-12 animate-fade-in">
      <div className={`p-8 rounded-2xl shadow-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
        <h2 className={`text-3xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none transition-all ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up Free'}
          </button>
        </form>

        <div className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Already have an account?{' '}
          <button 
            onClick={() => setView(ViewState.LOGIN)}
            className="text-green-500 hover:underline font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;