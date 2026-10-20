import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import GlobalSearchModal from './components/GlobalSearchModal';
import AlertDrawer from './components/AlertDrawer';

import Dashboard from './pages/Dashboard';
import ForecastPage from './pages/ForecastPage';
import InventoryPage from './pages/InventoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import AlertsPage from './pages/AlertsPage';

import api from './api/client';

export const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);

  // Target medicine and preset to pass into ForecastPage
  const [forecastTargetMedicine, setForecastTargetMedicine] = useState('Paracetamol 500mg');
  const [activePreset, setActivePreset] = useState(null);

  // Health and catalog check
  useEffect(() => {
    checkHealthAndInit();
    const interval = setInterval(checkHealthAndInit, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealthAndInit = async () => {
    try {
      const health = await api.checkHealth();
      setBackendOnline(health.status === 'online');

      const [invRes, alertRes] = await Promise.all([
        api.getInventory(),
        api.getAlerts()
      ]);
      setMedicines(invRes.items);
      setAlerts(alertRes.alerts);
    } catch (err) {
      setBackendOnline(false);
      console.warn('Backend API connection pending or unavailable:', err.message);
    }
  };

  const handleNavigateToForecast = (medName) => {
    setForecastTargetMedicine(medName);
    setActivePreset(null);
    setActiveTab('forecast');
  };

  const handleSelectPresetScenario = (preset) => {
    setForecastTargetMedicine(preset.medicine);
    setActivePreset(preset);
    setActiveTab('forecast');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white font-sans antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        backendOnline={backendOnline}
        alertCount={alerts.length}
        onOpenAlerts={() => setIsAlertDrawerOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectPreset={handleSelectPresetScenario}
        activeTab={activeTab}
      />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          alertCount={alerts.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigateToForecast={handleNavigateToForecast}
              onSelectPresetScenario={handleSelectPresetScenario}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastPage
              initialMedicine={forecastTargetMedicine}
              initialPreset={activePreset}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryPage
              onNavigateToForecast={handleNavigateToForecast}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsPage
              onNavigateToForecast={handleNavigateToForecast}
            />
          )}

          {activeTab === 'performance' && (
            <ModelPerformancePage />
          )}

          {activeTab === 'alerts' && (
            <AlertsPage
              onNavigateToForecast={handleNavigateToForecast}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        medicines={medicines}
        onSelectMedicine={(item) => handleNavigateToForecast(item.medicine)}
      />

      <AlertDrawer
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
        alerts={alerts}
        onNavigateToForecast={handleNavigateToForecast}
      />
    </div>
  );
};

export default App;
