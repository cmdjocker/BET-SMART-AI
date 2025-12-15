import React, { ReactNode } from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  children: ReactNode;
  darkMode: boolean;
  toggleTheme: () => void;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, darkMode, toggleTheme, currentView, setView }) => {
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b ${darkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-gray-200'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.HOME)}>
            {/* Logo Icon */}
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center transform rotate-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
               </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">Bet Smart <span className="text-green-500">AI</span></span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-4">
              <button 
                onClick={() => setView(ViewState.HOME)}
                className={`px-3 py-2 rounded-md font-medium transition-colors ${currentView === ViewState.HOME ? 'text-green-500' : 'hover:text-green-500'}`}
              >
                Predictions
              </button>
              <button 
                onClick={() => setView(ViewState.VIP)}
                className={`px-3 py-2 rounded-md font-medium transition-colors flex items-center gap-1 ${currentView === ViewState.VIP ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                VIP Access
              </button>
            </nav>
            
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-200 text-slate-700'}`}
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex">
        {/* Left Ad Space */}
        <aside className="hidden lg:block w-64 p-4 shrink-0">
            <div className={`sticky top-24 w-full h-[600px] rounded-lg border-2 border-dashed flex items-center justify-center ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-300 bg-gray-100'}`}>
                <span className="text-gray-400 font-semibold tracking-widest uppercase">Ad Space</span>
            </div>
        </aside>

        {/* Center Content */}
        <main className="flex-1 p-4 md:p-8 min-w-0">
            {children}
        </main>

        {/* Right Ad Space */}
        <aside className="hidden lg:block w-64 p-4 shrink-0">
            <div className={`sticky top-24 w-full h-[600px] rounded-lg border-2 border-dashed flex items-center justify-center ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-300 bg-gray-100'}`}>
                <span className="text-gray-400 font-semibold tracking-widest uppercase">Ad Space</span>
            </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className={`border-t py-12 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-100 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">B</span>
                    </div>
                    Bet Smart With AI
                </h3>
                <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Leveraging advanced artificial intelligence to aggregate global statistics and deliver high-probability sports predictions.
                </p>
                <div className={`flex flex-col gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>1250 Innovation Drive</p>
                    <p>Austin, TX 78701, USA</p>
                    <p>+1 (512) 555-0198</p>
                </div>
            </div>
            
            <div className="flex flex-col gap-2">
                <h4 className="font-bold mb-2">Quick Links</h4>
                <a href="#" className="hover:text-green-500 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-green-500 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-green-500 transition-colors">Responsible Gambling</a>
                <a href="#" className="hover:text-green-500 transition-colors">Support</a>
            </div>

            <div className="flex flex-col gap-2">
                <h4 className="font-bold mb-2">Connect With Us</h4>
                <div className="flex gap-4">
                    <a href="#" className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-gray-200'}`}>
                        {/* Instagram Icon */}
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 3.808-.06h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                    </a>
                    <a href="#" className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-gray-200'}`}>
                         {/* Facebook Icon */}
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                    </a>
                    <a href="#" className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-gray-200'}`}>
                         {/* TikTok Icon */}
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.48 4v3.313c0 .873.714 1.593 1.587 1.593.63 0 1.202-.387 1.454-.962V4h3.568v6.237a6.34 6.34 0 01-6.336 6.335 6.34 6.34 0 01-6.336-6.335A6.34 6.34 0 0112.48 3.902V4zm-3.084 12.872a3.176 3.176 0 01-3.172-3.172 3.176 3.176 0 013.172-3.172 3.176 3.176 0 01-3.172 3.172z" clipRule="evenodd" /></svg>
                    </a>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                    © 2024 Bet Smart With AI. All rights reserved. 18+ Only.
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;