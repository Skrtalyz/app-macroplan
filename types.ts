
export interface FoodItem {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: 'high' | 'medium' | 'low';
}

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface MealAnalysis {
  id: string;
  timestamp: number;
  image: string;
  name: string;
  userLabel?: string; 
  isAdjusted?: boolean;
  items: FoodItem[];
  aiOriginalItems?: FoodItem[]; 
  calories: number;
  healthScore: number;
  macros: Macros;
  ingredients: string[];
  observation: string;
}

export enum AppTab {
  HOME = 'home',
  HISTORY = 'history',
  DETAIL = 'detail',
  SETTINGS = 'settings',
  TERMS = 'terms',
  PRIVACY = 'privacy',
  SUPPORT = 'support'
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  dailyGoal: number;
  unit: 'metric' | 'imperial';
  language: 'pt-BR' | 'en-US';
  theme: ThemePreference;
  accountId?: string;
}
