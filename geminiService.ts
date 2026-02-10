
import { GoogleGenAI, Type } from "@google/genai";
import { MealAnalysis, FoodItem } from "./types";

/**
 * Obtém o cliente da IA de forma segura.
 */
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey.includes("SUA_CHAVE")) {
    throw new Error("MISSING_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
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
  const imageHash = await getImageHash(base64Image);
  const cacheKey = `macroplan_cache_v4_${imageHash}`;
  const cachedResult = localStorage.getItem(cacheKey);
  if (cachedResult) return JSON.parse(cachedResult);

  const ai = getAIClient();
  const model = 'gemini-3-flash-preview';
  const targetLanguage = language === 'pt-BR' ? 'Portuguese (Brazil)' : 'English';
  
  const systemInstruction = `You are a world-class nutrition expert and food vision AI. 
  Your task is to analyze food images and provide detailed nutritional estimates.
  
  IMPORTANT CONTEXT:
  - Focus especially on Brazilian cuisine (staples like Rice and Beans, Linguiça, Pão de Queijo, various cuts of beef like Picanha or Acém, and typical sides like Purê de Batata or Farofa).
  - Be flexible with food names. Handle synonyms (e.g., 'Purê' and 'Batata Amassada' are the same).
  - If unsure about an item, use the best estimated average for that food category.
  - History context provided: ${historyContext}. Use this to improve consistency with previous user meals.
  - Return the results in ${targetLanguage}.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
        { text: `Analyze this meal. Provide estimated amounts and macronutrients. Match the response schema exactly.` },
      ],
    },
    config: { 
      systemInstruction,
      responseMimeType: "application/json", 
      responseSchema: ANALYSIS_SCHEMA, 
      temperature: 0.2 
    },
  });

  const responseText = response.text || "{}";
  const analysisResult = JSON.parse(responseText);
  try { localStorage.setItem(cacheKey, JSON.stringify(analysisResult)); } catch (e) {}
  return analysisResult;
};

export const estimateIngredientNutrition = async (name: string): Promise<Omit<FoodItem, 'name' | 'amount' | 'confidence'>> => {
  const ai = getAIClient();
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Estimate nutritional values for 100g of "${name}". 
    Consider synonyms and common Brazilian variations. 
    Provide realistic values for calories, protein, carbs, and fat per 100g of the edible portion.`,
    config: { responseMimeType: "application/json", responseSchema: INGREDIENT_SCHEMA },
  });
  
  const responseText = response.text || "{}";
  return JSON.parse(responseText);
};
