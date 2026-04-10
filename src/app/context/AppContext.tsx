import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ALL_RECIPES } from '../data/recipeData';

export { ALL_RECIPES };
export type { FullRecipe } from '../data/recipeData';
export const RECIPES = ALL_RECIPES.slice(0, 6);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CookedMeal {
  id: string;
  recipeId: number;
  recipeName: string;
  calories: number;
  price: number;
  cookedAt: Date;
}

export interface GroceryItem {
  id: string;
  name: string;
  checked: boolean;
  store?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  xpReward: number;
  unlocked: boolean;
  progress?: number;   // 0–100
  progressLabel?: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  color: string;
  xp: number;
  xpForNext: number;
  xpProgress: number; // 0–100 pct within this level
}

// ─── Constants ────────────────────────────────────────────────────────────────
const AVG_TAKEAWAY_COST = 10; // €10 per meal saved vs eating out

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000];
const LEVEL_TITLES     = ['Hungry Student', 'Kitchen Rookie', 'Budget Chef', 'Flavor Hunter', 'Iron Chef', 'Kitchen Legend'];
const LEVEL_COLORS     = ['#9ca3af', '#29B6C5', '#2196F3', '#8b5cf6', '#F24E6F', '#f59e0b'];

export const AVATAR_EMOJIS = ['👨‍🎓', '👩‍🎓', '🧑‍🍳', '👨‍🍳', '👩‍🍳', '🧑‍💻', '🧑‍🎓', '🦸', '🧙', '🐧', '🦊', '🐸'];

const DAILY_QUOTES = [
  { text: "Good food is the foundation of genuine happiness.", author: "Auguste Escoffier" },
  { text: "Cooking is at once child's play and adult joy.", author: "Craig Claiborne" },
  { text: "Budget cooking is an art form. You're basically a student Picasso.", author: "BudgetBites 🎨" },
  { text: "Rice, beans, and a dream. The student holy trinity.", author: "Every broke student ever" },
  { text: "Every great chef started with eggs and a broken pan.", author: "Kitchen wisdom" },
  { text: "You don't need money to eat well. You need knowledge.", author: "BudgetBites 💡" },
  { text: "The secret ingredient is always love. And garlic.", author: "Kitchen proverb" },
  { text: "Eating cheap teaches you more about food than eating expensive.", author: "Anthony Bourdain" },
  { text: "A recipe has no soul. You as the cook must bring soul to the recipe.", author: "Thomas Keller" },
  { text: "Cheap meals taste better when you make them yourself.", author: "BudgetBites 🏠" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeDate = (daysAgo: number, hour: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d;
};

function calcStreak(meals: CookedMeal[]): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const hasMealsOn = (date: Date) => meals.some(m => {
    const d = new Date(m.cookedAt); d.setHours(0, 0, 0, 0);
    return d.getTime() === date.getTime();
  });
  const cursor = new Date(today);
  if (!hasMealsOn(cursor)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!hasMealsOn(cursor)) return 0;
  }
  let streak = 0;
  while (hasMealsOn(cursor)) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

function calcLevel(xp: number): LevelInfo {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { level = i; break; }
  }
  const isMax = level >= LEVEL_THRESHOLDS.length - 1;
  const xpForNext = isMax ? LEVEL_THRESHOLDS[level] : LEVEL_THRESHOLDS[level + 1];
  const xpBase = LEVEL_THRESHOLDS[level];
  const progress = isMax ? 100 : ((xp - xpBase) / (xpForNext - xpBase)) * 100;
  return {
    level: level + 1,
    title: LEVEL_TITLES[level],
    color: LEVEL_COLORS[level],
    xp,
    xpForNext,
    xpProgress: Math.min(100, progress),
  };
}

