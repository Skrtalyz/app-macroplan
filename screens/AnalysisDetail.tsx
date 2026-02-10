
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, BrainCircuit, RotateCcw, Tag, Trash2, Plus, Minus, X, CheckCircle2, Search, Edit3, Bookmark, Loader2, Scale } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MealAnalysis, UserProfile, FoodItem, Macros } from '../types';
import { translations, formatWeight, formatNumber } from '../localization';

// Base de dados determinística expandida (Valores por 100g)
const FOOD_DATABASE: Omit<FoodItem, 'amount' | 'confidence'>[] = [
  // Proteínas
  { name: 'Frango Grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Frango Cozido', calories: 150, protein: 28, carbs: 0, fat: 4 },
  { name: 'Peito de Frango Assado', calories: 195, protein: 30, carbs: 0, fat: 7.7 },
  { name: 'Bife de Carne Bovina (Patinho)', calories: 220, protein: 32, carbs: 0, fat: 9 },
  { name: 'Carne Moída (Acém)', calories: 212, protein: 26, carbs: 0, fat: 12 },
  { name: 'Picanha Grelhada', calories: 238, protein: 24, carbs: 0, fat: 15 },
  { name: 'Ovo Cozido', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: 'Ovo Frito', calories: 196, protein: 13, carbs: 0.8, fat: 15 },
  { name: 'Omelete Simples', calories: 154, protein: 11, carbs: 0.6, fat: 12 },
  { name: 'Salmão Grelhado', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Tilápia Grelhada', calories: 128, protein: 26, carbs: 0, fat: 2.7 },
  { name: 'Atum Enlatado (Água)', calories: 116, protein: 26, carbs: 0, fat: 0.8 },
  { name: 'Camarão Cozido', calories: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  { name: 'Whey Protein (Pó)', calories: 380, protein: 80, carbs: 5, fat: 4 },

  // Carboidratos e Grãos
  { name: 'Arroz Branco Cozido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Arroz Integral Cozido', calories: 110, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: 'Feijão Carioca Cozido', calories: 76, protein: 4.8, carbs: 14, fat: 0.5 },
  { name: 'Feijão Preto Cozido', calories: 91, protein: 6, carbs: 14, fat: 0.5 },
  { name: 'Grão de Bico Cozido', calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  { name: 'Lentilha Cozida', calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: 'Macarrão Cozido', calories: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  { name: 'Macarrão Integral Cozido', calories: 124, protein: 5.3, carbs: 25, fat: 1.1 },
  { name: 'Batata Doce Cozida', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Batata Inglesa Cozida', calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  { name: 'Purê de Batata', calories: 113, protein: 2, carbs: 15, fat: 4.2 },
  { name: 'Mandioca Cozida', calories: 160, protein: 1.4, carbs: 38, fat: 0.3 },
  { name: 'Cuscuz de Milho', calories: 112, protein: 2.3, carbs: 25, fat: 0.2 },
  { name: 'Tapioca (Goma)', calories: 240, protein: 0, carbs: 60, fat: 0 },
  { name: 'Aveia em Flocos', calories: 389, protein: 17, carbs: 66, fat: 7 },
  { name: 'Pão Francês', calories: 310, protein: 9, carbs: 58, fat: 3 },
  { name: 'Pão de Forma Integral', calories: 250, protein: 10, carbs: 45, fat: 4 },
  { name: 'Pão de Queijo', calories: 360, protein: 10, carbs: 40, fat: 18 },

  // Vegetais e Legumes
  { name: 'Alface Americana', calories: 14, protein: 0.9, carbs: 2.9, fat: 0.1 },
  { name: 'Brócolis Cozido', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4 },
  { name: 'Cenoura Crua', calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: 'Cenoura Cozida', calories: 35, protein: 0.8, carbs: 8, fat: 0.2 },
  { name: 'Tomate Cereja', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: 'Pepino', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { name: 'Abobrinha Cozida', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  { name: 'Espinafre Cozido', calories: 23, protein: 3, carbs: 3.6, fat: 0.4 },
  { name: 'Couve Refogada', calories: 90, protein: 3, carbs: 10, fat: 5 },
  { name: 'Berinjela Grelhada', calories: 35, protein: 1, carbs: 8, fat: 0.2 },
  { name: 'Chuchu Cozido', calories: 19, protein: 0.7, carbs: 4.5, fat: 0.1 },
  { name: 'Abóbora Cozida', calories: 26, protein: 1, carbs: 6.5, fat: 0.1 },

  // Frutas
  { name: 'Banana Nanica', calories: 92, protein: 1.1, carbs: 24, fat: 0.3 },
  { name: 'Banana Prata', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Maçã com Casca', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: 'Mamão Papaia', calories: 43, protein: 0.5, carbs: 11, fat: 0.3 },
  { name: 'Abacate', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: 'Morango', calories: 33, protein: 0.7, carbs: 8, fat: 0.3 },
  { name: 'Uva Italiana', calories: 67, protein: 0.6, carbs: 18, fat: 0.4 },
  { name: 'Laranja Pêra', calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { name: 'Abacaxi', calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  { name: 'Melancia', calories: 30, protein: 0.6, carbs: 7.5, fat: 0.2 },
  { name: 'Manga Palmer', calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },

  // Laticínios e Outros
  { name: 'Leite Integral', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: 'Leite Desnatado', calories: 35, protein: 3.4, carbs: 5, fat: 0.1 },
  { name: 'Queijo Muçarela', calories: 280, protein: 25, carbs: 2.4, fat: 20 },
  { name: 'Queijo Minas Frescal', calories: 243, protein: 17, carbs: 3.2, fat: 18 },
  { name: 'Iogurte Natural', calories: 63, protein: 3.5, carbs: 5, fat: 3.5 },
  { name: 'Manteiga com Sal', calories: 717, protein: 0.8, carbs: 0.1, fat: 81 },
  { name: 'Azeite de Oliva', calories: 884, protein: 0, carbs: 0, fat: 100 },
  { name: 'Pasta de Amendoim', calories: 588, protein: 25, carbs: 20, fat: 50 },
  { name: 'Castanha do Pará', calories: 659, protein: 14, carbs: 12, fat: 66 },
  { name: 'Café sem Açúcar', calories: 2, protein: 0.1, carbs: 0, fat: 0 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    if (payload[0].payload.isPlaceholder) return null;
    return (
      <div className="bg-white dark:bg-dark-elevated p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 animate-scale-in">
        <p className="font-black text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">{payload[0].name}</p>
        <p className="font-black text-lg text-gray-900 dark:text-white">{payload[0].value}g</p>
      </div>
    );
  }
  return null;
};

interface AnalysisDetailProps {
  user: UserProfile;
  meal: MealAnalysis | null;
  onBack: () => void;
  onUpdateMeal: (mealId: string, updates: Partial<MealAnalysis>) => void;
  onDeleteMeal: (mealId: string) => void;
}

const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ user, meal, onBack, onUpdateMeal, onDeleteMeal }) => {
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [tempItem, setTempItem] = useState<{ name: string, grams: number, macros: Omit<FoodItem, 'name' | 'amount' | 'confidence'> | null }>({ name: '', grams: 100, macros: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [mealLabelInput, setMealLabelInput] = useState(meal?.userLabel || '');

  const t = translations[user.language];

  useEffect(() => {
    if (meal) setMealLabelInput(meal.userLabel || '');
  }, [meal?.id, meal?.userLabel]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const parseGrams = (amount: string): number => {
    const match = amount.match(/(\d+)/);
    return match ? parseInt(match[1]) : 100;
  };

  const totalGrams = useMemo(() => {
    if (!meal) return 0;
    return meal.items.reduce((sum, item) => sum + parseGrams(item.amount), 0);
  }, [meal?.items]);

  const currentMacros = useMemo((): Macros => {
    if (!meal) return { protein: 0, carbs: 0, fat: 0 };
    return {
      protein: parseFloat(meal.items.reduce((sum, item) => sum + (Number(item.protein) || 0), 0).toFixed(1)),
      carbs: parseFloat(meal.items.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0).toFixed(1)),
      fat: parseFloat(meal.items.reduce((sum, item) => sum + (Number(item.fat) || 0), 0).toFixed(1))
    };
  }, [meal?.items]);

  const chartData = useMemo(() => {
    const totals = currentMacros.protein + currentMacros.carbs + currentMacros.fat;
    if (totals === 0) return [{ name: 'Aguardando dados', value: 1, color: '#E5E7EB', isPlaceholder: true }];
    return [
      { name: t.protein, value: currentMacros.protein, color: '#3B82F6' }, // Neon Blue
      { name: t.carbs, value: currentMacros.carbs, color: '#1E40AF' },   // Dark Steel Blue
      { name: t.fat, value: currentMacros.fat, color: '#F59E0B' },     
    ].filter(item => item.value > 0);
  }, [currentMacros, t]);

  const filteredSearch = useMemo(() => {
    const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (!q) return [];
    return FOOD_DATABASE.filter(f => 
      f.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
    ).slice(0, 6);
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

    if (onUpdateMeal && meal) {
      onUpdateMeal(meal.id, {
        items: newItems,
        calories: Math.round(totalCalories),
        macros: { protein: totalProtein, carbs: totalCarbs, fat: totalFat },
        healthScore: Math.min(100, Math.max(0, scoreBase)),
        isAdjusted: !resetToOriginal
      });
    }
  };

  const handleSelectSuggestion = (food: Omit<FoodItem, 'amount' | 'confidence'>) => {
    setTempItem({ 
      name: food.name, 
      grams: 100, 
      macros: { calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat } 
    });
    setSearchQuery('');
  };

  const handleSaveEdit = () => {
    if (editingItemIndex === null || !meal || !tempItem.macros) return;
    const multiplier = tempItem.grams / 100;
    const newItems = [...meal.items];
    newItems[editingItemIndex] = {
      name: tempItem.name,
      amount: `${tempItem.grams}g`,
      calories: Math.round(tempItem.macros.calories * multiplier),
      protein: parseFloat((tempItem.macros.protein * multiplier).toFixed(1)),
      carbs: parseFloat((tempItem.macros.carbs * multiplier).toFixed(1)),
      fat: parseFloat((tempItem.macros.fat * multiplier).toFixed(1)),
      confidence: 'high'
    };
    recalculateTotals(newItems);
    setEditingItemIndex(null);
    showToast(t.item_updated);
  };

  const handleAddIngredient = () => {
    if (!tempItem.name || !meal || !tempItem.macros) return;
    const multiplier = tempItem.grams / 100;
    const newItem: FoodItem = {
      name: tempItem.name,
      amount: `${tempItem.grams}g`,
      calories: Math.round(tempItem.macros.calories * multiplier),
      protein: parseFloat((tempItem.macros.protein * multiplier).toFixed(1)),
      carbs: parseFloat((tempItem.macros.carbs * multiplier).toFixed(1)),
      fat: parseFloat((tempItem.macros.fat * multiplier).toFixed(1)),
      confidence: 'high'
    };
    recalculateTotals([...meal.items, newItem]);
    setIsAddingIngredient(false);
    setTempItem({ name: '', grams: 100, macros: null });
    showToast(t.item_added);
  };

  const handleRemoveItem = (index: number) => {
    if (!meal) return;
    const newItems = meal.items.filter((_, i) => i !== index);
    recalculateTotals(newItems);
    showToast(t.item_removed);
  };

  if (!meal) return null;

  return (
    <div className="w-full animate-fade-in relative lg:pb-10">
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[500] bg-brand-primary text-white px-8 py-4 rounded-full font-black shadow-2xl animate-slide-up flex items-center space-x-3 btn-glow">
          <CheckCircle2 size={20} />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8 lg:gap-16 items-start">
        <div className="w-full xl:w-[45%] xl:sticky xl:top-12 shrink-0">
          <div className="relative aspect-square lg:aspect-[4/5] xl:aspect-[3/4] xl:h-[calc(100vh-220px)] w-full overflow-hidden rounded-[42px] md:rounded-[56px] premium-shadow group border border-white dark:border-white/5 bg-gray-100 dark:bg-dark-card">
            <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms] ease-out" />
            <button onClick={onBack} className="absolute top-6 left-6 md:top-8 md:left-8 p-3 md:p-5 liquid-glass text-white rounded-[20px] md:rounded-[28px] hover:scale-110 active:scale-90 transition-all z-20 shadow-xl border-white/40 min-w-[56px] min-h-[56px] flex items-center justify-center">
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" strokeWidth={4} />
            </button>
            <button onClick={() => onDeleteMeal(meal.id)} className="absolute top-6 right-6 md:top-8 md:right-8 p-3 md:p-5 bg-red-500/10 backdrop-blur-md text-red-500 rounded-[20px] md:rounded-[28px] hover:bg-red-500 hover:text-white transition-all active:scale-90 z-20 shadow-xl min-w-[56px] min-h-[56px] flex items-center justify-center">
              <Trash2 className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
            </button>
          </div>

          <div className="mt-8 md:mt-12 px-2">
            <div className="flex items-center justify-between mb-4">
               <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-brand-primary text-white px-3 py-1.5 rounded-full text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl btn-glow">Vision AI Analysed</span>
                  {meal.isAdjusted && <span className="bg-amber-500/80 text-white px-3 py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg"><CheckCircle2 size={12} className="mr-1.5" />{t.user_adjusted}</span>}
               </div>
               {meal.aiOriginalItems && (
                 <button onClick={() => recalculateTotals(JSON.parse(JSON.stringify(meal.aiOriginalItems)), true)} className="p-2.5 bg-gray-100 dark:bg-white/5 rounded-[16px] text-gray-500 dark:text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-all flex items-center space-x-2 border border-transparent dark:border-white/10 shrink-0 min-w-[44px] min-h-[44px] justify-center">
                   <RotateCcw size={14} strokeWidth={3} />
                   <span className="text-[8px] font-black uppercase tracking-widest hidden md:inline">{t.restore}</span>
                 </button>
               )}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-dark-text leading-[1.1] tracking-tighter break-words drop-shadow-sm">
              {meal.userLabel || meal.name}
            </h1>
          </div>
        </div>

        <div className="flex-1 space-y-8 lg:space-y-16 w-full xl:py-4">
          <section className="liquid-glass p-6 md:p-14 rounded-[36px] md:rounded-[56px] premium-shadow border border-white/50 dark:border-white/5">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 md:p-3 bg-brand-primary/10 rounded-xl text-brand-primary shrink-0">
                <Bookmark className="w-5 h-5 md:w-8 md:h-8" strokeWidth={3} />
              </div>
              <h3 className="text-[10px] md:text-base font-black text-gray-900 dark:text-dark-text uppercase tracking-[0.2em]">{t.meal_label}</h3>
            </div>
            <div className="space-y-5">
              <input 
                type="text" 
                value={mealLabelInput}
                onChange={(e) => { setMealLabelInput(e.target.value); onUpdateMeal(meal.id, { userLabel: e.target.value }); }}
                placeholder={t.meal_name_placeholder}
                className="w-full bg-white dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-[20px] px-6 py-4 font-bold text-base md:text-xl text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-dark-secondary"
              />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
            <div className="liquid-glass p-6 md:p-14 rounded-[36px] md:rounded-[56px] premium-shadow border border-white/50 dark:border-white/5">
               <span className="text-gray-400 dark:text-dark-secondary text-[9px] md:text-xs font-black uppercase tracking-[0.3em]">{t.energy}</span>
               <div className="flex items-baseline space-x-3 mt-2 md:mt-3">
                  <span className="text-4xl md:text-7xl xl:text-8xl font-black text-gray-900 dark:text-dark-text tracking-tighter">{formatNumber(meal.calories, user.language)}</span>
                  <span className="text-sm md:text-2xl text-gray-400 dark:text-dark-secondary font-black uppercase tracking-widest">kcal</span>
               </div>
            </div>
            <div className="liquid-glass p-6 md:p-14 rounded-[36px] md:rounded-[56px] premium-shadow flex items-center justify-between border border-white/50 dark:border-white/5">
              <div className="flex flex-col">
                <span className="text-gray-400 dark:text-dark-secondary text-[9px] md:text-xs font-black uppercase tracking-[0.3em] mb-2">{t.health_score}</span>
                <span className="text-lg md:text-3xl font-black text-brand-primary tracking-tight">{meal.healthScore || 0} Points</span>
              </div>
              <div className="relative w-20 h-20 md:w-32 md:h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-white/5" />
                  <circle cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={213} strokeDashoffset={213 - (213 * (meal.healthScore || 0)) / 100} strokeLinecap="round" className="text-brand-primary transition-all duration-[1500ms]" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-gray-900 dark:text-dark-text text-xl md:text-4xl">{meal.healthScore || 0}</div>
              </div>
            </div>
          </div>

          <section className="liquid-glass p-6 md:p-14 rounded-[36px] md:rounded-[56px] premium-shadow border border-white/50 dark:border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 md:p-3 bg-brand-primary/10 rounded-xl text-brand-primary shrink-0">
                  <Tag className="w-5 h-5 md:w-8 md:h-8" strokeWidth={3} />
                </div>
                <h3 className="text-[10px] md:text-base font-black text-gray-900 dark:text-dark-text uppercase tracking-[0.2em]">{t.identified_foods}</h3>
              </div>
              <button onClick={() => { setIsAddingIngredient(true); setTempItem({name: '', grams: 100, macros: null}); setSearchQuery(''); }} className="flex items-center justify-center space-x-2 px-6 py-4 bg-brand-primary text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-primary/20 active:scale-95 transition-all btn-glow min-h-[48px]">
                <Plus size={16} strokeWidth={4} />
                <span>{t.add_item}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {meal.items.map((item, idx) => (
                <div key={idx} className="flex flex-col p-6 md:p-10 bg-white/60 dark:bg-white/5 rounded-[32px] md:rounded-[48px] border border-white dark:border-white/10 group animate-slide-up hover:border-brand-primary/40 transition-all premium-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-lg md:text-2xl font-black text-gray-900 dark:text-dark-text truncate tracking-tight mb-1">{item.name}</p>
                      <p className="text-[10px] md:text-sm text-gray-400 dark:text-dark-secondary font-black uppercase tracking-widest">
                        {item.amount} • <span className="text-brand-primary">{item.calories} kcal</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => {
                        const foodRef = FOOD_DATABASE.find(f => f.name === item.name);
                        setTempItem({ 
                          name: item.name, 
                          grams: parseGrams(item.amount), 
                          macros: foodRef || { calories: item.calories / (parseGrams(item.amount)/100), protein: item.protein / (parseGrams(item.amount)/100), carbs: item.carbs / (parseGrams(item.amount)/100), fat: item.fat / (parseGrams(item.amount)/100) } 
                        });
                        setEditingItemIndex(idx);
                      }} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-400 hover:text-brand-primary transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Edit3 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                      <button onClick={() => handleRemoveItem(idx)} className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="liquid-glass p-6 md:p-16 rounded-[36px] md:rounded-[64px] premium-shadow border border-white/50 dark:border-white/5">
            <h3 className="text-[9px] md:text-xs font-black text-gray-400 dark:text-dark-secondary uppercase tracking-[0.3em] mb-8 text-center xl:text-left">Macronutrients Profile</h3>
            <div className="flex flex-col xl:flex-row items-center justify-between gap-8 md:gap-16">
              <div className="w-48 h-48 md:w-80 md:h-80 min-h-[192px] md:min-h-[320px] relative flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius="65%" outerRadius="85%" paddingAngle={5} cornerRadius={12} dataKey="value" stroke="none">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100, outline: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                   <p className="text-4xl md:text-6xl font-black text-gray-900 dark:text-dark-text tracking-tighter">
                     {formatWeight(totalGrams, user.unit, user.language).replace('g', '').replace('oz', '').trim()}
                   </p>
                   <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.3em] -mt-1">{user.unit === 'metric' ? 'g' : 'oz'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:flex xl:flex-col gap-4 w-full">
                {[
                  { name: t.protein, value: currentMacros.protein, color: '#3B82F6' },
                  { name: t.carbs, value: currentMacros.carbs, color: '#1E40AF' },
                  { name: t.fat, value: currentMacros.fat, color: '#F59E0B' },
                ].map((macro, idx) => (
                  <div key={idx} className="flex flex-col sm:items-center xl:flex-row xl:items-center xl:justify-between p-6 md:p-10 bg-white/50 dark:bg-black/30 rounded-[32px] md:rounded-[48px] border border-white dark:border-white/5">
                    <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                      <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: macro.color }}></div>
                      <span className="text-[10px] md:text-sm font-black text-gray-400 dark:text-dark-secondary uppercase tracking-widest">{macro.name}</span>
                    </div>
                    <span className="text-xl md:text-4xl font-black text-gray-900 dark:text-dark-text tracking-tighter">{formatWeight(macro.value, user.unit, user.language)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {(editingItemIndex !== null || isAddingIngredient) && (
        <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-3xl flex items-end md:items-center justify-center p-4">
           <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-t-[42px] md:rounded-[56px] p-8 md:p-14 pb-[calc(2.5rem + env(safe-area-inset-bottom))] md:pb-14 shadow-3xl border border-white/10 animate-slide-up">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-dark-text">{isAddingIngredient ? t.add_item : t.edit_item}</h2>
                <button onClick={() => { setEditingItemIndex(null); setIsAddingIngredient(false); setSearchQuery(''); }} className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-500 min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={24} /></button>
              </div>

              <div className="space-y-8">
                {isAddingIngredient && !tempItem.macros && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.search_food}
                        autoFocus
                        className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-[24px] pl-14 pr-6 py-5 font-bold outline-none text-gray-900 dark:text-dark-text text-lg"
                      />
                    </div>
                    {filteredSearch.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                        {filteredSearch.map((food, i) => (
                          <button key={i} onClick={() => handleSelectSuggestion(food)} className="flex items-center justify-between p-5 bg-gray-50/50 dark:bg-white/5 rounded-2xl hover:bg-brand-primary/10 hover:border-brand-primary/30 border border-transparent transition-all min-h-[60px]">
                            <span className="font-black text-gray-800 dark:text-white">{food.name}</span>
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{food.calories} kcal / 100g</span>
                          </button>
                        ))}
                      </div>
                    ) : searchQuery.length > 2 && (
                      <div className="text-center py-6 text-gray-400 dark:text-dark-secondary font-bold">Nenhum ingrediente encontrado.</div>
                    )}
                  </div>
                )}

                {tempItem.macros && (
                  <div className="space-y-10">
                    <div className="p-6 bg-brand-primary/5 rounded-[32px] border border-brand-primary/20 flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Ingrediente</span>
                          <span className="text-xl font-black text-gray-900 dark:text-dark-text">{tempItem.name}</span>
                       </div>
                       <button onClick={() => setTempItem({name: '', grams: 100, macros: null})} className="p-3 bg-white dark:bg-white/5 rounded-xl text-gray-400 min-w-[44px] min-h-[44px] flex items-center justify-center"><RotateCcw size={18} /></button>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-gray-400 dark:text-dark-secondary uppercase tracking-widest text-center block">Quantidade (Grama)</label>
                       <div className="flex items-center justify-center space-x-8">
                          <button onClick={() => setTempItem({ ...tempItem, grams: Math.max(1, tempItem.grams - 10)})} className="w-14 h-14 bg-gray-50 dark:bg-dark-elevated rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-md min-w-[56px] min-h-[56px]"><Minus size={24} /></button>
                          <div className="text-center min-w-[120px]">
                            <p className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums text-gray-900 dark:text-white">{tempItem.grams}</p>
                            <p className="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mt-2">Grams</p>
                          </div>
                          <button onClick={() => setTempItem({ ...tempItem, grams: Math.min(5000, tempItem.grams + 10)})} className="w-14 h-14 bg-gray-50 dark:bg-dark-elevated rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-md min-w-[56px] min-h-[56px]"><Plus size={24} /></button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col items-center">
                        <span className="text-[8px] font-black text-gray-400 dark:text-dark-secondary uppercase tracking-widest">Proteína</span>
                        <span className="text-lg font-black text-brand-primary">{((tempItem.macros.protein * tempItem.grams) / 100).toFixed(1)}g</span>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col items-center">
                        <span className="text-[8px] font-black text-gray-400 dark:text-dark-secondary uppercase tracking-widest">Carboidratos</span>
                        <span className="text-lg font-black text-blue-400">{((tempItem.macros.carbs * tempItem.grams) / 100).toFixed(1)}g</span>
                      </div>
                    </div>

                    <button 
                      onClick={isAddingIngredient ? handleAddIngredient : handleSaveEdit} 
                      className="w-full bg-brand-primary text-white py-6 rounded-[32px] font-black text-xl shadow-3xl shadow-brand-primary/30 active:scale-95 transition-all flex items-center justify-center space-x-3 btn-glow min-h-[64px]"
                    >
                      <span>{t.save}</span>
                    </button>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDetail;
