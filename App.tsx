import React, { useState } from 'react';
import Layout from './components/Layout';
import HomeView from './components/HomeView';
import VipView from './components/VipView';
import { ViewState } from './types';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Layout 
      darkMode={darkMode} 
      toggleTheme={toggleTheme}
      currentView={currentView}
      setView={setCurrentView}
    >
      {currentView === ViewState.HOME ? (
        <HomeView darkMode={darkMode} />
      ) : (
        <VipView darkMode={darkMode} />
      )}
    </Layout>
  );
};

export default App;
