
import React, { useState } from 'react';
import { Globe, Ruler, FileText, HelpCircle, ChevronRight, X, Sun, Moon, Monitor, Target, Trash2, AlertTriangle, Check } from 'lucide-react';
import { UserProfile, AppTab } from '../types';
import { translations } from '../localization';

interface SettingsProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onClearHistory: (type: 'today' | 'week' | 'all') => void;
  onNavigate: (tab: AppTab) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateProfile, onClearHistory, onNavigate }) => {
  const [modalType, setModalType] = useState<'language' | 'unit' | 'theme' | 'goal' | 'clear_menu' | null>(null);
  const [confirmClearType, setConfirmClearType] = useState<'today' | 'week' | 'all' | null>(null);
  const [goalInput, setGoalInput] = useState(user.dailyGoal.toString());
  const [goalError, setGoalError] = useState('');
  
  const t = translations[user.language];

  const sections = [
    {
      title: t.preferences,
      items: [
        { 
          icon: <Target size={18} />, 
          label: t.daily_goal, 
          value: `${user.dailyGoal} kcal`,
          onClick: () => { setGoalInput(user.dailyGoal.toString()); setGoalError(''); setModalType('goal'); }
        },
        { 
          icon: <Ruler size={18} />, 
          label: t.unit_measure, 
          value: user.unit === 'metric' ? t.metric : t.imperial,
          onClick: () => setModalType('unit')
        },
        { 
          icon: <Globe size={18} />, 
          label: t.language, 
          value: user.language === 'pt-BR' ? 'Português' : 'English',
          onClick: () => setModalType('language')
        },
      ]
    },
    {
      title: t.appearance,
      items: [
        {
          icon: user.theme === 'dark' ? <Moon size={18} /> : user.theme === 'light' ? <Sun size={18} /> : <Monitor size={18} />,
          label: t.theme,
          value: user.theme === 'light' ? t.theme_light : user.theme === 'dark' ? t.theme_dark : t.theme_system,
          onClick: () => setModalType('theme')
        }
      ]
    },
    {
      title: t.general,
      items: [
        { icon: <Trash2 size={18} className="text-red-400" />, label: t.clear_data, value: '', onClick: () => setModalType('clear_menu') },
        { icon: <FileText size={18} />, label: t.terms, value: '', onClick: () => onNavigate(AppTab.TERMS) },
        { icon: <FileText size={18} />, label: t.privacy, value: '', onClick: () => onNavigate(AppTab.PRIVACY) },
        { icon: <HelpCircle size={18} />, label: t.support, value: '', onClick: () => onNavigate(AppTab.SUPPORT) },
      ]
    }
  ];

  const handleSaveGoal = () => {
    const val = parseInt(goalInput);
    if (isNaN(val) || val < 1000 || val > 4500) {
      setGoalError(t.goal_range_error);
      return;
    }
    onUpdateProfile({ dailyGoal: val });
    setModalType(null);
  };

  const renderModal = () => {
    if (!modalType && !confirmClearType) return null;

    if (confirmClearType) {
      return (
        <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-xs rounded-[40px] p-8 premium-shadow border border-red-500/20">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle size={32} className="text-red-500 mb-6" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-2">{t.confirm_clear_title}</h2>
              <div className="flex flex-col w-full space-y-3">
                <button onClick={() => { onClearHistory(confirmClearType!); setConfirmClearType(null); setModalType(null); }} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all">{t.clear}</button>
                <button onClick={() => setConfirmClearType(null)} className="w-full bg-gray-100 dark:bg-dark-elevated text-gray-500 py-4 rounded-2xl font-black active:scale-95 transition-all">{t.cancel}</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    let title = '';
    let options: any[] = [];
    let currentVal = (user as any)[modalType!];
    
    if (modalType === 'language') {
      title = t.select_language;
      options = [{ label: 'Português (BR)', value: 'pt-BR' }, { label: 'English (US)', value: 'en-US' }];
    } else if (modalType === 'unit') {
      title = t.select_unit;
      options = [{ label: t.metric, value: 'metric' }, { label: t.imperial, value: 'imperial' }];
    } else if (modalType === 'theme') {
      title = t.select_appearance;
      options = [{ label: t.theme_light, value: 'light' }, { label: t.theme_dark, value: 'dark' }, { label: t.theme_system, value: 'system' }];
    } else if (modalType === 'clear_menu') {
      title = t.clear_data;
      options = [
        { label: t.clear_today, value: 'today', danger: true, onClick: () => setConfirmClearType('today') },
        { label: t.clear_all, value: 'all', danger: true, onClick: () => setConfirmClearType('all') }
      ];
    } else if (modalType === 'goal') {
      return (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-[40px] p-8 premium-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">{t.daily_goal}</h2>
              <button onClick={() => setModalType(null)} className="text-gray-400"><X size={20} /></button>
            </div>
            <input 
              type="number" 
              value={goalInput} 
              onChange={e => setGoalInput(e.target.value)} 
              className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-2xl p-4 font-black mb-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 outline-none" 
            />
            {goalError && <p className="text-[10px] text-red-500 font-bold mb-4 ml-2">{goalError}</p>}
            <button onClick={handleSaveGoal} className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black active:scale-95 transition-all shadow-lg shadow-brand-primary/20">{t.save}</button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-[40px] p-8 premium-shadow">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">{title}</h2>
            <button onClick={() => setModalType(null)} className="p-2 text-gray-400"><X size={20} /></button>
          </div>
          <div className="space-y-2">
            {options.map(opt => (
              <button 
                key={opt.value} 
                onClick={() => { if (opt.onClick) opt.onClick(); else { onUpdateProfile({ [modalType!]: opt.value }); setModalType(null); } }} 
                className={`w-full flex items-center justify-between p-5 rounded-[22px] border transition-all active:scale-[0.98] ${
                  currentVal === opt.value 
                    ? 'border-brand-primary bg-brand-primary/10' 
                    : 'border-gray-50 dark:border-white/5 hover:border-brand-primary/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`font-bold text-base ${opt.danger ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{opt.label}</span>
                </div>
                {currentVal === opt.value && <Check size={18} className="text-brand-primary" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-2xl mx-auto w-full animate-fade-in space-y-12 pb-20">
      <header>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">{t.config_title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg font-bold mt-1">{t.config_subtitle}</p>
      </header>

      <div className="space-y-12">
        {sections.map((section, idx) => (
          <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
            <h3 className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-4 ml-4">{section.title}</h3>
            <div className="bg-white dark:bg-dark-card rounded-[42px] premium-shadow border border-white dark:border-white/5 overflow-hidden">
              {section.items.map((item, i) => (
                <div 
                  key={i} 
                  onClick={item.onClick} 
                  className="flex items-center justify-between p-6 md:p-8 cursor-pointer group border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center space-x-5">
                    <div className="p-3 bg-gray-50 dark:bg-white/10 rounded-2xl text-gray-400 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-all">
                      {item.icon}
                    </div>
                    <span className="font-black text-sm md:text-lg tracking-tight text-gray-800 dark:text-gray-200">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs md:text-base font-bold text-gray-400 group-hover:text-brand-primary">{item.value}</span>
                    <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Versão do App - Rodapé Discreto */}
      <div className="mt-12 mb-8 text-center flex flex-col items-center opacity-60">
        <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary mb-3">
          <span className="font-black text-xs">M</span>
        </div>
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-relaxed">
          MacroPlan<br />
          Versão 0.1 (Beta)
        </p>
      </div>

      {renderModal()}
    </div>
  );
};

export default Settings;
