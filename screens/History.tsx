
import React, { useState } from 'react';
import { Calendar, Activity, Trash2, AlertTriangle } from 'lucide-react';
import { MealAnalysis, UserProfile } from '../types';
import { translations, formatWeight, formatNumber } from '../localization';

interface HistoryProps {
  user: UserProfile;
  analyses: MealAnalysis[];
  onSelectMeal: (meal: MealAnalysis) => void;
  onDeleteMeal: (mealId: string) => void;
}

const History: React.FC<HistoryProps> = ({ user, analyses, onSelectMeal, onDeleteMeal }) => {
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const t = translations[user.language];

  const sortedAnalyses = [...analyses].sort((a, b) => b.timestamp - a.timestamp);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMealToDelete(id);
  };

  const handleDelete = () => {
    if (mealToDelete) {
      onDeleteMeal(mealToDelete);
      setMealToDelete(null);
    }
  };

  return (
    <div className="w-full animate-fade-in space-y-6 md:space-y-8 pb-10 px-2 md:px-0">
      <header>
        <h1 className="text-3xl md:text-5xl font-black text-black dark:text-dark-text tracking-tighter leading-tight">{t.history_title}</h1>
      </header>

      {sortedAnalyses.length === 0 ? (
        <div className="w-full py-24 md:py-32 flex flex-col items-center justify-center liquid-glass rounded-[42px] border-2 border-dashed border-gray-200 dark:border-white/5">
          <p className="text-gray-500 dark:text-gray-400 font-black text-base md:text-xl tracking-tight">{t.no_records}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8">
          {sortedAnalyses.map((meal, idx) => (
            <div 
              key={meal.id} 
              onClick={() => onSelectMeal(meal)} 
              className="bg-white dark:bg-dark-card p-3 md:p-4 rounded-[32px] md:rounded-[42px] premium-shadow flex flex-col h-full border border-transparent hover:border-brand-primary/20 hover:-translate-y-1 transition-all cursor-pointer group animate-slide-up relative"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <button 
                onClick={(e) => confirmDelete(e, meal.id)}
                className="absolute top-6 left-6 z-10 p-2.5 bg-red-500/10 backdrop-blur-md rounded-xl md:rounded-2xl text-red-500 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all active:scale-90"
              >
                <Trash2 size={16} md:size={18} strokeWidth={2.5} />
              </button>

              <div className="w-full aspect-[4/3] rounded-[24px] md:rounded-[32px] overflow-hidden bg-gray-50 dark:bg-dark-elevated relative border border-gray-100 dark:border-white/5 mb-4 md:mb-6">
                <img src={meal.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute top-3 right-3 md:top-4 md:right-4 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md flex items-center space-x-1.5 md:space-x-2">
                   <Activity size={12} md:size={14} className={getHealthColor(meal.healthScore || 0)} strokeWidth={3} />
                   <span className={`text-[10px] md:text-sm font-black ${getHealthColor(meal.healthScore || 0)}`}>{meal.healthScore || 0}</span>
                </div>
              </div>
              
              <div className="px-1 md:px-2 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-1.5 md:mb-2">
                  <h3 className="font-black text-black dark:text-dark-text text-lg md:text-xl leading-tight truncate tracking-tighter flex-1">
                    {meal.userLabel || meal.name}
                  </h3>
                  <span className="text-brand-primary font-black text-sm md:text-base whitespace-nowrap">
                    {formatNumber(meal.calories, user.language)} kcal
                  </span>
                </div>
                
                <div className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest flex items-center mb-4 md:mb-6">
                  <Calendar size={10} md:size={12} className="mr-1.5" />
                  {new Date(meal.timestamp).toLocaleDateString(user.language, { day: 'numeric', month: 'short' })}
                </div>

                <div className="mt-auto grid grid-cols-3 gap-2 pt-4 md:pt-6 border-t border-gray-50 dark:border-white/5">
                  {[
                    { l: 'Prot', v: meal.macros.protein },
                    { l: 'Carb', v: meal.macros.carbs },
                    { l: 'Fat', v: meal.macros.fat }
                  ].map((m, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-[8px] md:text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-tighter mb-0.5 truncate">{m.l}</span>
                      <span className="text-[10px] md:text-sm font-black text-gray-800 dark:text-gray-200 truncate">{formatWeight(m.v, user.unit, user.language)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {mealToDelete && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-xs rounded-[36px] p-8 premium-shadow animate-scale-in border border-red-500/20">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-2">{t.delete_meal_confirm}</h2>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-xs mb-8 leading-relaxed">{t.delete_meal_desc}</p>
              <div className="flex flex-col w-full space-y-3">
                <button onClick={handleDelete} className="w-full bg-red-600 text-white py-4 rounded-xl font-black tracking-tight shadow-lg active:scale-95 transition-all">
                  {t.delete_action}
                </button>
                <button onClick={() => setMealToDelete(null)} className="w-full bg-gray-100 dark:bg-dark-elevated text-gray-500 py-4 rounded-xl font-black active:scale-95 transition-all">
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
