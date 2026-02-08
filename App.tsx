
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Home from './screens/Home';
import History from './screens/History';
import AnalysisDetail from './screens/AnalysisDetail';
import Settings from './screens/Settings';
import Legal from './screens/Legal';
import Support from './screens/Support';
import AnalysisFlow from './components/AnalysisFlow';
import { AppTab, MealAnalysis, UserProfile } from './types';
import { translations } from './localization';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [isAnalysisFlowOpen, setIsAnalysisFlowOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealAnalysis | null>(null);
  const [analyses, setAnalyses] = useState<MealAnalysis[]>([]);
  const [isAppReady, setIsAppReady] = useState(false);
  
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('macroplan_profile_v1');
    const defaultProfile: UserProfile = {
      name: 'Explorador',
      dailyGoal: 2200,
      unit: 'metric',
      language: 'pt-BR',
      theme: 'system'
    };
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const t = translations[user.language];

  // Gerenciamento de Tema (Modo Claro/Escuro)
  useEffect(() => {
    const root = window.document.documentElement;
    
    let actualTheme = user.theme;
    if (user.theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (actualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Cores Brand Fixas (Azul Real Premium)
    root.style.setProperty('--brand-primary-rgb', '37 99 235');
    root.style.setProperty('--brand-light-rgb', '59 130 246');
    root.style.setProperty('--brand-dark-rgb', '29 78 216');
    root.style.setProperty('--brand-shadow', 'rgba(37, 99, 235, 0.3)');
    
    setIsAppReady(true);
  }, [user.theme]);

  // Sincronização
  useEffect(() => {
    if (isAppReady) localStorage.setItem('macroplan_profile_v1', JSON.stringify(user));
  }, [user, isAppReady]);

  useEffect(() => {
    if (isAppReady) {
      const saved = localStorage.getItem('macroplan_history_v1');
      setAnalyses(saved ? JSON.parse(saved) : []);
    }
  }, [isAppReady]);

  const saveHistory = useCallback((items: MealAnalysis[]) => {
    localStorage.setItem('macroplan_history_v1', JSON.stringify(items));
    setAnalyses(items);
  }, []);

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const handleAnalysisComplete = (newAnalysis: MealAnalysis) => {
    const updated = [newAnalysis, ...analyses];
    saveHistory(updated);
    setIsAnalysisFlowOpen(false);
    setSelectedMeal(newAnalysis);
    setActiveTab(AppTab.DETAIL);
  };

  const handleUpdateMeal = (mealId: string, updates: Partial<MealAnalysis>) => {
    const updated = analyses.map(m => m.id === mealId ? { ...m, ...updates } : m);
    saveHistory(updated);
    if (selectedMeal?.id === mealId) {
      setSelectedMeal(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDeleteMeal = (mealId: string) => {
    const updated = analyses.filter(m => m.id !== mealId);
    saveHistory(updated);
    if (selectedMeal?.id === mealId) {
      setSelectedMeal(null);
      setActiveTab(AppTab.HISTORY);
    }
  };

  const handleClearHistory = (type: 'today' | 'week' | 'all') => {
    if (type === 'all') {
      saveHistory([]);
      return;
    }
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const updated = analyses.filter(m => type === 'today' ? m.timestamp < todayStart : true);
    saveHistory(updated);
  };

  if (!isAppReady) return null;

  const renderScreen = () => {
    switch (activeTab) {
      case AppTab.HOME:
        return <Home user={user} analyses={analyses} onAnalyzeClick={() => setIsAnalysisFlowOpen(true)} onSelectMeal={(m) => { setSelectedMeal(m); setActiveTab(AppTab.DETAIL); }} />;
      case AppTab.HISTORY:
        return <History user={user} analyses={analyses} onSelectMeal={(m) => { setSelectedMeal(m); setActiveTab(AppTab.DETAIL); }} onDeleteMeal={handleDeleteMeal} />;
      case AppTab.DETAIL:
        return <AnalysisDetail user={user} meal={selectedMeal} onBack={() => setActiveTab(AppTab.HISTORY)} onUpdateMeal={handleUpdateMeal} onDeleteMeal={handleDeleteMeal} />;
      case AppTab.SETTINGS:
        return <Settings user={user} onUpdateProfile={handleUpdateProfile} onClearHistory={handleClearHistory} onNavigate={setActiveTab} />;
      case AppTab.TERMS: 
        return <Legal user={user} type="terms" onBack={() => setActiveTab(AppTab.SETTINGS)} />;
      case AppTab.PRIVACY: 
        return <Legal user={user} type="privacy" onBack={() => setActiveTab(AppTab.SETTINGS)} />;
      case AppTab.SUPPORT: 
        return <Support user={user} onBack={() => setActiveTab(AppTab.SETTINGS)} />;
      default: 
        return <Home user={user} analyses={analyses} onAnalyzeClick={() => setIsAnalysisFlowOpen(true)} onSelectMeal={(m) => { setSelectedMeal(m); setActiveTab(AppTab.DETAIL); }} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent max-w-screen-xl mx-auto relative overflow-hidden">
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} t={t}>
        {renderScreen()}
      </Layout>
      {isAnalysisFlowOpen && (
        <AnalysisFlow 
          user={user} 
          onComplete={handleAnalysisComplete} 
          onCancel={() => setIsAnalysisFlowOpen(false)} 
          history={analyses} 
        />
      )}
    </div>
  );
};

export default App;
