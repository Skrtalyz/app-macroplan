
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Info, BrainCircuit, RotateCcw, Tag, Trash2, Plus, Minus, X, CheckCircle2, AlertTriangle, Search, Edit3, Bookmark, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MealAnalysis, UserProfile, FoodItem, Macros } from '../types';
import { translations, formatWeight, formatNumber } from '../localization';
import { estimateIngredientNutrition } from '../geminiService';

interface AnalysisDetailProps {
  user: UserProfile;
  meal: MealAnalysis | null;
  onBack: () => void;
  onUpdateMeal?: (id: string, updates: Partial<MealAnalysis>) => void;
  onDeleteMeal?: (mealId: string) => void;
}

const FOOD_DATABASE: Omit<FoodItem, 'amount'>[] = [
  { name: 'Arroz Branco Cozido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Arroz Integral Cozido', calories: 110, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: 'Feijão Carioca Cozido', calories: 76, protein: 4.8, carbs: 14, fat: 0.5 },
  { name: 'Feijão Preto Cozido', calories: 91, protein: 6, carbs: 14, fat: 0.5 },
  { name: 'Frango Grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Bife de Carne Bovina', calories: 250, protein: 26, carbs: 0, fat: 15 },
  { name: 'Ovo Frito', calories: 196, protein: 13, carbs: 1, fat: 15 },
  { name: 'Ovo Cozido', calories: 155, protein: 13, carbs: 1, fat: 11 },
  { name: 'Salada Verde', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  { name: 'Brócolis Cozido', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'Batata Doce Cozida', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Batata Inglesa Cozida', calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  { name: 'Macarrão ao Sugo', calories: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  { name: 'Tomate Fresco', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: 'Azeite de Oliva', calories: 884, protein: 0, carbs: 0, fat: 100 },
  { name: 'Manteiga', calories: 717, protein: 0.8, carbs: 0.1, fat: 81 },
  { name: 'Pão Francês', calories: 310, protein: 9, carbs: 58, fat: 3 },
  { name: 'Pão Integral', calories: 250, protein: 10, carbs: 45, fat: 4 },
  { name: 'Banana Nanica', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Maçã Fuji', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: 'Iogurte Natural', calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3 },
  { name: 'Queijo Muçarela', calories: 280, protein: 25, carbs: 2, fat: 20 },
  { name: 'Queijo Branco', calories: 240, protein: 18, carbs: 3, fat: 17 },
  { name: 'Leite Integral', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: 'Leite Desnatado', calories: 34, protein: 3.4, carbs: 5, fat: 0.1 },
  { name: 'Filé de Peixe Grelhado', calories: 116, protein: 20, carbs: 0, fat: 3.5 },
  { name: 'Suco de Laranja Natural', calories: 45, protein: 0.7, carbs: 10, fat: 0.2 },
  { name: 'Café sem Açúcar', calories: 2, protein: 0.1, carbs: 0, fat: 0 },
  { name: 'Tapioca Simples', calories: 130, protein: 0, carbs: 35, fat: 0 },
  { name: 'Cuscuz Nordestino', calories: 112, protein: 2.3, carbs: 25, fat: 0.2 },
  { name: 'Açaí Puro', calories: 60, protein: 0.8, carbs: 6, fat: 5 },
  { name: 'Granola', calories: 450, protein: 10, carbs: 65, fat: 15 },
  { name: 'Whey Protein', calories: 380, protein: 80, carbs: 5, fat: 4 },
  { name: 'Pasta de Amendoim', calories: 590, protein: 25, carbs: 20, fat: 50 },
  { name: 'Castanha do Pará', calories: 650, protein: 14, carbs: 12, fat: 66 },
  { name: 'Abacate', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: 'Laranja Pêra', calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { name: 'Morango', calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    if (payload[0].payload.isPlaceholder) return null;
    
    return (
      <div className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 animate-scale-in">
        <p className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-1">{payload[0].name}</p>
        <p className="font-black text-lg text-gray-900 dark:text-white">{payload[0].value}g</p>
      </div>
    );
  }
  return null;
};

const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ user, meal, onBack, onUpdateMeal, onDeleteMeal }) => {
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [tempItem, setTempItem] = useState<{ name: string, grams: number }>({ name: '', grams: 100 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [removedItems, setRemovedItems] = useState<FoodItem[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mealLabelInput, setMealLabelInput] = useState(meal?.userLabel || '');

  const t = translations[user.language];
  const quickMealOptions = [t.breakfast, t.lunch, t.dinner, t.snack, t.supper];

  useEffect(() => {
    if (meal) setMealLabelInput(meal.userLabel || '');
  }, [meal?.id, meal?.userLabel]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * FONTE ÚNICA DE VERDADE (SINGLE SOURCE OF TRUTH)
   * Recalcula os macronutrientes totais em tempo real baseando-se na lista de itens.
   * Se a lista estiver vazia (antes da análise ser carregada ou erro inesperado), 
   * recorre ao objeto de macros raiz da refeição.
   */
  const currentMacros = useMemo((): Macros => {
    if (!meal) return { protein: 0, carbs: 0, fat: 0 };
    
    // Se temos itens (da IA ou Manuais), eles são a autoridade máxima
    if (meal.items && meal.items.length > 0) {
      return {
        protein: parseFloat(meal.items.reduce((sum, item) => sum + (Number(item.protein) || 0), 0).toFixed(1)),
        carbs: parseFloat(meal.items.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0).toFixed(1)),
        fat: parseFloat(meal.items.reduce((sum, item) => sum + (Number(item.fat) || 0), 0).toFixed(1))
      };
    }

    // Fallback para macros da análise raiz se a lista de itens estiver falhando
    return {
      protein: Number(meal.macros.protein) || 0,
      carbs: Number(meal.macros.carbs) || 0,
      fat: Number(meal.macros.fat) || 0
    };
  }, [meal?.items, meal?.macros]);

  const chartData = useMemo(() => {
    const totals = currentMacros.protein + currentMacros.carbs + currentMacros.fat;
    
    if (totals === 0) {
      return [
        { name: 'Aguardando dados', value: 1, color: '#E5E7EB', isPlaceholder: true },
      ];
    }

    return [
      { name: t.protein, value: currentMacros.protein, color: '#2563EB' }, 
      { name: t.carbs, value: currentMacros.carbs, color: '#3b82f6' },   
      { name: t.fat, value: currentMacros.fat, color: '#f59e0b' },     
    ].filter(item => item.value > 0 || (totals === 0 && item.value === 0));
  }, [currentMacros, t]);

  const scoreInfo = useMemo(() => {
    const score = meal?.healthScore || 0;
    if (score >= 80) return { label: t.score_very_good, color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (score >= 60) return { label: t.score_good, color: 'text-emerald-400', bg: 'bg-emerald-400' };
    if (score >= 40) return { label: t.score_regular, color: 'text-amber-400', bg: 'bg-amber-400' };
    return { label: t.score_poor, color: 'text-red-400', bg: 'bg-red-400' };
  }, [meal?.healthScore, t]);

  if (!meal) return (
    <div className="p-10 text-center h-full flex flex-col items-center justify-center animate-fade-in">
      <Info size={56} className="text-gray-300 mb-6" />
      <p className="text-gray-400 font-black text-2xl tracking-tight">Nenhuma refeição selecionada</p>
    </div>
  );

  const parseGrams = (amount: string): number => {
    const match = amount.match(/(\d+)/);
    return match ? parseInt(match[1]) : 100;
  };

  const filteredSearch = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    if (!lowerQuery) return [];
    return FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(lowerQuery)).slice(0, 8);
  }, [searchQuery]);

  const recalculateTotals = (newItems: FoodItem[], resetToOriginal: boolean = false) => {
    const totalCalories = newItems.reduce((s, i) => s + (Number(i.calories) || 0), 0);
    const totalProtein = newItems.reduce((s, i) => s + (Number(i.protein) || 0), 0);
    const totalCarbs = newItems.reduce((s, i) => s + (Number(i.carbs) || 0), 0);
    const totalFat = newItems.reduce((s, i) => s + (Number(i.fat) || 0), 0);

    let scoreBase = 70;
    const totalMacros = totalProtein + totalCarbs + totalFat;
    if (totalMacros > 0) {
      const pRatio = totalProtein / totalMacros;
      const cRatio = totalCarbs / totalMacros;
      const fRatio = totalFat / totalMacros;
      const deviation = (Math.abs(pRatio - 0.25) + Math.abs(cRatio - 0.45) + Math.abs(fRatio - 0.30)) / 3;
      scoreBase = Math.round(100 - (deviation * 120));
    }

    if (onUpdateMeal) {
      onUpdateMeal(meal.id, {
        items: newItems,
        calories: Math.round(totalCalories),
        macros: { 
          protein: parseFloat(totalProtein.toFixed(1)), 
          carbs: parseFloat(totalCarbs.toFixed(1)), 
          fat: parseFloat(totalFat.toFixed(1)) 
        },
        healthScore: Math.min(100, Math.max(0, scoreBase)),
        isAdjusted: !resetToOriginal
      });
    }
  };

  const handleMealLabelChange = (val: string) => {
    setMealLabelInput(val);
    if (onUpdateMeal) onUpdateMeal(meal.id, { userLabel: val.trim() || undefined });
  };

  const handleOpenEdit = (index: number) => {
    const item = meal.items[index];
    setTempItem({ name: item.name, grams: parseGrams(item.amount) });
    setEditingItemIndex(index);
  };

  const handleSaveEdit = async () => {
    if (editingItemIndex === null) return;
    setIsEstimating(true);
    const dbMatch = FOOD_DATABASE.find(f => f.name.toLowerCase() === tempItem.name.toLowerCase());
    const reference = dbMatch || await estimateIngredientNutrition(tempItem.name);
    const multiplier = tempItem.grams / 100;
    const newItems = [...meal.items];
    newItems[editingItemIndex] = {
      name: tempItem.name,
      amount: `${tempItem.grams}g`,
      calories: Math.round(reference.calories * multiplier),
      protein: parseFloat((reference.protein * multiplier).toFixed(1)),
      carbs: parseFloat((reference.carbs * multiplier).toFixed(1)),
      fat: parseFloat((reference.fat * multiplier).toFixed(1)),
      confidence: 'high'
    };
    recalculateTotals(newItems);
    setEditingItemIndex(null);
    setIsEstimating(false);
    showToast(t.item_updated);
  };

  const handleAddIngredient = async () => {
    if (!tempItem.name.trim()) return;
    setIsEstimating(true);
    const dbMatch = FOOD_DATABASE.find(f => f.name.toLowerCase() === tempItem.name.toLowerCase());
    const reference = dbMatch || await estimateIngredientNutrition(tempItem.name);
    const multiplier = tempItem.grams / 100;
    const newItem: FoodItem = {
      name: tempItem.name.trim(),
      amount: `${tempItem.grams}g`,
      calories: Math.round(reference.calories * multiplier),
      protein: parseFloat((reference.protein * multiplier).toFixed(1)),
      carbs: parseFloat((reference.carbs * multiplier).toFixed(1)),
      fat: parseFloat((reference.fat * multiplier).toFixed(1)),
      confidence: 'high'
    };
    recalculateTotals([...meal.items, newItem]);
    setIsAddingIngredient(false);
    setIsEstimating(false);
    setTempItem({ name: '', grams: 100 });
    setSearchQuery('');
    showToast(t.item_added);
  };

  const handleRemoveItem = (index: number) => {
    const itemToRemove = meal.items[index];
    const newItems = meal.items.filter((_, i) => i !== index);
    setRemovedItems(prev => [itemToRemove, ...prev]);
    recalculateTotals(newItems);
    showToast(t.item_removed);
  };

  const handleResetAnalysis = () => {
    if (meal.aiOriginalItems?.length && window.confirm(t.confirm_reset)) {
      setRemovedItems([]);
      recalculateTotals(JSON.parse(JSON.stringify(meal.aiOriginalItems)), true);
      showToast(t.analysis_reset);
    }
  };

  const macroDisplayList = useMemo(() => [
    { name: t.protein, value: currentMacros.protein, color: '#2563EB' },
    { name: t.carbs, value: currentMacros.carbs, color: '#3b82f6' },
    { name: t.fat, value: currentMacros.fat, color: '#f59e0b' },
  ], [currentMacros, t]);

  return (
    <div className="w-full animate-fade-in relative lg:pb-10">
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[500] bg-brand-primary text-white px-8 py-4 rounded-full font-black shadow-2xl animate-slide-up flex items-center space-x-3">
          <CheckCircle2 size={20} />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8 lg:gap-16 items-start">
        <div className="w-full xl:w-[45%] xl:sticky xl:top-12 shrink-0">
          <div className="relative aspect-square lg:aspect-[4/5] xl:aspect-[3/4] xl:h-[calc(100vh-220px)] w-full overflow-hidden rounded-[42px] md:rounded-[56px] premium-shadow group border border-white dark:border-white/5 bg-gray-100 dark:bg-dark-elevated">
            <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms] ease-out" />
            <button onClick={onBack} className="absolute top-6 left-6 md:top-8 md:left-8 p-3 md:p-5 liquid-glass text-white rounded-[20px] md:rounded-[28px] hover:scale-110 active:scale-90 transition-all z-20 shadow-xl border-white/40">
              <ChevronLeft size={24} md:size={28} strokeWidth={4} />
            </button>
            <button onClick={() => setIsDeleting(true)} className="absolute top-6 right-6 md:top-8 md:right-8 p-3 md:p-5 bg-red-500/10 backdrop-blur-md text-red-500 rounded-[20px] md:rounded-[28px] hover:bg-red-500 hover:text-white transition-all active:scale-90 z-20 shadow-xl">
              <Trash2 size={24} md:size={28} strokeWidth={2.5} />
            </button>
          </div>

          <div className="mt-8 md:mt-12 px-2">
            <div className="flex items-center justify-between mb-4">
               <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-brand-primary text-white px-3 py-1.5 rounded-full text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl">Vision AI Analysed</span>
                  {meal.isAdjusted && <span className="bg-amber-500/80 text-white px-3 py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg"><CheckCircle2 size={12} className="mr-1.5" />{t.user_adjusted}</span>}
               </div>
               {meal.aiOriginalItems && (
                 <button onClick={handleResetAnalysis} className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-[16px] text-gray-500 dark:text-white hover:bg-brand-primary/10 hover:text-brand-primary transition-all flex items-center space-x-2 border border-transparent dark:border-white/10 shrink-0">
                   <RotateCcw size={14} strokeWidth={3} />
                   <span className="text-[8px] font-black uppercase tracking-widest hidden md:inline">{t.restore}</span>
                 </button>
               )}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tighter break-words drop-shadow-sm">
              {meal.userLabel || meal.name}
            </h1>
          </div>
        </div>

        <div className="flex-1 space-y-8 lg:space-y-16 w-full xl:py-4">
          <section className="liquid-glass p-6 md:p-14 rounded-[36px] md:rounded-[56px] premium-shadow border border-white/50 dark:border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 md:p-3 bg-brand-primary/10 rounded-xl text-brand-primary shrink-0">
                <Bookmark size={20} md:size={32} strokeWidth={3} />
              </div>
              <h3 className="text-[10px] md:text-base font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{t.meal_label}</h3>
            </div>
            <div className="space-y-5">
              <input 
                type="text" 
                value={mealLabelInput}
                onChange={(e) => handleMealLabelChange(e.target.value)}
                placeholder={t.meal_name_placeholder}
                className="w-full bg-white dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-[20px] px-6 py-4 font-bold text-base md:text-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
              <div className="flex flex-wrap gap-2">
                 {quickMealOptions.map(opt => (
                   <button 
                    key={opt}
                    onClick={() => handleMealLabelChange(opt)}
                    className={`px-4 py-2 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-tight transition-all ${mealLabelInput === opt ? 'bg-brand-primary text-white shadow-lg' : 'bg-white/40 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5'}`}
                   >
                     {opt}
                   </button>
                 ))}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
            <div className="liquid-glass p-6 md:p-14 rounded-[36px] md:rounded-[56px] premium-shadow border border-white/50 dark:border-white/10">
               <span className="text-gray-400 dark:text-gray-500 text-[9px] md:text-xs font-black uppercase tracking-[0.3em]">{t.energy}</span>
               <div className="flex items-baseline space-x-3 mt-2 md:mt-3">
                  <span className="text-4xl md:text-7xl xl:text-8xl font-black text-gray-900 dark:text-white tracking-tighter">{formatNumber(meal.calories, user.language)}</span>
                  <span className="text-sm md:text-2xl text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">kcal</span>
               </div>
            </div>
            <div className="liquid-glass p-6 md:p-14 rounded-[36px] md:rounded-[56px] premium-shadow flex items-center justify-between border border-white/50 dark:border-white/10">
              <div className="flex flex-col">
                <span className="text-gray-400 dark:text-gray-500 text-[9px] md:text-xs font-black uppercase tracking-[0.3em] mb-2">{t.health_score}</span>
                <span className={`text-lg md:text-3xl font-black ${scoreInfo.color} tracking-tight`}>{scoreInfo.label}</span>
              </div>
              <div className="relative w-20 h-20 md:w-32 md:h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-white/5" />
                  <circle cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={213} strokeDashoffset={213 - (213 * (meal.healthScore || 0)) / 100} strokeLinecap="round" className={`${scoreInfo.color} transition-all duration-[1500ms] ease-in-out`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-gray-900 dark:text-white text-xl md:text-4xl tracking-tighter">{meal.healthScore || 0}</div>
              </div>
            </div>
          </div>

          <section className="liquid-glass p-6 md:p-14 rounded-[36px] md:rounded-[56px] premium-shadow border border-white/50 dark:border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 md:p-3 bg-brand-primary/10 rounded-xl text-brand-primary shrink-0">
                  <Tag size={20} md:size={32} strokeWidth={3} />
                </div>
                <h3 className="text-[10px] md:text-base font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{t.identified_foods}</h3>
              </div>
              <button onClick={() => { setIsAddingIngredient(true); setTempItem({name: '', grams: 100}); setSearchQuery(''); }} className="flex items-center justify-center space-x-2 px-5 py-3 bg-brand-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/20 active:scale-95 transition-all">
                <Plus size={14} strokeWidth={4} />
                <span>{t.add_item}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8">
              {meal.items.map((item, idx) => (
                <div key={idx} className="flex flex-col p-5 md:p-8 bg-white/60 dark:bg-white/5 rounded-[28px] md:rounded-[42px] border border-white dark:border-white/10 group animate-slide-up hover:border-brand-primary/40 transition-all premium-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-base md:text-2xl font-black text-gray-900 dark:text-white truncate tracking-tight mb-1">{item.name}</p>
                      <p className="text-[9px] md:text-xs text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest leading-relaxed">
                        {item.amount} • <span className="text-brand-primary">{item.calories} kcal</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      <button onClick={() => handleOpenEdit(idx)} className="p-2.5 bg-gray-50 dark:bg-white/10 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-all">
                        <Edit3 size={16} md:size={22} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => handleRemoveItem(idx)} className="p-2.5 bg-red-50 dark:bg-red-950/20 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={16} md:size={22} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="liquid-glass p-6 md:p-16 rounded-[36px] md:rounded-[64px] premium-shadow border border-white/50 dark:border-white/10">
            <h3 className="text-[9px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-8 text-center xl:text-left">Macronutrients Profile</h3>
            <div className="flex flex-col xl:flex-row items-center justify-between gap-8 md:gap-16">
              <div className="w-48 h-48 md:w-80 md:h-80 min-h-[192px] md:min-h-[320px] relative flex items-center justify-center shrink-0 group">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={chartData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="60%" 
                      outerRadius="85%" 
                      paddingAngle={5} 
                      cornerRadius={12} 
                      dataKey="value" 
                      stroke="none"
                      animationDuration={1000}
                    >
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</span>
                  <span className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{formatWeight(currentMacros.protein + currentMacros.carbs + currentMacros.fat, user.unit, user.language)}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:flex xl:flex-col gap-3 w-full">
                {macroDisplayList.map((macro, idx) => (
                  <div key={idx} className="flex flex-col sm:items-center xl:flex-row xl:items-center xl:justify-between p-5 md:p-8 bg-white/50 dark:bg-black/30 rounded-[28px] md:rounded-[42px] border border-white dark:border-white/5">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <div className="w-3 h-3 md:w-4.5 md:h-4.5 rounded-full shadow-lg" style={{ backgroundColor: macro.color }}></div>
                      <span className="text-[9px] md:text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{macro.name}</span>
                    </div>
                    <span className="text-lg md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{formatWeight(macro.value, user.unit, user.language)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section className="bg-brand-primary rounded-[36px] md:rounded-[64px] p-8 md:p-20 text-white shadow-3xl shadow-brand-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center space-x-4 md:space-x-8 mb-6 md:mb-12">
              <div className="p-3 md:p-4 bg-white/20 rounded-xl md:rounded-[28px] shadow-xl">
                 <BrainCircuit size={24} md:size={48} className="text-white" strokeWidth={3} />
              </div>
              <h3 className="text-[9px] md:text-xs font-black text-white/70 uppercase tracking-[0.4em]">{t.observation}</h3>
            </div>
            <p className="text-xl md:text-5xl xl:text-6xl leading-[1.15] font-black italic tracking-tighter drop-shadow-lg relative z-10">"{meal.observation}"</p>
          </section>
        </div>
      </div>

      {(editingItemIndex !== null || isAddingIngredient) && (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-3xl flex items-end md:items-center justify-center p-4">
           <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-t-[36px] md:rounded-[56px] p-6 md:p-12 pb-32 md:pb-12 shadow-3xl border border-white/10 animate-slide-up">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 dark:text-white">{isAddingIngredient ? t.add_item : t.edit_item}</h2>
                <button onClick={() => { setEditingItemIndex(null); setIsAddingIngredient(false); setSearchQuery(''); setIsEstimating(false); }} className="p-2.5 bg-gray-50 dark:bg-white/10 rounded-xl text-gray-500"><X size={18} /></button>
              </div>
              <div className="space-y-6">
                {isAddingIngredient && (
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">{t.search_food}</label>
                    <div className="relative group">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.search_food}
                        className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-2xl pl-12 pr-4 py-3.5 font-bold outline-none text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filteredSearch.map(f => (
                        <button key={f.name} onClick={() => { setTempItem({ ...tempItem, name: f.name }); setSearchQuery(''); }} className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase">
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">{t.item_name}</label>
                   <input 
                    type="text" 
                    value={tempItem.name}
                    onChange={(e) => setTempItem({...tempItem, name: e.target.value})}
                    placeholder={t.item_name}
                    className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-3.5 font-black outline-none text-gray-900 dark:text-white"
                   />
                </div>
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2 text-center block">{t.item_amount}</label>
                   <div className="flex items-center justify-center space-x-6 md:space-x-8">
                      <button onClick={() => setTempItem({ ...tempItem, grams: Math.max(5, tempItem.grams - 10)})} className="w-12 h-12 bg-gray-100 dark:bg-dark-elevated rounded-xl flex items-center justify-center active:scale-90"><Minus size={20} /></button>
                      <div className="text-center min-w-[100px]">
                        <p className="text-4xl md:text-6xl font-black tracking-tighter tabular-nums text-gray-900 dark:text-white">{tempItem.grams}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">{t.grams}</p>
                      </div>
                      <button onClick={() => setTempItem({ ...tempItem, grams: Math.min(2500, tempItem.grams + 10)})} className="w-12 h-12 bg-gray-100 dark:bg-dark-elevated rounded-xl flex items-center justify-center active:scale-90"><Plus size={20} /></button>
                   </div>
                </div>
                <button 
                  onClick={isAddingIngredient ? handleAddIngredient : handleSaveEdit} 
                  disabled={!tempItem.name || isEstimating} 
                  className="w-full bg-brand-primary text-white py-4 md:py-6 rounded-3xl font-black text-lg md:text-xl shadow-3xl shadow-brand-primary/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
                >
                  {isEstimating ? <Loader2 className="animate-spin" size={24} /> : <span>{t.save}</span>}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDetail;
