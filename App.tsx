import React, { useState } from 'react';
import Layout from './components/Layout';
import HomeView from './components/HomeView';
import VipView from './components/VipView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import { ViewState } from './types';
import { AuthProvider } from './context/AuthContext';

const AppContent: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const renderView = () => {
    switch(currentView) {
      case ViewState.LOGIN:
        return <LoginView darkMode={darkMode} setView={setCurrentView} />;
      case ViewState.REGISTER:
        return <RegisterView darkMode={darkMode} setView={setCurrentView} />;
      case ViewState.VIP:
        return <VipView darkMode={darkMode} setView={setCurrentView} />;
      case ViewState.HOME:
      default:
        return <HomeView darkMode={darkMode} />;
    }
  };

  return (
    <Layout 
      darkMode={darkMode} 
      toggleTheme={toggleTheme}
      currentView={currentView}
      setView={setCurrentView}
    >
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;