function calcAchievements(
  meals: CookedMeal[],
  streak: number,
  favorites: number[],
  totalSaved: number,
): Achievement[] {
  const totalMeals = meals.length;
  const veganMeals = meals.filter(m => {
    const r = ALL_RECIPES.find(r => r.id === m.recipeId);
    return r && (r.dietary.includes('vegan') || r.dietary.includes('vegetarian'));
  }).length;
  const quickMeals = meals.filter(m => {
    const r = ALL_RECIPES.find(r => r.id === m.recipeId);
    return r && parseInt(r.time) <= 10;
  }).length;

  return [
    {
      id: 'first_bite',     title: 'First Bite',       emoji: '🍳', color: '#F24E6F',
      description: 'Cook your very first meal',
      xpReward: 50,
      unlocked: totalMeals >= 1,
      progress: Math.min(100, totalMeals * 100),
      progressLabel: `${Math.min(1, totalMeals)}/1 meals`,
    },
    {
      id: 'on_fire',        title: 'On Fire',           emoji: '🔥', color: '#ff7a00',
      description: 'Cook 3 days in a row',
      xpReward: 75,
      unlocked: streak >= 3,
      progress: Math.min(100, (streak / 3) * 100),
      progressLabel: `${Math.min(streak, 3)}/3 day streak`,
    },
    {
      id: 'week_warrior',   title: 'Week Warrior',      emoji: '📅', color: '#2196F3',
      description: 'Cook every day for 7 days',
      xpReward: 150,
      unlocked: streak >= 7,
      progress: Math.min(100, (streak / 7) * 100),
      progressLabel: `${Math.min(streak, 7)}/7 day streak`,
    },
    {
      id: 'going_green',    title: 'Going Green',       emoji: '🌱', color: '#22c55e',
      description: 'Cook 5 vegan or vegetarian meals',
      xpReward: 100,
      unlocked: veganMeals >= 5,
      progress: Math.min(100, (veganMeals / 5) * 100),
      progressLabel: `${Math.min(veganMeals, 5)}/5 plant meals`,
    },
    {
      id: 'speed_demon',    title: 'Speed Demon',       emoji: '⚡', color: '#f59e0b',
      description: 'Cook 3 meals in under 10 minutes',
      xpReward: 75,
      unlocked: quickMeals >= 3,
      progress: Math.min(100, (quickMeals / 3) * 100),
      progressLabel: `${Math.min(quickMeals, 3)}/3 quick meals`,
    },
    {
      id: 'picky_eater',    title: 'Picky Eater',       emoji: '❤️', color: '#F24E6F',
      description: 'Save 5 recipes to favourites',
      xpReward: 50,
      unlocked: favorites.length >= 5,
      progress: Math.min(100, (favorites.length / 5) * 100),
      progressLabel: `${Math.min(favorites.length, 5)}/5 saved`,
    },
    {
      id: 'money_saver',    title: 'Money Saver',       emoji: '💰', color: '#29B6C5',
      description: 'Save €50 vs eating out',
      xpReward: 125,
      unlocked: totalSaved >= 50,
      progress: Math.min(100, (totalSaved / 50) * 100),
      progressLabel: `€${Math.min(totalSaved, 50).toFixed(0)}/€50 saved`,
    },
    {
      id: 'iron_chef',      title: 'Iron Chef',         emoji: '🏆', color: '#8b5cf6',
      description: 'Cook 20 meals total',
      xpReward: 200,
      unlocked: totalMeals >= 20,
      progress: Math.min(100, (totalMeals / 20) * 100),
      progressLabel: `${Math.min(totalMeals, 20)}/20 meals`,
    },
    {
      id: 'kitchen_legend', title: 'Kitchen Legend',    emoji: '⭐', color: '#f59e0b',
      description: 'Cook 50 meals total',
      xpReward: 500,
      unlocked: totalMeals >= 50,
      progress: Math.min(100, (totalMeals / 50) * 100),
      progressLabel: `${Math.min(totalMeals, 50)}/50 meals`,
    },
  ];
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const initialCookedMeals: CookedMeal[] = [
  { id: 'demo-1',  recipeId: 1,  recipeName: 'Spaghetti Bolognese',    calories: 520, price: 2.50, cookedAt: makeDate(0, 12) },
  { id: 'demo-2',  recipeId: 3,  recipeName: 'Hearty Lentil Soup',      calories: 380, price: 1.20, cookedAt: makeDate(0, 19) },
  { id: 'demo-3',  recipeId: 4,  recipeName: 'Egg & Cheese Omelette',   calories: 320, price: 0.90, cookedAt: makeDate(1, 8)  },
  { id: 'demo-4',  recipeId: 2,  recipeName: 'Egg Fried Rice',          calories: 450, price: 1.80, cookedAt: makeDate(1, 18) },
  { id: 'demo-5',  recipeId: 11, recipeName: 'Red Lentil Dal',          calories: 480, price: 1.50, cookedAt: makeDate(2, 19) },
  { id: 'demo-6',  recipeId: 8,  recipeName: 'Avocado Toast',           calories: 290, price: 1.30, cookedAt: makeDate(3, 8)  },
  { id: 'demo-7',  recipeId: 1,  recipeName: 'Spaghetti Bolognese',     calories: 520, price: 2.50, cookedAt: makeDate(4, 20) },
  { id: 'demo-8',  recipeId: 12, recipeName: 'Chickpea Coconut Curry',  calories: 460, price: 1.90, cookedAt: makeDate(5, 18) },
  { id: 'demo-9',  recipeId: 14, recipeName: 'Banana Oat Porridge',     calories: 350, price: 0.70, cookedAt: makeDate(6, 7)  },
];

const initialGroceryItems: GroceryItem[] = [
  { id: '1', name: 'Red lentils (500g)',    checked: false, store: 'Aldi'         },
  { id: '2', name: 'Spaghetti (500g)',      checked: true,  store: 'Lidl'         },
  { id: '3', name: 'Minced beef (300g)',    checked: false, store: 'Lidl'         },
  { id: '4', name: 'Eggs (12-pack)',        checked: true,  store: 'Aldi'         },
  { id: '5', name: 'Frozen mixed veg',      checked: false, store: 'Albert Heijn' },
  { id: '6', name: 'Canned tomatoes (2x)', checked: false, store: 'Aldi'         },
  { id: '7', name: 'Avocados (2x)',         checked: false, store: 'Albert Heijn' },
  { id: '8', name: 'Coconut milk (can)',    checked: true,  store: 'Albert Heijn' },
];

// ─── Context type ─────────────────────────────────────────────────────────────
interface AppContextType {
  // Profile
  studentName: string;
  setStudentName: (n: string) => void;
  studentEmoji: string;
  setStudentEmoji: (e: string) => void;
  // Budget / calories
  weeklyBudget: number;
  setWeeklyBudget: (b: number) => void;
  calorieGoal: number;
  setCalorieGoal: (g: number) => void;
  // Meals
  cookedMeals: CookedMeal[];
  cookMeal: (recipe: { id: number; name: string; calories: number; price: number }) => void;
  uncookMeal: (id: string) => void;
  // Grocery
  groceryItems: GroceryItem[];
  addGroceryItem: (name: string, store?: string) => void;
  toggleGroceryItem: (id: string) => void;
  deleteGroceryItem: (id: string) => void;
  clearCheckedItems: () => void;
  // Favourites
  favorites: number[];
  toggleFavorite: (id: number) => void;
  // Computed stats
  totalCaloriesToday: number;
  totalSpentThisWeek: number;
  remainingBudget: number;
  todayMeals: CookedMeal[];
  streak: number;
  totalSaved: number;
  levelInfo: LevelInfo;
  achievements: Achievement[];
  newlyUnlocked: string[];          // achievement ids just unlocked
  clearNewlyUnlocked: () => void;
  // Quote
  dailyQuote: { text: string; author: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({
  children,
  initialName  = 'Student',
  initialEmoji = '👨‍🎓',
}: {
  children: React.ReactNode;
  initialName?: string;
  initialEmoji?: string;
}) {
  const [studentName,   setStudentName]  = useState(initialName);
  const [studentEmoji,  setStudentEmoji] = useState(initialEmoji);
  const [weeklyBudget,  setWeeklyBudget] = useState(35);
  const [calorieGoal,   setCalorieGoal]  = useState(2000);
  const [cookedMeals,   setCookedMeals]  = useState<CookedMeal[]>(initialCookedMeals);
  const [groceryItems,  setGroceryItems] = useState<GroceryItem[]>(initialGroceryItems);
  const [favorites,     setFavorites]    = useState<number[]>([3, 12]);
  const [prevAchievements, setPrevAchievements] = useState<string[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // ── Computed basics ────────────────────────────────────────────────────────
  const todayStr = new Date().toDateString();
  const todayMeals = cookedMeals.filter(m => new Date(m.cookedAt).toDateString() === todayStr);
  const totalCaloriesToday = todayMeals.reduce((s, m) => s + m.calories, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const totalSpentThisWeek = cookedMeals
    .filter(m => new Date(m.cookedAt) >= weekStart)
    .reduce((s, m) => s + m.price, 0);
  const remainingBudget = Math.max(0, weeklyBudget - totalSpentThisWeek);

  const streak = useMemo(() => calcStreak(cookedMeals), [cookedMeals]);
  const totalSaved = useMemo(
    () => cookedMeals.reduce((s, m) => s + Math.max(0, AVG_TAKEAWAY_COST - m.price), 0),
    [cookedMeals]
  );
  const xp = cookedMeals.length * 25;
  const levelInfo = useMemo(() => calcLevel(xp), [xp]);
  const achievements = useMemo(
    () => calcAchievements(cookedMeals, streak, favorites, totalSaved),
    [cookedMeals, streak, favorites, totalSaved]
  );

  // ── Daily quote (stable per day) ───────────────────────────────────────────
  const dailyQuote = useMemo(() => {
    const idx = new Date().getDate() % DAILY_QUOTES.length;
    return DAILY_QUOTES[idx];
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const cookMeal = useCallback((recipe: { id: number; name: string; calories: number; price: number }) => {
    setCookedMeals(prev => {
      const updated = [{ id: `meal-${Date.now()}`, recipeId: recipe.id, recipeName: recipe.name, calories: recipe.calories, price: recipe.price, cookedAt: new Date() }, ...prev];
      // Check for newly unlocked achievements after this cook
      const newXp = updated.length * 25;
      const newStreak = calcStreak(updated);
      const newSaved = updated.reduce((s, m) => s + Math.max(0, AVG_TAKEAWAY_COST - m.price), 0);
      const newAch = calcAchievements(updated, newStreak, favorites, newSaved);
      const justUnlocked = newAch.filter(a => a.unlocked && !prevAchievements.includes(a.id)).map(a => a.id);
      if (justUnlocked.length > 0) {
        setNewlyUnlocked(justUnlocked);
        setPrevAchievements(prev2 => [...prev2, ...justUnlocked]);
      }
      return updated;
    });
  }, [favorites, prevAchievements]);

  const uncookMeal   = useCallback((id: string) => setCookedMeals(prev => prev.filter(m => m.id !== id)), []);
  const addGroceryItem   = useCallback((name: string, store?: string) => setGroceryItems(prev => [...prev, { id: `item-${Date.now()}`, name, checked: false, store }]), []);
  const toggleGroceryItem = useCallback((id: string) => setGroceryItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i)), []);
  const deleteGroceryItem = useCallback((id: string) => setGroceryItems(prev => prev.filter(i => i.id !== id)), []);
  const clearCheckedItems = useCallback(() => setGroceryItems(prev => prev.filter(i => !i.checked)), []);
  const toggleFavorite    = useCallback((id: number) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]), []);
  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked([]), []);

  return (
    <AppContext.Provider value={{
      studentName, setStudentName, studentEmoji, setStudentEmoji,
      weeklyBudget, setWeeklyBudget, calorieGoal, setCalorieGoal,
      cookedMeals, cookMeal, uncookMeal,
      groceryItems, addGroceryItem, toggleGroceryItem, deleteGroceryItem, clearCheckedItems,
      favorites, toggleFavorite,
      totalCaloriesToday, totalSpentThisWeek, remainingBudget, todayMeals,
      streak, totalSaved, levelInfo, achievements,
      newlyUnlocked, clearNewlyUnlocked,
      dailyQuote,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}