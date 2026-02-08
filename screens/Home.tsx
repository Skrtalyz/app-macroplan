
import React from 'react';
import { Plus, Activity, ChevronRight } from 'lucide-react';
import { MealAnalysis, UserProfile } from '../types';
import { translations, formatWeight } from '../localization';

interface HomeProps {
  user: UserProfile;
  analyses: MealAnalysis[];
  onAnalyzeClick: () => void;
  onSelectMeal: (meal: MealAnalysis) => void;
}

const Home: React.FC<HomeProps> = ({ user, analyses, onAnalyzeClick, onSelectMeal }) => {
  const t = translations[user.language];
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayMeals = analyses.filter(m => m.timestamp >= todayStart);
  
  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + m.macros.protein, 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + m.macros.carbs, 0);
  const totalFat = todayMeals.reduce((sum, m) => sum + m.macros.fat, 0);
  
  const avgHealthScore = todayMeals.length > 0 
    ? Math.round(todayMeals.reduce((sum, m) => sum + (m.healthScore || 0), 0) / todayMeals.length) 
    : 0;
  
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const progress = Math.min((totalCalories / user.dailyGoal) * 100, 100);

  return (
    <div className="w-full animate-fade-in space-y-8 md:space-y-12 pb-10">
      <header>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
          {t.greeting} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg font-bold mt-1">{t.ready}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="liquid-glass rounded-[42px] md:rounded-[56px] p-6 md:p-14 premium-shadow relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-primary/10 blur-[120px] rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-10">
                <div className="min-w-0">
                  <span className="text-gray-400 dark:text-gray-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">{t.consumed_today}</span>
                  <div className="flex items-baseline space-x-3 mt-2">
                    <span className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter truncate">
                      {totalCalories.toLocaleString()}
                    </span>
                    <span className="text-lg md:text-2xl text-gray-400 font-bold whitespace-nowrap">/ {user.dailyGoal}</span>
                  </div>
                </div>
                {todayMeals.length > 0 && (
                  <div className="flex flex-col sm:items-end">
                    <span className="text-gray-400 dark:text-gray-500 text-[9px] md:text-xs font-black uppercase tracking-[0.3em]">{t.avg_health}</span>
                    <div className={`flex items-center space-x-2 mt-2 ${getHealthColor(avgHealthScore)}`}>
                      <Activity size={24} md:size={32} strokeWidth={4} />
                      <span className="text-3xl md:text-5xl font-black tracking-tighter">{avgHealthScore}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full h-4 md:h-6 bg-gray-200 dark:bg-white/10 rounded-full mb-10 overflow-hidden border border-gray-100 dark:border-white/5">
                <div 
                  className="h-full bg-brand-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_var(--brand-shadow)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-8">
                {[
                  { label: t.protein, val: totalProtein, color: 'text-brand-primary' },
                  { label: 'Carbs', val: totalCarbs, color: 'text-blue-500' },
                  { label: t.fat, val: totalFat, color: 'text-amber-500' }
                ].map((macro, idx) => (
                  <div key={idx} className="bg-white/40 dark:bg-black/20 p-4 md:p-8 rounded-[24px] md:rounded-[36px] border border-white dark:border-white/5 flex flex-col">
                    <span className="text-[8px] md:text-xs text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-1 truncate">{macro.label}</span>
                    <span className={`font-black text-xs md:text-xl lg:text-2xl tracking-tighter ${macro.color}`}>
                      {formatWeight(macro.val, user.unit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={onAnalyzeClick} 
            className="w-full bg-brand-primary text-white py-6 md:py-12 rounded-[32px] md:rounded-[56px] font-black text-xl md:text-4xl shadow-2xl shadow-brand-primary/30 flex items-center justify-center space-x-4 active:scale-[0.98] transition-all group overflow-hidden"
          >
            <Plus size={24} md:size={40} strokeWidth={5} />
            <span className="tracking-tight">{t.analyze_meal}</span>
          </button>
        </div>

        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          <h2 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight px-4">{t.recent_uploads}</h2>
          <div className="space-y-4">
            {analyses.length === 0 ? (
              <div className="text-center py-24 liquid-glass rounded-[42px] border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center">
                <p className="text-gray-400 dark:text-gray-500 font-black text-sm md:text-lg">{t.no_meals}</p>
              </div>
            ) : (
              analyses.slice(0, 5).map((meal, idx) => (
                <div 
                  key={meal.id} 
                  onClick={() => onSelectMeal(meal)} 
                  className="liquid-glass p-4 md:p-6 rounded-[28px] md:rounded-[42px] flex items-center space-x-6 premium-shadow active:scale-[0.98] transition-all cursor-pointer group animate-slide-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <img src={meal.image} className="w-20 h-20 md:w-28 md:h-28 rounded-[24px] object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-gray-900 dark:text-white truncate text-base md:text-2xl tracking-tighter mb-1">{meal.userLabel || meal.name}</h3>
                    <div className="text-[10px] md:text-sm">
                      <span className="text-brand-primary uppercase tracking-widest font-black">{meal.calories} kcal</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
