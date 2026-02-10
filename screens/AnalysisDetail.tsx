
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, BrainCircuit, RotateCcw, Tag, Trash2, Plus, Minus, X, CheckCircle2, Search, Edit3, Bookmark, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MealAnalysis, UserProfile, FoodItem, Macros } from '../types';
import { translations, formatWeight, formatNumber } from '../localization';
import { estimateIngredientNutrition } from '../geminiService';

// Base de dados determinística expandida (Valores por 100g)
const FOOD_DATABASE: (Omit<FoodItem, 'amount' | 'confidence'> & { synonyms?: string[] })[] = [
  // Proteínas e Carnes Brasileiras
  { name: 'Frango Grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6, synonyms: ['peito de frango', 'frango fit', 'filé de frango'] },
  { name: 'Frango Cozido', calories: 150, protein: 28, carbs: 0, fat: 4, synonyms: ['frango desfiado'] },
  { name: 'Frango Assado', calories: 195, protein: 30, carbs: 0, fat: 7.7, synonyms: ['sobrecoxa', 'frango de padaria'] },
  { name: 'Linguiça Toscana', calories: 250, protein: 15, carbs: 1, fat: 21, synonyms: ['linguiça de churrasco', 'toscana'] },
  { name: 'Linguiça Calabresa', calories: 300, protein: 14, carbs: 3, fat: 26, synonyms: ['calabresa acebolada'] },
  { name: 'Linguiça de Frango', calories: 180, protein: 17, carbs: 1, fat: 12 },
  { name: 'Bife de Patinho', calories: 220, protein: 32, carbs: 0, fat: 9, synonyms: ['carne magra', 'bife acebolado'] },
  { name: 'Carne Moída (Acém)', calories: 212, protein: 26, carbs: 0, fat: 12, synonyms: ['bolonhesa', 'carne moída'] },
  { name: 'Picanha Grelhada', calories: 238, protein: 24, carbs: 0, fat: 15, synonyms: ['churrasco', 'carne com gordura'] },
  { name: 'Ovo Cozido', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: 'Ovo Frito', calories: 196, protein: 13, carbs: 0.8, fat: 15, synonyms: ['zóiudo'] },
  { name: 'Ovos Mexidos', calories: 170, protein: 12, carbs: 1, fat: 13 },
  { name: 'Omelete Simples', calories: 154, protein: 11, carbs: 0.6, fat: 12 },
  { name: 'Salmão Grelhado', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Tilápia Grelhada', calories: 128, protein: 26, carbs: 0, fat: 2.7, synonyms: ['peixe branco', 'filé de peixe'] },
  { name: 'Atum Enlatado', calories: 116, protein: 26, carbs: 0, fat: 0.8 },
  { name: 'Camarão Cozido', calories: 99, protein: 24, carbs: 0.2, fat: 0.3 },

  // Carboidratos, Grãos e Acompanhamentos
  { name: 'Arroz Branco Cozido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, synonyms: ['arroz soltinho'] },
  { name: 'Arroz Integral Cozido', calories: 110, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: 'Arroz Parboilizado', calories: 125, protein: 2.6, carbs: 27, fat: 0.3 },
  { name: 'Feijão Carioca Cozido', calories: 76, protein: 4.8, carbs: 14, fat: 0.5, synonyms: ['feijão de caldo'] },
  { name: 'Feijão Preto Cozido', calories: 91, protein: 6, carbs: 14, fat: 0.5, synonyms: ['feijão de feijoada'] },
  { name: 'Feijão Fradinho', calories: 110, protein: 8, carbs: 20, fat: 1 },
  { name: 'Grão de Bico Cozido', calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  { name: 'Lentilha Cozida', calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: 'Macarrão ao Sugo', calories: 158, protein: 5.8, carbs: 31, fat: 0.9, synonyms: ['pasta', 'espaguete'] },
  { name: 'Macarrão Integral', calories: 124, protein: 5.3, carbs: 25, fat: 1.1 },
  { name: 'Purê de Batata', calories: 113, protein: 2, carbs: 15, fat: 4.2, synonyms: ['batata amassada', 'purê'] },
  { name: 'Batata Doce Cozida', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Batata Inglesa Cozida', calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  { name: 'Batata Frita', calories: 312, protein: 3.4, carbs: 41, fat: 15, synonyms: ['chips', 'fritas'] },
  { name: 'Mandioca Cozida', calories: 160, protein: 1.4, carbs: 38, fat: 0.3, synonyms: ['aipim', 'macaxeira'] },
  { name: 'Farofa de Mandioca', calories: 400, protein: 2, carbs: 70, fat: 12, synonyms: ['farofa pronta'] },
  { name: 'Cuscuz de Milho', calories: 112, protein: 2.3, carbs: 25, fat: 0.2, synonyms: ['cuscuz nordestino'] },
  { name: 'Tapioca', calories: 240, protein: 0, carbs: 60, fat: 0, synonyms: ['beiju'] },
  { name: 'Pão Francês', calories: 310, protein: 9, carbs: 58, fat: 3, synonyms: ['pão de sal', 'cacetinho'] },
  { name: 'Pão de Queijo', calories: 360, protein: 10, carbs: 40, fat: 18 },

  // Vegetais e Frutas
  { name: 'Alface Americana', calories: 14, protein: 0.9, carbs: 2.9, fat: 0.1 },
  { name: 'Brócolis Cozido', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4 },
  { name: 'Cenoura Cozida', calories: 35, protein: 0.8, carbs: 8, fat: 0.2 },
  { name: 'Tomate Cereja', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: 'Abobrinha Refogada', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  { name: 'Salada Mix', calories: 25, protein: 1.5, carbs: 5, fat: 0.5 },
  { name: 'Banana Nanica', calories: 92, protein: 1.1, carbs: 24, fat: 0.3 },
  { name: 'Maçã com Casca', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: 'Abacate', calories: 160, protein: 2, carbs: 9, fat: 15 },
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
  const [isEstimating, setIsEstimating] = useState(false);
  const [customFoodMode, setCustomFoodMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mealLabelInput, setMealLabelInput] = useState(meal?.userLabel || '');

  const t = translations[user.language];

  useEffect(() => {
    if (editingItemIndex !== null || isAddingIngredient) {
      document.body.classList.add('modal-active');
    } else {
      document.body.classList.remove('modal-active');
    }
    return () => document.body.classList.remove('modal-active');
  }, [editingItemIndex, isAddingIngredient]);

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
      { name: t.protein, value: currentMacros.protein, color: '#3B82F6' },
      { name: t.carbs, value: currentMacros.carbs, color: '#1E40AF' },
      { name: t.fat, value: currentMacros.fat, color: '#F59E0B' },
    ].filter(item => item.value > 0);
  }, [currentMacros, t]);

  const filteredSearch = useMemo(() => {
    const q = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (!q) return [];
    
    return FOOD_DATABASE.filter(f => {
      const matchName = f.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q);
      const matchSynonym = f.synonyms?.some(s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q));
      return matchName || matchSynonym;
    }).slice(0, 8);
  }, [searchQuery]);

  const calculateAdvancedHealthScore = (items: FoodItem[], totalCals: number, protein: number, carbs: number, fat: number) => {
    if (totalCals === 0) return 0;

    // 1. Balanceamento de Macronutrientes (Máx 50 pontos)
    // Usamos distribuição calórica (P=4, C=4, F=9) para o cálculo
    const pCals = protein * 4;
    const cCals = carbs * 4;
    const fCals = fat * 9;
    const totalCalCheck = pCals + cCals + fCals;

    const pPct = pCals / totalCalCheck;
    const cPct = cCals / totalCalCheck;
    const fPct = fCals / totalCalCheck;

    // Alvos ideais: P: 25%, C: 45%, F: 30%
    let balanceScore = 0;
    balanceScore += Math.max(0, 15 - Math.abs(pPct - 0.25) * 60); // Máx 15
    balanceScore += Math.max(0, 20 - Math.abs(cPct - 0.45) * 40); // Máx 20
    balanceScore += Math.max(0, 15 - Math.abs(fPct - 0.30) * 50); // Máx 15

    // 2. Qualidade dos Ingredientes e Variedade (Máx 40 pontos)
    let qualityScore = 15; // Pontuação base
    const vegKeywords = ['alface', 'brócolis', 'cenoura', 'tomate', 'pepino', 'abobrinha', 'espinafre', 'couve', 'berinjela', 'chuchu', 'abóbora', 'salada', 'legumes'];
    const fruitKeywords = ['banana', 'maçã', 'mamão', 'abacate', 'morango', 'uva', 'laranja', 'abacaxi', 'melancia', 'manga'];
    const processedKeywords = ['linguiça', 'salsicha', 'presunto', 'frito', 'frita', 'bacon', 'nugget', 'empanado', 'refrigerante', 'doce', 'chocolate'];

    let vegCount = 0;
    let processedCount = 0;

    items.forEach(item => {
      const name = item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (vegKeywords.some(k => name.includes(k))) vegCount++;
      if (fruitKeywords.some(k => name.includes(k))) qualityScore += 5;
      if (processedKeywords.some(k => name.includes(k))) processedCount++;
    });

    qualityScore += Math.min(25, vegCount * 8); // Bônus vegetais (até 25)
    qualityScore -= Math.min(25, processedCount * 12); // Penalidade processados (até 25)

    // 3. Moderação de Calorias (Máx 10 pontos)
    let densityScore = 10;
    if (totalCals > 800) densityScore -= 4;
    if (totalCals > 1200) densityScore -= 6;

    const finalScore = Math.round(balanceScore + qualityScore + densityScore);
    return Math.min(100, Math.max(10, finalScore)); // Clamped 10-100 para evitar scores "mortos"
  };

  const recalculateTotals = (newItems: FoodItem[], resetToOriginal: boolean = false) => {
    const totalCalories = newItems.reduce((s, i) => s + (Number(i.calories) || 0), 0);
    const totalProtein = newItems.reduce((s, i) => s + (Number(i.protein) || 0), 0);
    const totalCarbs = newItems.reduce((s, i) => s + (Number(i.carbs) || 0), 0);
    const totalFat = newItems.reduce((s, i) => s + (Number(i.fat) || 0), 0);

    const healthScore = calculateAdvancedHealthScore(newItems, totalCalories, totalProtein, totalCarbs, totalFat);

    if (onUpdateMeal && meal) {
      onUpdateMeal(meal.id, {
        items: newItems,
        calories: Math.round(totalCalories),
        macros: { protein: totalProtein, carbs: totalCarbs, fat: totalFat },
        healthScore: healthScore,
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
    setCustomFoodMode(false);
  };

  const handleManualAIEstimate = async () => {
    if (!searchQuery.trim()) return;
    setIsEstimating(true);
    try {
      const estimate = await estimateIngredientNutrition(searchQuery);
      setTempItem({
        name: searchQuery,
        grams: 100,
        macros: estimate
      });
      setCustomFoodMode(true);
      setSearchQuery('');
    } catch (e) {
      showToast('Erro ao estimar valores via IA');
    } finally {
      setIsEstimating(false);
    }
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
    setCustomFoodMode(false);
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
    setCustomFoodMode(false);
    showToast(t.item_added);
  };

  const handleRemoveItem = (index: number) => {
    if (!meal) return;
    const newItems = meal.items.filter((_, i) => i !== index);
    recalculateTotals(newItems);
    showToast(t.item_removed);
  };

  const closeModals = () => {
    setEditingItemIndex(null);
    setIsAddingIngredient(false);
    setSearchQuery('');
    setCustomFoodMode(false);
    setIsEstimating(false);
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
                <span className="text-lg md:text-3xl font-black text-brand-primary tracking-tight">{meal.healthScore || 0} / 100</span>
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
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-3xl flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden h-dvh">
           <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-t-[42px] md:rounded-[56px] p-8 md:p-14 shadow-3xl border-t md:border border-white/10 animate-slide-up flex flex-col max-h-[85dvh] relative transition-all">
              
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-dark-text">
                  {isAddingIngredient ? t.add_item : t.edit_item}
                </h2>
                <button 
                   onClick={closeModals} 
                   className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-500 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-8 pb-32">
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
                        className="w-full bg-gray-50 dark:bg-dark-elevated border border-gray-100 dark:border-white/5 rounded-[24px] pl-14 pr-6 py-5 font-bold outline-none text-gray-900 dark:text-dark-text text-lg focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      />
                      {isEstimating && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-brand-primary">
                          <Loader2 size={18} className="animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {filteredSearch.map((food, i) => (
                        <button key={i} onClick={() => handleSelectSuggestion(food)} className="flex items-center justify-between p-5 bg-gray-50/50 dark:bg-white/5 rounded-2xl hover:bg-brand-primary/10 hover:border-brand-primary/30 border border-transparent transition-all min-h-[60px] text-left group">
                          <div className="flex-1 mr-4">
                             <span className="font-black text-gray-800 dark:text-white block">{food.name}</span>
                             {food.synonyms && (
                               <span className="text-[10px] text-gray-400 block mt-0.5">{food.synonyms.join(', ')}</span>
                             )}
                          </div>
                          <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest whitespace-nowrap">{food.calories} kcal / 100g</span>
                        </button>
                      ))}
                    </div>

                    {searchQuery.length > 2 && (
                      <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                        <button 
                          onClick={handleManualAIEstimate}
                          disabled={isEstimating}
                          className="w-full flex items-center justify-center space-x-3 p-6 bg-brand-primary/5 dark:bg-brand-primary/10 text-brand-primary rounded-[24px] border border-dashed border-brand-primary/30 hover:bg-brand-primary/10 transition-all active:scale-95"
                        >
                          {isEstimating ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Sparkles size={20} />
                          )}
                          <span className="font-black text-sm uppercase tracking-widest">
                            {isEstimating ? t.estimating : t.ai_suggest} "{searchQuery}"
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {tempItem.macros && (
                  <div className="space-y-10 animate-fade-in">
                    <div className="p-6 bg-brand-primary/5 rounded-[32px] border border-brand-primary/20 flex items-center justify-between shrink-0">
                       <div className="flex flex-col min-w-0 pr-4">
                          <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                            {customFoodMode ? 'Novo Alimento' : 'Ingrediente'}
                          </span>
                          <span className="text-xl font-black text-gray-900 dark:text-dark-text truncate">
                            {tempItem.name}
                          </span>
                       </div>
                       <button onClick={() => { setTempItem({name: '', grams: 100, macros: null}); setCustomFoodMode(false); }} className="p-3 bg-white dark:bg-white/10 rounded-xl text-gray-400 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition-all"><RotateCcw size={18} /></button>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-gray-400 dark:text-dark-secondary uppercase tracking-widest text-center block">{t.grams}</label>
                       <div className="flex items-center justify-center space-x-8">
                          <button onClick={() => setTempItem({ ...tempItem, grams: Math.max(1, tempItem.grams - 10)})} className="w-14 h-14 bg-gray-50 dark:bg-dark-elevated rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-md min-w-[56px] min-h-[56px]"><Minus size={24} /></button>
                          <div className="text-center min-w-[120px]">
                            <p className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums text-gray-900 dark:text-white">{tempItem.grams}</p>
                            <p className="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mt-2">Grams</p>
                          </div>
                          <button onClick={() => setTempItem({ ...tempItem, grams: Math.min(5000, tempItem.grams + 10)})} className="w-14 h-14 bg-gray-50 dark:bg-dark-elevated rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-md min-w-[56px] min-h-[56px]"><Plus size={24} /></button>
                       </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-gray-400 dark:text-dark-secondary uppercase tracking-widest">{t.macros_per_100g}</span>
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{Math.round(tempItem.macros.calories)} kcal</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col items-center">
                          <span className="text-[8px] font-black text-gray-400 dark:text-dark-secondary uppercase tracking-widest mb-1">{t.protein}</span>
                          <span className="text-lg font-black text-brand-primary">{tempItem.macros.protein.toFixed(1)}g</span>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col items-center">
                          <span className="text-[8px] font-black text-gray-400 dark:text-dark-secondary uppercase tracking-widest mb-1">{t.carbs}</span>
                          <span className="text-lg font-black text-blue-400">{tempItem.macros.carbs.toFixed(1)}g</span>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex flex-col items-center">
                          <span className="text-[8px] font-black text-gray-400 dark:text-dark-secondary uppercase tracking-widest mb-1">{t.fat}</span>
                          <span className="text-lg font-black text-amber-500">{tempItem.macros.fat.toFixed(1)}g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {tempItem.macros && (
                <div className="absolute bottom-0 left-0 w-full p-8 pt-4 pb-[calc(1.5rem + env(safe-area-inset-bottom))] bg-gradient-to-t from-white dark:from-dark-card via-white dark:via-dark-card to-transparent shrink-0">
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
      )}
    </div>
  );
};

export default AnalysisDetail;
