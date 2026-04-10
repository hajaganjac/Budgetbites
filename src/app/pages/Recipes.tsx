import React, { useState } from 'react';
import {
  Wallet, Flame, Clock, Star, ChefHat,
  CheckCircle2, ChevronDown, ChevronUp, AlertCircle, SlidersHorizontal, Utensils, Heart,
} from 'lucide-react';
import { useApp, ALL_RECIPES } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import type { DietaryTag } from '../data/recipeData';
import { useConfetti } from '../hooks/useConfetti';

const C = { pink: '#F24E6F', teal: '#29B6C5', blue: '#2196F3' };

const DIETARY_FILTERS: { value: DietaryTag | 'all'; label: string; emoji: string; color: string }[] = [
  { value: 'all',         label: 'All',          emoji: '🍽️', color: '#6b7280' },
  { value: 'vegan',       label: 'Vegan',         emoji: '🌱', color: '#22c55e' },
  { value: 'vegetarian',  label: 'Vegetarian',    emoji: '🥦', color: '#84cc16' },
  { value: 'halal',       label: 'Halal',         emoji: '☪️', color: '#8b5cf6' },
];

const SORT_OPTIONS = [
  { value: 'price', label: 'Price: Low→High' },
  { value: 'calories', label: 'Calories: Low→High' },
  { value: 'time', label: 'Time: Quickest' },
];

function DietBadge({ dietary }: { dietary: string[] }) {
  const badges = [];
  if (dietary.includes('vegan')) badges.push({ label: 'Vegan', color: '#22c55e', emoji: '🌱' });
  else if (dietary.includes('vegetarian')) badges.push({ label: 'Vegetarian', color: '#84cc16', emoji: '🥦' });
  if (dietary.includes('halal')) badges.push({ label: 'Halal', color: '#8b5cf6', emoji: '☪️' });
  return (
    <div className="flex gap-1 flex-wrap">
      {badges.map(b => (
        <span key={b.label} className="px-1.5 py-0.5 rounded-md" style={{ background: `${b.color}18`, color: b.color, fontSize: '10px', fontWeight: 600 }}>
          {b.emoji} {b.label}
        </span>
      ))}
    </div>
  );
}

