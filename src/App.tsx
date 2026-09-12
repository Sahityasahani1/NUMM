import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { TopAppBar } from './components/layout/TopAppBar';
import { SearchSpotlight } from './components/layout/SearchSpotlight';
import { ToastNotification } from './components/layout/ToastNotification';
import { EvidenceDrawer } from './components/layout/EvidenceDrawer';
import { ImpactModal } from './components/layout/ImpactModal';
import { DataUploadModal } from './components/common/DataUploadModal';

import { LandingPage } from './components/screens/LandingPage';
import { HomeScreen } from './components/screens/HomeScreen';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { HarmonizationScreen } from './components/screens/HarmonizationScreen';
import { ReviewQueueScreen } from './components/screens/ReviewQueueScreen';
import { MasterCatalogueScreen } from './components/screens/MasterCatalogueScreen';
import { MaterialDetailScreen } from './components/screens/MaterialDetailScreen';
import { RationalizationScreen } from './components/screens/RationalizationScreen';
import { DataHubScreen } from './components/screens/DataHubScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { GovernanceScreen } from './components/screens/GovernanceScreen';
import { ArbitrageScreen } from './components/screens/ArbitrageScreen';
import { SemanticManifoldScreen } from './components/screens/SemanticManifoldScreen';
import { SettingsScreen, SupportScreen } from './components/screens/SettingsScreen';
import { GridPattern } from './components/core/grid-pattern';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainApp: React.FC = () => {
  const { activeScreen, sidebarCollapsed } = useApp();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':         return <HomeScreen />;
      case 'dashboard':    return <OverviewScreen />;
      case 'harmonization':return <HarmonizationScreen />;
      case 'review':       return <ReviewQueueScreen />;
      case 'master':       return <MasterCatalogueScreen />;
      case 'detail':       return <MaterialDetailScreen />;
      case 'rationalization': return <RationalizationScreen />;
      case 'arbitrage':    return <ArbitrageScreen />;
      case 'manifold':     return <SemanticManifoldScreen />;
      case 'datahub':      return <DataHubScreen />;
      case 'analytics':    return <AnalyticsScreen />;
      case 'governance':   return <GovernanceScreen />;
      case 'settings':     return <SettingsScreen />;
      case 'support':      return <SupportScreen />;
      default:             return <OverviewScreen />;
    }
  };

  const sideW = sidebarCollapsed ? 64 : 240;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
    >
      <AppShell />

      <div
        className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-200 relative"
        style={{ marginLeft: `${sideW}px`, background: 'var(--bg)' }}
      >
        {/* Ambient Top Grid Pattern */}
        <GridPattern
          width={44}
          height={44}
          strokeDasharray="4 2"
          className="[mask-image:radial-gradient(ellipse_at_top,white_30%,transparent_75%)] opacity-40 pointer-events-none"
        />

        <TopAppBar />
        <div className="flex-1 flex flex-col overflow-hidden relative animate-fade-in z-10">
          <ErrorBoundary key={activeScreen} fallbackTitle={`Screen: ${activeScreen.toUpperCase()} view issue intercepted`}>
            {renderScreen()}
          </ErrorBoundary>
        </div>
      </div>

      {/* Global overlays */}
      <SearchSpotlight />
      <ToastNotification />
      <EvidenceDrawer />
      <ImpactModal />
      <DataUploadModal />
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { activeScreen } = useApp();

  // Landing page is full-screen — no sidebar or header
  if (activeScreen === 'landing') {
    return <LandingPage />;
  }

  return <MainApp />;
};

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary fallbackTitle="National Unified Material Master Root Anomaly">
        <MainLayout />
      </ErrorBoundary>
    </AppProvider>
  );
}
