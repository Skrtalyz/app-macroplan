import { GoogleGenAI, Type } from "@google/genai";
import { MealAnalysis, FoodItem } from "./types.ts";

// Inicialização segura via getter para evitar crash de top-level
let _ai: GoogleGenAI | null = null;
const getAIClient = () => {
  if (!_ai) {
    const apiKey = process.env.API_KEY || "";
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
};

async function getImageHash(base64: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(base64);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    calories: { type: Type.NUMBER },
    healthScore: { type: Type.NUMBER },
    protein: { type: Type.NUMBER },
    carbs: { type: Type.NUMBER },
    fat: { type: Type.NUMBER },
    fiber: { type: Type.NUMBER },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
          confidence: { type: Type.STRING },
        },
        required: ['name', 'amount', 'calories', 'protein', 'carbs', 'fat', 'confidence'],
      },
    },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    observation: { type: Type.STRING },
  },
  required: ['name', 'calories', 'healthScore', 'protein', 'carbs', 'fat', 'items', 'ingredients', 'observation'],
};

export const analyzeMealImage = async (base64Image: string, language: string = 'pt-BR', historyContext: string = ''): Promise<Partial<MealAnalysis>> => {
  const ai = getAIClient();
  const imageHash = await getImageHash(base64Image);
  const cacheKey = `macroplan_cache_v3_${imageHash}`;
  const cachedResult = typeof localStorage !== 'undefined' ? localStorage.getItem(cacheKey) : null;
  if (cachedResult) return JSON.parse(cachedResult);

  const model = 'gemini-3-flash-preview';
  const targetLanguage = language === 'pt-BR' ? 'Portuguese (Brazil)' : 'English';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
        { text: `Analyze this meal image. Return JSON. Language: ${targetLanguage}. Context: ${historyContext}` },
      ],
    },
    config: { 
      responseMimeType: "application/json", 
      responseSchema: ANALYSIS_SCHEMA, 
      temperature: 0 
    },
  });

  const analysisResult = JSON.parse(response.text);
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(cacheKey, JSON.stringify(analysisResult)); } catch (e) {}
  return analysisResult;
};

export const estimateIngredientNutrition = async (name: string): Promise<Omit<FoodItem, 'name' | 'amount' | 'confidence'>> => {
  const ai = getAIClient();
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Estimate nutritional values for 100g of "${name}".`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
        },
        required: ['calories', 'protein', 'carbs', 'fat']
      }
    },
  });
  return JSON.parse(response.text);
};