function RecipeCard({ recipe, index }: { recipe: typeof ALL_RECIPES[0]; index: number }) {
  const { cookMeal, cookedMeals, weeklyBudget, totalSpentThisWeek, favorites, toggleFavorite } = useApp();
  const [showIngredients, setShowIngredients] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [justCooked, setJustCooked] = useState(false);
  const { burst } = useConfetti();

  const isFav = favorites.includes(recipe.id);
  const cookedToday = cookedMeals.filter(
    m => m.recipeId === recipe.id && new Date(m.cookedAt).toDateString() === new Date().toDateString()
  ).length;
  const canAfford = totalSpentThisWeek + recipe.price <= weeklyBudget + 5;

  const handleCook = () => {
    cookMeal(recipe);
    burst();
    setJustCooked(true);
    setTimeout(() => setJustCooked(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      layout
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}
    >
      {/* Image */}
      <div className="relative" style={{ height: '165px', overflow: 'hidden' }}>
        <ImageWithFallback src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.42))' }} />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white" style={{ background: recipe.tagColor, fontSize: '11px', fontWeight: 600 }}>{recipe.tag}</span>
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-white" style={{ background: recipe.storeColor, fontSize: '11px', fontWeight: 600 }}>{recipe.store}</span>

        {/* Favourite button */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => toggleFavorite(recipe.id)}
          className="absolute bottom-3 left-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: isFav ? '#F24E6F' : 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
        >
          <Heart size={13} fill={isFav ? '#fff' : 'none'} stroke="#fff" strokeWidth={2} />
        </motion.button>

        {cookedToday > 0 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#4ade80', fontSize: '11px', fontWeight: 600 }}>
            <CheckCircle2 size={11} /> ×{cookedToday}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 style={{ color: '#111', fontSize: '15px', fontWeight: 700 }}>{recipe.name}</h3>
        </div>
        <DietBadge dietary={recipe.dietary} />
        <p style={{ color: '#9ca3af', fontSize: '12px', margin: '8px 0 10px', lineHeight: 1.4 }}>{recipe.description}</p>

        {/* Stats */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#fff5f7' }}>
            <Wallet size={11} style={{ color: C.pink }} /><span style={{ color: C.pink, fontSize: '11px', fontWeight: 600 }}>€{recipe.price.toFixed(2)}</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#f0fafb' }}>
            <Flame size={11} style={{ color: C.teal }} /><span style={{ color: C.teal, fontSize: '11px', fontWeight: 600 }}>{recipe.calories} kcal</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#f0f7ff' }}>
            <Clock size={11} style={{ color: C.blue }} /><span style={{ color: C.blue, fontSize: '11px', fontWeight: 600 }}>{recipe.time}</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#fafafa' }}>
            <Star size={11} style={{ color: '#f59e0b' }} /><span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 600 }}>{recipe.difficulty}</span>
          </span>
        </div>

        {/* Macros */}
        <div className="flex gap-2 mb-3 text-center">
          {[
            { label: 'Protein', val: recipe.protein, color: C.pink },
            { label: 'Carbs',   val: recipe.carbs,   color: C.blue },
            { label: 'Fat',     val: recipe.fat,     color: '#f59e0b' },
          ].map(m => (
            <div key={m.label} className="flex-1 py-1.5 rounded-xl" style={{ background: `${m.color}10` }}>
              <div style={{ color: m.color, fontSize: '13px', fontWeight: 700 }}>{m.val}g</div>
              <div style={{ color: '#9ca3af', fontSize: '10px' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Ingredients toggle */}
        <button onClick={() => { setShowIngredients(v => !v); setShowSteps(false); }}
          className="flex items-center gap-1 mb-1 hover:opacity-70 transition-opacity"
          style={{ color: '#6b7280', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {showIngredients ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showIngredients ? 'Hide' : 'Show'} ingredients
        </button>
        <AnimatePresence>
          {showIngredients && (
            <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-2 pl-0 list-none" style={{ borderLeft: `3px solid ${recipe.tagColor}30`, paddingLeft: '8px' }}>
              {recipe.ingredients.map((ing, i) => (
                <li key={i} style={{ color: '#6b7280', fontSize: '12px', marginBottom: '3px' }}>• {ing}</li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {/* Steps toggle */}
        <button onClick={() => { setShowSteps(v => !v); setShowIngredients(false); }}
          className="flex items-center gap-1 mb-2 hover:opacity-70 transition-opacity"
          style={{ color: '#6b7280', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {showSteps ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showSteps ? 'Hide' : 'Show'} steps
        </button>
        <AnimatePresence>
          {showSteps && (
            <motion.ol initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-2 pl-0 list-none">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                    style={{ background: recipe.tagColor, fontSize: '10px', fontWeight: 700, marginTop: '1px' }}>{i + 1}</span>
                  <span style={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.4 }}>{step}</span>
                </li>
              ))}
            </motion.ol>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="mt-auto pt-2">
          {!canAfford && (
            <div className="flex items-center gap-1 mb-2 px-2 py-1.5 rounded-lg" style={{ background: '#fff5f7' }}>
              <AlertCircle size={11} style={{ color: C.pink }} />
              <span style={{ color: C.pink, fontSize: '11px' }}>May exceed weekly budget</span>
            </div>
          )}
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleCook}
            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2"
            style={{
              background: justCooked ? 'linear-gradient(135deg,#4ade80,#22c55e)' : 'linear-gradient(135deg,#F24E6F,#29B6C5)',
              color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
            }}>
            {justCooked ? <><CheckCircle2 size={15} /> Logged! +{recipe.calories} kcal</> : <><ChefHat size={15} /> Cook It!</>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export function Recipes() {
  const { weeklyBudget, favorites } = useApp();
  const [dietary, setDietary] = useState<DietaryTag | 'all'>('all');
  const [sort, setSort] = useState('price');
  const [maxPrice, setMaxPrice] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  const filtered = ALL_RECIPES
    .filter(r => dietary === 'all' || r.dietary.includes(dietary as DietaryTag))
    .filter(r => r.price <= maxPrice)
    .filter(r => !showFavsOnly || favorites.includes(r.id))
    .sort((a, b) => {
      if (sort === 'price')    return a.price - b.price;
      if (sort === 'calories') return a.calories - b.calories;
      if (sort === 'time')     return parseInt(a.time) - parseInt(b.time);
      return 0;
    });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 style={{ color: '#111', fontSize: '24px', fontWeight: 800 }}>Recipes 🍳</h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '2px' }}>
              {filtered.length} budget-friendly meals for your €{weeklyBudget}/week
            </p>
          </div>
          <div className="flex gap-2">
            {/* Favourites toggle */}
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowFavsOnly(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
              style={{ background: showFavsOnly ? '#F24E6F' : '#fff', color: showFavsOnly ? '#fff' : '#6b7280', border: showFavsOnly ? '1px solid transparent' : '1px solid #e5e7eb', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              <Heart size={14} fill={showFavsOnly ? '#fff' : 'none'} />
              Favourites {favorites.length > 0 && `(${favorites.length})`}
            </motion.button>
            <button onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
              style={{ background: showFilters ? 'linear-gradient(135deg,#F24E6F,#29B6C5)' : '#fff', color: showFilters ? '#fff' : '#6b7280', border: '1px solid #e5e7eb', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Dietary pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {DIETARY_FILTERS.map(f => (
          <motion.button key={f.value} whileTap={{ scale: 0.95 }}
            onClick={() => setDietary(f.value as DietaryTag | 'all')}
            className="px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
            style={{
              background: dietary === f.value ? f.color : '#fff',
              color: dietary === f.value ? '#fff' : '#6b7280',
              border: `2px solid ${dietary === f.value ? f.color : '#e5e7eb'}`,
              fontSize: '13px', fontWeight: dietary === f.value ? 700 : 400, cursor: 'pointer',
            }}>
            <span>{f.emoji}</span> {f.label}
          </motion.button>
        ))}
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl p-5 mb-4"
            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span style={{ color: '#111', fontSize: '13px', fontWeight: 600 }}>Max Price Per Meal</span>
                  <span style={{ color: C.pink, fontWeight: 700, fontSize: '14px' }}>€{maxPrice.toFixed(2)}</span>
                </div>
                <input type="range" min={0.5} max={5} step={0.1} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full" style={{ accentColor: C.pink }} />
                <div className="flex justify-between" style={{ color: '#9ca3af', fontSize: '11px' }}><span>€0.50</span><span>€5.00</span></div>
              </div>
              <div>
                <span style={{ color: '#111', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Sort By</span>
                <div className="flex gap-2 flex-wrap">
                  {SORT_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => setSort(o.value)}
                      className="px-3 py-1.5 rounded-xl transition-all"
                      style={{ background: sort === o.value ? 'linear-gradient(135deg,#F24E6F,#29B6C5)' : '#F8F9FF', color: sort === o.value ? '#fff' : '#6b7280', border: `1px solid ${sort === o.value ? 'transparent' : '#e5e7eb'}`, fontSize: '12px', fontWeight: sort === o.value ? 600 : 400, cursor: 'pointer' }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipe grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Utensils size={36} style={{ color: '#d1d5db', marginBottom: '12px' }} />
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            {showFavsOnly ? 'No favourited recipes yet — tap ❤️ on any recipe!' : 'No recipes match your filters'}
          </p>
          <button onClick={() => { setDietary('all'); setMaxPrice(5); setShowFavsOnly(false); }}
            style={{ color: C.pink, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', fontWeight: 600 }}>
            Reset filters
          </button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((recipe, i) => <RecipeCard key={recipe.id} recipe={recipe} index={i} />)}
        </motion.div>
      )}
    </div>
  );
}