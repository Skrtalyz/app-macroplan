import { GoogleGenAI, Type } from "@google/genai";
import { MealAnalysis, FoodItem } from "./types";

// Inicialização segura: se a chave não existir, o app não crasha no boot, mas avisa no console
const API_KEY = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

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
          confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
        },
        required: ['name', 'amount', 'calories', 'protein', 'carbs', 'fat', 'confidence'],
      },
    },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    observation: { type: Type.STRING },
  },
  required: ['name', 'calories', 'healthScore', 'protein', 'carbs', 'fat', 'items', 'ingredients', 'observation'],
};

const INGREDIENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    calories: { type: Type.NUMBER, description: 'Calories per 100g' },
    protein: { type: Type.NUMBER, description: 'Protein per 100g' },
    carbs: { type: Type.NUMBER, description: 'Carbs per 100g' },
    fat: { type: Type.NUMBER, description: 'Fat per 100g' },
  },
  required: ['calories', 'protein', 'carbs', 'fat'],
};

export const analyzeMealImage = async (base64Image: string, language: string = 'pt-BR', historyContext: string = ''): Promise<Partial<MealAnalysis>> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please set API_KEY environment variable.");
  }

  const imageHash = await getImageHash(base64Image);
  const cacheKey = `macroplan_cache_v3_${imageHash}`;
  const cachedResult = localStorage.getItem(cacheKey);
  if (cachedResult) return JSON.parse(cachedResult);

  const model = 'gemini-3-flash-preview';
  const targetLanguage = language === 'pt-BR' ? 'Portuguese (Brazil)' : 'English';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
        { text: `Analyze this meal. Language: ${targetLanguage}. Return JSON matching schema.` },
      ],
    },
    config: { responseMimeType: "application/json", responseSchema: ANALYSIS_SCHEMA, temperature: 0 },
  });

  const analysisResult = JSON.parse(response.text);
  try { localStorage.setItem(cacheKey, JSON.stringify(analysisResult)); } catch (e) {}
  return analysisResult;
};

export const estimateIngredientNutrition = async (name: string): Promise<Omit<FoodItem, 'name' | 'amount' | 'confidence'>> => {
  if (!API_KEY) {
    throw new Error("API Key is missing.");
  }
  
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Estimate nutritional values for 100g of "${name}". Be precise and realistic.`,
    config: { responseMimeType: "application/json", responseSchema: INGREDIENT_SCHEMA },
  });
  return JSON.parse(response.text);
};