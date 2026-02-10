
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, RefreshCcw, Check, Plus, Trash2, Ruler, Minus, RotateCcw, AlertCircle, Key } from 'lucide-react';
import { analyzeMealImage } from '../geminiService';
import { MealAnalysis, UserProfile, FoodItem } from '../types';
import { translations } from '../localization';

interface AnalysisFlowProps {
  user: UserProfile;
  onComplete: (analysis: MealAnalysis) => void;
  onCancel: () => void;
  history?: MealAnalysis[];
}

type FlowState = 'SELECT' | 'CAMERA' | 'ANALYZING' | 'CONFIRM' | 'ERROR';

const AnalysisFlow: React.FC<AnalysisFlowProps> = ({ user, onComplete, onCancel, history = [] }) => {
  const [state, setState] = useState<FlowState>('SELECT');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Partial<MealAnalysis> | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [errorInfo, setErrorInfo] = useState<{title: string, message: string, icon?: React.ReactNode} | null>(null);
  const [adjustingIndex, setAdjustingIndex] = useState<number | null>(null);
  const [tempGrams, setTempGrams] = useState<number>(100);
  const [removedItems, setRemovedItems] = useState<FoodItem[]>([]);
  const [snapshot, setSnapshot] = useState<FoodItem[] | null>(null);
  const [mealName, setMealName] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[user.language];

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    if (state === 'CAMERA') {
      const startCamera = async () => {
        try {
          currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
          });
          if (videoRef.current) {
            videoRef.current.srcObject = currentStream;
          }
        } catch (err) {
          setErrorInfo({
            title: t.camera_access_denied,
            message: user.language === 'pt-BR' ? 'Verifique as permissões de câmera.' : 'Check camera permissions.',
            icon: <Camera size={40} />
          });
          setState('ERROR');
        }
      };
      startCamera();
    }
    return () => currentStream?.getTracks().forEach(track => track.stop());
  }, [state, facingMode, t, user.language]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewImage(base64);
      processImage(base64);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      processImage(base64);
    };
  };

  const processImage = async (base64: string) => {
    setState('ANALYZING');
    setErrorInfo(null);
    
    const historyContext = history.slice(0, 3).map(m => 
      m.items.map(i => `${i.name}: ${i.amount}`).join(', ')
    ).join(' | ');
    
    try {
      const result = (await analyzeMealImage(base64, user.language, historyContext)) as any;
      
      const formattedResult: Partial<MealAnalysis> = {
        ...result,
        macros: {
          protein: Number(result.protein) || 0,
          carbs: Number(result.carbs) || 0,
          fat: Number(result.fat) || 0
        }
      };
      
      setAnalysisResult(formattedResult);
      if (result.items) {
        setSnapshot(JSON.parse(JSON.stringify(result.items)));
      }
      setState('CONFIRM');
    } catch (error: any) {
      console.error("AI Analysis Failed:", error);
      
      if (error.message === "MISSING_API_KEY") {
        setErrorInfo({
          title: user.language === 'pt-BR' ? "Configuração Necessária" : "API Key Required",
          message: user.language === 'pt-BR' 
            ? "Você precisa configurar a API_KEY nas variáveis de ambiente do seu projeto." 
            : "Please set your API_KEY in the project environment variables.",
          icon: <Key size={40} />
        });
      } else {
        setErrorInfo({
          title: user.language === 'pt-BR' ? "Erro na Análise" : "Analysis Error",
          message: user.language === 'pt-BR' 
            ? "Ocorreu uma falha ao processar a imagem. Tente novamente." 
            : "Failed to process image. Please try again.",
          icon: <AlertCircle size={40} />
        });
      }
      setState('ERROR');
    }
  };

  const parseGrams = (amount: string): number => {
    const match = amount.match(/(\d+)/);
    return match ? parseInt(match[1]) : 100;
  };

  const updateAnalysisTotals = (items: FoodItem[]) => {
    const totalCals = items.reduce((sum, item) => sum + item.calories, 0);
    const totalProt = items.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = items.reduce((sum, item) => sum + item.fat, 0);
    
    setAnalysisResult({
      ...analysisResult,
      items: items,
      calories: Math.round(totalCals),
      macros: {
        protein: parseFloat(totalProt.toFixed(1)),
        carbs: parseFloat(totalCarbs.toFixed(1)),
        fat: parseFloat(totalFat.toFixed(1))
      }
    });
  };

  const handleReset = () => {
    if (snapshot && window.confirm(t.confirm_reset)) {
      setRemovedItems([]);
      updateAnalysisTotals(JSON.parse(JSON.stringify(snapshot)));
    }
  };

  const handleRemoveItem = (index: number) => {
    if (!analysisResult?.items) return;
    const item = analysisResult.items[index];
    const newItems = analysisResult.items.filter((_, i) => i !== index);
    setRemovedItems(prev => [item, ...prev]);
    updateAnalysisTotals(newItems);
  };

  const saveGrams = () => {
    if (adjustingIndex === null || !analysisResult?.items) return;
    const newItems = [...analysisResult.items];
    const item = newItems[adjustingIndex];
    const originalGrams = parseGrams(item.amount);
    const multiplier = tempGrams / (originalGrams || 100);
    newItems[adjustingIndex] = {
      ...item,
      amount: `${tempGrams}g`,
      calories: Math.round(item.calories * multiplier),
      protein: parseFloat((item.protein * multiplier).toFixed(1)),
      carbs: parseFloat((item.carbs * multiplier).toFixed(1)),
      fat: parseFloat((item.fat * multiplier).toFixed(1))
    };
    updateAnalysisTotals(newItems);
    setAdjustingIndex(null);
  };

  const handleFinalConfirm = () => {
    if (!analysisResult || !previewImage) return;
    onComplete({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      image: previewImage,
      name: analysisResult.name || 'Meal',
      userLabel: mealName.trim() || undefined,
      items: analysisResult.items || [],
      aiOriginalItems: snapshot || [],
      calories: analysisResult.calories || 0,
      healthScore: analysisResult.healthScore || 0,
      macros: analysisResult.macros || { protein: 0, carbs: 0, fat: 0 },
      ingredients: analysisResult.ingredients || [],
      observation: analysisResult.observation || '',
    });
  };

  if (state === 'SELECT') {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center animate-fade-in p-4 pb-[calc(1rem + env(safe-area-inset-bottom))]">
        <div className="bg-white dark:bg-dark-bg w-full max-w-md rounded-[32px] md:rounded-[42px] p-6 md:p-9 animate-slide-up border border-white/10 premium-shadow">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-dark-text tracking-tight">{t.analyze_meal}</h2>
            <button onClick={onCancel} className="p-3 bg-gray-100 dark:bg-dark-elevated rounded-2xl text-gray-500 min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={20} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:gap-5">
            <button onClick={() => setState('CAMERA')} className="flex flex-col items-center p-6 md:p-8 bg-brand-primary/10 rounded-[28px] md:rounded-[32px] group active:scale-95 transition-all min-h-[140px] justify-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-brand-primary text-white rounded-[20px] md:rounded-[22px] flex items-center justify-center mb-4"><Camera className="w-6 h-6 md:w-8 md:h-8" /></div>
              <span className="font-bold text-sm md:text-base text-brand-primary">{t.take_photo}</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center p-6 md:p-8 bg-blue-50 dark:bg-blue-950/20 rounded-[28px] md:rounded-[32px] active:scale-95 transition-all min-h-[140px] justify-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 text-white rounded-[20px] md:rounded-[22px] flex items-center justify-center mb-4"><ImageIcon className="w-6 h-6 md:w-8 md:h-8" /></div>
              <span className="font-bold text-sm md:text-base text-blue-900 dark:text-blue-400">{t.gallery}</span>
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
        </div>
      </div>
    );
  }

  if (state === 'CAMERA') {
    return (
      <div className="fixed inset-0 z-[110] bg-black flex flex-col animate-fade-in overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          <div className="flex-1 border-[40px] border-black/40 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square border-2 border-white/40 rounded-[40px]">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
                <div className="absolute top-0 left-0 w-full h-0.5 bg-brand-primary/50 shadow-[0_0_15px_var(--brand-shadow)] animate-scanner"></div>
             </div>
          </div>
        </div>

        <div className="p-8 pb-[calc(2rem + env(safe-area-inset-bottom))] bg-gradient-to-t from-black/80 to-transparent flex items-center justify-around z-20">
           <button onClick={() => setState('SELECT')} className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white min-w-[56px] min-h-[56px] flex items-center justify-center"><X size={24} /></button>
           <button onClick={capturePhoto} className="w-24 h-24 bg-white rounded-full flex items-center justify-center active:scale-90 transition-all border-8 border-white/20">
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center text-white">
                <Camera size={36} />
              </div>
           </button>
           <button onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')} className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white min-w-[56px] min-h-[56px] flex items-center justify-center">
              <RefreshCcw size={24} />
           </button>
        </div>
      </div>
    );
  }

  if (state === 'ANALYZING') {
    return (
      <div className="fixed inset-0 z-[120] bg-white dark:bg-dark-bg flex flex-col items-center justify-center p-8 text-center animate-fade-in pt-safe pb-safe">
        <div className="relative w-48 h-48 md:w-64 md:h-64 mb-10">
          <div className="absolute inset-0 rounded-[32px] md:rounded-[48px] overflow-hidden border-4 border-brand-primary/20 shadow-2xl">
             {previewImage && <img src={previewImage} className="w-full h-full object-cover opacity-60 grayscale" />}
             <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary shadow-[0_0_15px_var(--brand-shadow)] animate-scanner"></div>
          </div>
        </div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight">{t.analyzing}</h2>
        <div className="mt-4 flex items-center space-x-2 text-brand-primary font-bold animate-pulse">
           <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" strokeWidth={3} />
           <span className="text-sm">Vision AI Processing...</span>
        </div>
      </div>
    );
  }

  if (state === 'CONFIRM' && analysisResult) {
    return (
      <div className="fixed inset-0 z-[130] bg-gray-50 dark:bg-dark-bg flex flex-col animate-fade-in overflow-hidden">
        <div className="bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between pt-[calc(0.5rem + env(safe-area-inset-top))]">
           <button onClick={() => setState('SELECT')} className="p-2.5 bg-gray-100 dark:bg-dark-elevated rounded-xl text-gray-500 min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={18} /></button>
           <h2 className="font-black text-lg truncate px-2">{t.confirm_analysis}</h2>
           <button onClick={handleReset} className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary active:rotate-[-90deg] transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center"><RotateCcw size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scrollbar-hide pb-40">
          <div className="relative w-full aspect-video rounded-[32px] overflow-hidden premium-shadow bg-gray-200 dark:bg-dark-elevated">
            <img src={previewImage!} className="w-full h-full object-cover" />
          </div>

          <div className="p-4 bg-brand-primary/10 rounded-[24px] border border-brand-primary/20 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-brand-primary">Energy Estimate</span>
            <span className="text-2xl font-black text-brand-primary">{analysisResult.calories} kcal</span>
          </div>

          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">{t.meal_label}</h3>
            <input 
              type="text" 
              value={mealName}
              onChange={e => setMealName(e.target.value)}
              placeholder={t.meal_name_placeholder}
              className="w-full bg-white dark:bg-dark-card border border-gray-100 dark:border-white/10 rounded-[20px] px-6 py-4 font-bold text-base focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">{t.identified_foods}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysisResult.items?.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-dark-card p-4 rounded-[24px] premium-shadow border border-white/50 dark:border-white/5 flex items-center justify-between min-h-[72px]">
                  <div className="flex-1 min-w-0 pr-2">
                     <p className="font-black text-sm md:text-base truncate">{item.name}</p>
                     <p className="text-[9px] md:text-[10px] font-black text-brand-primary uppercase tracking-tight">{item.amount} • {item.calories} kcal</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => { setTempGrams(parseGrams(item.amount)); setAdjustingIndex(idx); }} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-gray-400 active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center"><Ruler size={16} /></button>
                    <button onClick={() => handleRemoveItem(idx)} className="p-3 text-red-500 active:scale-90 min-w-[44px] min-h-[44px] flex items-center justify-center"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 w-full p-6 md:p-8 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md border-t border-gray-100 dark:border-white/5 pb-[calc(1.5rem + env(safe-area-inset-bottom))]">
           <button onClick={handleFinalConfirm} className="w-full bg-brand-primary text-white py-5 rounded-[28px] md:rounded-[32px] font-black text-lg shadow-xl shadow-brand-primary/20 flex items-center justify-center space-x-3 active:scale-95 transition-all btn-glow min-h-[56px]">
             <Check size={24} strokeWidth={3} />
             <span>{t.confirm_save}</span>
           </button>
        </div>

        {adjustingIndex !== null && (
          <div className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-2xl flex items-end md:items-center justify-center p-6">
             <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-t-[42px] md:rounded-[42px] p-8 pb-[calc(2rem + env(safe-area-inset-bottom))] md:pb-8 shadow-2xl border border-white/10 animate-scale-in">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-xl font-black">{t.adjust_grams}</h2>
                  <button onClick={() => setAdjustingIndex(null)} className="p-3 text-gray-400 min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={20} /></button>
                </div>
                <div className="flex flex-col items-center space-y-12">
                   <div className="flex items-center space-x-8">
                     <button onClick={() => setTempGrams(Math.max(5, tempGrams - 10))} className="w-14 h-14 bg-gray-100 dark:bg-dark-elevated rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-sm"><Minus size={24} /></button>
                     <div className="text-center">
                        <p className="text-6xl font-black tabular-nums tracking-tighter text-gray-900 dark:text-white">{tempGrams}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">{t.grams}</p>
                     </div>
                     <button onClick={() => setTempGrams(Math.min(2000, tempGrams + 10))} className="w-14 h-14 bg-gray-100 dark:bg-dark-elevated rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-sm"><Plus size={24} /></button>
                   </div>
                   <button onClick={saveGrams} className="w-full bg-brand-primary text-white py-5 rounded-[24px] font-black shadow-lg shadow-brand-primary/20 active:scale-95 transition-all min-h-[56px]">{t.save}</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  if (state === 'ERROR') {
    return (
      <div className="fixed inset-0 z-[150] bg-white dark:bg-dark-bg flex flex-col items-center justify-center p-10 text-center animate-fade-in pt-safe pb-safe">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-950/20 rounded-[32px] flex items-center justify-center text-red-500 mb-8 shadow-xl">
           {errorInfo?.icon || <AlertCircle size={40} strokeWidth={3} />}
        </div>
        <h2 className="text-2xl font-black mb-3 dark:text-white">{errorInfo?.title || 'Ops! Ocorreu um erro'}</h2>
        <p className="text-gray-500 dark:text-gray-400 font-bold text-sm mb-12 max-w-xs leading-relaxed">
          {errorInfo?.message}
        </p>
        <button onClick={() => setState('SELECT')} className="bg-brand-primary text-white px-10 py-5 rounded-[24px] font-black active:scale-95 transition-all shadow-xl shadow-brand-primary/20 min-h-[56px] min-w-[200px]">
          {t.back}
        </button>
      </div>
    );
  }

  return null;
};

export default AnalysisFlow;
