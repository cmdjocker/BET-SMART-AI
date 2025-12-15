import React from 'react';
import { VipPlan } from '../types';

interface VipViewProps {
  darkMode: boolean;
}

const plans: VipPlan[] = [
  {
    name: "Weekly Pass",
    price: "$9.99",
    features: ["7 Days Access", "Daily AI Picks", "Risk Management Tips"],
  },
  {
    name: "Monthly Pro",
    price: "$29.99",
    features: ["30 Days Access", "Premium Analytics", "Live Odds Tracking", "SMS Alerts"],
    recommended: true
  },
  {
    name: "Season Ticket",
    price: "$199.99",
    features: ["Full Season Access", "All Leagues", "Private Telegram Group", "Priority Support"],
  }
];

const VipView: React.FC<VipViewProps> = ({ darkMode }) => {
  return (
    <div className="max-w-5xl mx-auto w-full animate-fade-in">
       <div className="text-center mb-12">
            <span className="bg-yellow-500/20 text-yellow-500 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">Premium Access</span>
            <h2 className={`text-4xl font-extrabold mt-4 mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Unlock Elite Betting Intelligence
            </h2>
            <p className={`max-w-2xl mx-auto text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Join over 10,000 members winning more with our advanced machine learning models and exclusive insider statistics.
            </p>
       </div>

       {/* Plans Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
                <div 
                    key={index} 
                    className={`relative rounded-2xl p-8 border-2 transition-transform hover:-translate-y-2 
                    ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}
                    ${plan.recommended ? 'border-yellow-500 shadow-xl shadow-yellow-500/10' : ''}
                    `}
                >
                    {plan.recommended && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black font-bold px-4 py-1 rounded-full text-sm">
                            Best Value
                        </div>
                    )}
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                        {plan.name !== "Season Ticket" && <span className="text-gray-500">/mo</span>}
                    </div>
                    <ul className="space-y-4 mb-8">
                        {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{feat}</span>
                            </li>
                        ))}
                    </ul>
                    <button className={`w-full py-3 rounded-xl font-bold transition-colors ${plan.recommended ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>
                        Choose Plan
                    </button>
                </div>
            ))}
       </div>

       {/* Registration Form Mockup */}
       <div className={`max-w-xl mx-auto p-8 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create Free Account</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                    <input type="email" className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="you@example.com" />
                </div>
                <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                    <input type="password" className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'}`} placeholder="••••••••" />
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors mt-2">
                    Start Free Trial
                </button>
            </form>
       </div>
    </div>
  );
};

export default VipView;
