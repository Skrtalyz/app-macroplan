
import React from 'react';
import { Home, List, Settings, PieChart } from 'lucide-react';
import { AppTab } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  t: any;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, t }) => {
  const navItems = [
    { id: AppTab.HOME, icon: Home, label: t.home },
    { id: AppTab.HISTORY, icon: List, label: t.history },
    { id: AppTab.DETAIL, icon: PieChart, label: t.details },
    { id: AppTab.SETTINGS, icon: Settings, label: t.settings }
  ];

  const getDisplayTab = (tab: AppTab) => {
    if ([AppTab.TERMS, AppTab.PRIVACY, AppTab.SUPPORT].includes(tab)) return AppTab.SETTINGS;
    return tab;
  };

  const currentPrimaryTab = getDisplayTab(activeTab);

  return (
    <div className="flex min-h-screen bg-transparent w-full relative overflow-x-hidden">
      <aside className="hidden lg:flex flex-col w-80 xl:w-96 liquid-glass fixed left-0 h-screen z-[60] border-r border-gray-100 dark:border-white/5 p-10 premium-shadow">
        <div className="mb-16 px-2 flex items-center space-x-5">
          <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shrink-0">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">MacroPlan</span>
          </div>
        </div>
        
        <nav className="flex flex-col space-y-3">
          {navItems.map((tab) => {
            const isActive = currentPrimaryTab === tab.id;
            const Icon = tab.icon;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-5 p-5 rounded-[28px] transition-all duration-300 ${isActive ? 'bg-brand-primary text-white shadow-2xl translate-x-2' : 'text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10'}`}
              >
                <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                <span className="font-bold text-lg tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-h-screen transition-all duration-300 lg:ml-80 xl:ml-96 pb-32 lg:pb-12">
        <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-20 max-w-[1600px] py-6 lg:py-12">
          {children}
        </div>
      </main>
      
      <nav className="fixed lg:hidden bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] liquid-glass px-8 z-50 rounded-t-[36px] premium-shadow safe-bottom flex items-center justify-around border-t border-white/20 pb-[calc(1rem + env(safe-area-inset-bottom))] pt-4">
        {navItems.map((tab) => {
          const isActive = currentPrimaryTab === tab.id;
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-1.5 transition-all duration-300 min-h-[44px] justify-center ${isActive ? 'text-brand-primary scale-110' : 'text-gray-400'}`}
            >
              <Icon size={22} strokeWidth={isActive ? 3 : 2} />
              <span className="text-[10px] font-black tracking-tight uppercase">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
