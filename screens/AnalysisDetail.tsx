import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, Bookmark, Trash2, Activity, Ruler } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MealAnalysis, UserProfile, FoodItem, Macros } from '../types.ts';
import { translations, formatWeight, formatNumber } from '../localization.ts';

interface AnalysisDetailProps {
  user: UserProfile;
  meal: MealAnalysis;
  onBack: () => void;
  onUpdateMeal: (mealId: string, updates: Partial<MealAnalysis>) => void;
  onDeleteMeal: (mealId: string) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10">
        <p className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-1">{payload[0].name}</p>
        <p className="font-black text-lg text-gray-900 dark:text-white">{payload[0].value}g</p>
      </div>
    );
  }
  return null;
};

const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ user, meal, onBack, onUpdateMeal, onDeleteMeal }) => {
  const [mealLabelInput, setMealLabelInput] = useState(meal?.userLabel || '');
  const [toast, setToast] = useState<string | null>(null);

  const currentLang = user?.language || 'pt-BR';
  const t = translations[currentLang] || translations['pt-BR'];

  useEffect(() => {
    if (meal) setMealLabelInput(meal.userLabel || '');
  }, [meal?.id, meal?.userLabel]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const currentMacros = useMemo((): Macros => {
    if (!meal) return { protein: 0, carbs: 0, fat: 0 };
    // Prioriza os macros calculados dos itens se existirem, senão usa os macros da análise
    const items = meal.items || [];
    if (items.length > 0) {
      return {
        protein: items.reduce((sum, i) => sum + (i.protein || 0), 0),
        carbs: items.reduce((sum, i) => sum + (i.carbs || 0), 0),
        fat: items.reduce((sum, i) => sum + (i.fat || 0), 0)
      };
    }
    return {
      protein: meal.macros?.protein || 0,
      carbs: meal.macros?.carbs || 0,
      fat: meal.macros?.fat || 0
    };
  }, [meal]);

  const chartData = useMemo(() => {
    const data = [
      { name: t.protein, value: currentMacros.protein || 0, color: '#2563EB' },
      { name: t.carbs, value: currentMacros.carbs || 0, color: '#3b82f6' },
      { name: t.fat, value: currentMacros.fat || 0, color: '#f59e0b' },
    ];
    const total = data.reduce((s, d) => s + d.value, 0);
    // Fallback para evitar crash do PieChart com valores zero ou NaN
    if (total === 0 || isNaN(total)) {
      return [{ name: 'N/A', value: 1, color: '#E5E7EB' }];
    }
    return data.filter(d => d.value > 0);
  }, [currentMacros, t]);

  if (!meal) return null;

  return (
    <div className="w-full animate-fade-in relative pb-20">
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[500] bg-brand-primary text-white px-8 py-4 rounded-full font-black shadow-2xl animate-slide-up flex items-center space-x-3">
          <CheckCircle2 size={20} />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8 lg:gap-16 items-start">
        {/* Lado Esquerdo: Imagem e Título */}
        <div className="w-full xl:w-[45%] xl:sticky xl:top-12 shrink-0">
          <div className="relative aspect-square md:aspect-[4/3] xl:aspect-[3/4] w-full overflow-hidden rounded-[42px] md:rounded-[56px] premium-shadow border border-white dark:border-white/5 bg-gray-100 dark:bg-black">
            <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
            <button 
              onClick={onBack} 
              className="absolute top-6 left-6 p-4 liquid-glass text-gray-900 dark:text-white rounded-[24px] hover:scale-110 active:scale-90 transition-all z-20 shadow-xl"
            >
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
          </div>
          <div className="mt-8 px-2">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
              {meal.userLabel || meal.name}
            </h1>
          </div>
        </div>

        {/* Lado Direito: Dados e Edição */}
        <div className="flex-1 space-y-8 w-full">
          {/* Nome da Refeição */}
          <section className="liquid-glass p-8 rounded-[42px] premium-shadow">
             <div className="flex items-center space-x-3 mb-6">
                <Bookmark size={20} className="text-brand-primary" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.meal_label}</h3>
             </div>
             <input 
                type="text" 
                value={mealLabelInput}
                onChange={(e) => {
                  setMealLabelInput(e.target.value);
                  onUpdateMeal(meal.id, { userLabel: e.target.value });
                }}
                placeholder={t.meal_name_placeholder}
                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 font-bold text-lg focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
             />
          </section>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="liquid-glass p-8 rounded-[42px] premium-shadow">
               <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.energy}</span>
               <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">{formatNumber(meal.calories || 0, user.language)}</span>
                  <span className="text-sm text-gray-400 font-bold uppercase">kcal</span>
               </div>
            </div>
            <div className="liquid-glass p-8 rounded-[42px] premium-shadow flex items-center justify-between">
              <div>
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.health_score}</span>
                <p className="text-xl font-black text-emerald-500 mt-1">{meal.healthScore || 0}/100</p>
              </div>
              <Activity size={32} className="text-emerald-500" />
            </div>
          </div>

          {/* Gráfico de Macros */}
          <div className="liquid-glass p-8 md:p-12 rounded-[42px] premium-shadow">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Macros</h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={chartData} 
                      cx="50%" cy="50%" 
                      innerRadius="65%" 
                      outerRadius="90%" 
                      paddingAngle={5} 
                      cornerRadius={8} 
                      dataKey="value" 
                      stroke="none"
                    >
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-3">
                {[
                  { name: t.protein, value: currentMacros.protein, color: 'bg-blue-600' },
                  { name: t.carbs, value: currentMacros.carbs, color: 'bg-blue-400' },
                  { name: t.fat, value: currentMacros.fat, color: 'bg-amber-500' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${m.color}`}></div>
                      <span className="text-sm font-bold text-gray-500">{m.name}</span>
                    </div>
                    <span className="font-black text-gray-900 dark:text-white">{formatWeight(m.value, user.unit, user.language)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Itens Identificados */}
          <div className="liquid-glass p-8 md:p-12 rounded-[42px] premium-shadow">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.identified_foods}</h3>
                <Trash2 
                  size={20} 
                  className="text-red-400 cursor-pointer hover:scale-110 transition-transform" 
                  onClick={() => {
                    if (window.confirm(t.delete_meal_confirm)) onDeleteMeal(meal.id);
                  }}
                />
             </div>
             <div className="space-y-4">
                {meal.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-white/50 dark:bg-white/5 rounded-[28px] border border-gray-50 dark:border-white/5">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-black text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{item.amount} • {item.calories} kcal</p>
                    </div>
                    <div className="flex items-center space-x-4">
                       <div className="text-right">
                          <p className="text-xs font-black text-brand-primary">{item.protein}g P</p>
                          <p className="text-[10px] font-bold text-gray-400">{item.carbs}g C • {item.fat}g G</p>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetail;