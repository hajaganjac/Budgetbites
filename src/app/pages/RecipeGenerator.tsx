import React, { useState, useRef } from 'react';
import {
  Sparkles, Plus, X, ChefHat, Flame, Clock, Wallet,
  Star, CheckCircle2, ChevronDown, ChevronUp, Wand2, RefreshCw,
  Leaf, UtensilsCrossed, ShoppingBag,
} from 'lucide-react';
import { useApp, ALL_RECIPES } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import { KITCHEN_SUGGESTIONS, type DietaryTag, type FullRecipe } from '../data/recipeData';

const C = { pink: '#F24E6F', teal: '#29B6C5', blue: '#2196F3' };

interface GeneratedResult extends FullRecipe {
  matchScore: number;
  matchedItems: string[];
  missingItems: string[];
}

type DietFilter = 'all' | 'vegan' | 'vegetarian' | 'halal';

const DIETARY_OPTS: { value: DietFilter; label: string; emoji: string; color: string; desc: string }[] = [
  { value: 'all',        label: 'No Restriction', emoji: '🍽️', color: '#6b7280', desc: 'Show all recipes' },
  { value: 'vegan',      label: 'Vegan',           emoji: '🌱', color: '#22c55e', desc: 'Plant-based only' },
  { value: 'vegetarian', label: 'Vegetarian',      emoji: '🥦', color: '#84cc16', desc: 'No meat or fish' },
  { value: 'halal',      label: 'Halal',           emoji: '☪️', color: '#8b5cf6', desc: 'Halal certified' },
];

function MatchBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: '6px', background: '#f3f4f6' }}>
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ height: '100%', borderRadius: '999px', background: color }}
      />
    </div>
  );
}

function ResultCard({ result, index }: { result: GeneratedResult; index: number }) {
  const { cookMeal } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [justCooked, setJustCooked] = useState(false);

  const matchPct = Math.round(result.matchScore);
  const matchColor =
    matchPct >= 80 ? '#22c55e' :
    matchPct >= 50 ? '#f59e0b' : C.pink;

  const handleCook = () => {
    cookMeal(result);
    setJustCooked(true);
    setTimeout(() => setJustCooked(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}
    >
      {/* Image + overlay */}
      <div className="relative" style={{ height: '155px', overflow: 'hidden' }}>
        <ImageWithFallback src={result.image} alt={result.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))' }} />
        {/* Match badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: matchColor, backdropFilter: 'blur(4px)' }}>
          <Sparkles size={11} color="#fff" />
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>{matchPct}% match</span>
        </div>
        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-white" style={{ background: result.storeColor, fontSize: '11px', fontWeight: 600 }}>{result.store}</span>
        <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-white" style={{ background: result.tagColor, fontSize: '11px', fontWeight: 600 }}>{result.tag}</span>
      </div>

      <div className="p-4">
        <h3 style={{ color: '#111', fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>{result.name}</h3>
        <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '10px', lineHeight: 1.4 }}>{result.description}</p>

        {/* Match score bar */}
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span style={{ color: '#6b7280', fontSize: '11px' }}>Kitchen match</span>
            <span style={{ color: matchColor, fontSize: '11px', fontWeight: 700 }}>{matchPct}%</span>
          </div>
          <MatchBar pct={matchPct} color={matchColor} />
        </div>

        {/* Stats row */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#fff5f7' }}>
            <Wallet size={10} style={{ color: C.pink }} /><span style={{ color: C.pink, fontSize: '11px', fontWeight: 600 }}>€{result.price.toFixed(2)}</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#f0fafb' }}>
            <Flame size={10} style={{ color: C.teal }} /><span style={{ color: C.teal, fontSize: '11px', fontWeight: 600 }}>{result.calories} kcal</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#f0f7ff' }}>
            <Clock size={10} style={{ color: C.blue }} /><span style={{ color: C.blue, fontSize: '11px', fontWeight: 600 }}>{result.time}</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: '#fafafa' }}>
            <Star size={10} style={{ color: '#f59e0b' }} /><span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 600 }}>{result.difficulty}</span>
          </span>
        </div>

        {/* Macros */}
        <div className="flex gap-2 mb-3 text-center">
          {[
            { label: 'Protein', val: result.protein, color: C.pink },
            { label: 'Carbs',   val: result.carbs,   color: C.blue  },
            { label: 'Fat',     val: result.fat,      color: '#f59e0b' },
          ].map(m => (
            <div key={m.label} className="flex-1 py-1.5 rounded-xl" style={{ background: `${m.color}10` }}>
              <div style={{ color: m.color, fontSize: '13px', fontWeight: 700 }}>{m.val}g</div>
              <div style={{ color: '#9ca3af', fontSize: '10px' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Matched / Missing items */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 mb-2 hover:opacity-70 transition-opacity"
          style={{ color: '#6b7280', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          See ingredient breakdown
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-3 overflow-hidden">
              {result.matchedItems.length > 0 && (
                <div className="mb-2">
                  <div style={{ color: '#22c55e', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>✅ You have ({result.matchedItems.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {result.matchedItems.map(item => (
                      <span key={item} className="px-2 py-0.5 rounded-md" style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px' }}>{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.missingItems.length > 0 && (
                <div>
                  <div style={{ color: C.pink, fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>🛒 Still need ({result.missingItems.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {result.missingItems.map(item => (
                      <span key={item} className="px-2 py-0.5 rounded-md" style={{ background: '#fff5f7', color: C.pink, fontSize: '11px' }}>{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Steps */}
              <div className="mt-3">
                <div style={{ color: '#111', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>📋 How to cook</div>
                {result.steps.map((step, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ background: result.tagColor, fontSize: '10px', fontWeight: 700, marginTop: '1px' }}>{i + 1}</span>
                    <span style={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.4 }}>{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleCook}
          className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2"
          style={{
            background: justCooked ? 'linear-gradient(135deg,#4ade80,#22c55e)' : 'linear-gradient(135deg,#F24E6F,#29B6C5)',
            color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
          }}>
          {justCooked ? <><CheckCircle2 size={15} /> Logged! +{result.calories} kcal</> : <><ChefHat size={15} /> Cook It!</>}
        </motion.button>
      </div>
    </motion.div>
  );
}

export function RecipeGenerator() {
  const { weeklyBudget, addGroceryItem } = useApp();

  // State
  const [budgetPerMeal, setBudgetPerMeal] = useState(3);
  const [dietary, setDietary] = useState<DietFilter>('all');
  const [kitchenItems, setKitchenItems] = useState<string[]>(['eggs', 'pasta', 'garlic', 'onions']);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<GeneratedResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleInput = (val: string) => {
    setInputValue(val);
    if (val.length > 0) {
      setSuggestions(
        KITCHEN_SUGGESTIONS.filter(s =>
          s.toLowerCase().includes(val.toLowerCase()) &&
          !kitchenItems.includes(s.toLowerCase())
        ).slice(0, 6)
      );
    } else {
      setSuggestions([]);
    }
  };

  const addItem = (item: string) => {
    const cleaned = item.trim().toLowerCase();
    if (cleaned && !kitchenItems.includes(cleaned)) {
      setKitchenItems(prev => [...prev, cleaned]);
    }
    setInputValue('');
    setSuggestions([]);
  };

  const removeItem = (item: string) => setKitchenItems(prev => prev.filter(i => i !== item));

  const generate = () => {
    setLoading(true);
    setGenerated(false);

    setTimeout(() => {
      // Filter by dietary + budget
      const eligible = ALL_RECIPES.filter(r => {
        const dietOk = dietary === 'all' || r.dietary.includes(dietary as DietaryTag);
        const priceOk = r.price <= budgetPerMeal;
        return dietOk && priceOk;
      });

      // Score by kitchen match
      const scored: GeneratedResult[] = eligible.map(recipe => {
        const matched = recipe.kitchenKeywords.filter(kw =>
          kitchenItems.some(item => item.includes(kw) || kw.includes(item))
        );
        const missing = recipe.kitchenKeywords.filter(kw =>
          !kitchenItems.some(item => item.includes(kw) || kw.includes(item))
        );
        const matchScore = recipe.kitchenKeywords.length > 0
          ? (matched.length / recipe.kitchenKeywords.length) * 100
          : 50;
        return { ...recipe, matchScore, matchedItems: matched, missingItems: missing };
      });

      // Sort by match score desc, then price asc
      scored.sort((a, b) => b.matchScore - a.matchScore || a.price - b.price);

      setResults(scored.slice(0, 6));
      setLoading(false);
      setGenerated(true);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 1800); // simulate "AI" thinking
  };

  const reset = () => {
    setResults(null);
    setGenerated(false);
  };

  const addMissingToGrocery = (result: GeneratedResult) => {
    result.missingItems.forEach(item => addGroceryItem(item, result.store));
  };

  return (
    <div className="p-6 max-w-[1100px] mx-auto">

      {/* ── Header ────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#F24E6F,#29B6C5)' }}>
            <Wand2 size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ color: '#111', fontSize: '24px', fontWeight: 800 }}>Recipe Generator ✨</h1>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Tell us your budget, diet & what's in your kitchen</p>
          </div>
        </div>
      </motion.div>

      {/* ── Generator Form ─────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="rounded-2xl p-6 mb-8"
        style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.05)' }}>

        {/* ── Step 1: Budget ──────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#F24E6F,#ff7a92)', fontSize: '14px', fontWeight: 700 }}>1</div>
            <div>
              <h2 style={{ color: '#111', fontSize: '16px', fontWeight: 700 }}>Set your meal budget</h2>
              <p style={{ color: '#9ca3af', fontSize: '12px' }}>Maximum you want to spend per meal</p>
            </div>
            <div className="ml-auto px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg,#F24E6F,#ff7a92)', color: '#fff' }}>
              <span style={{ fontSize: '20px', fontWeight: 800 }}>€{budgetPerMeal.toFixed(2)}</span>
            </div>
          </div>

          <input type="range" min={0.5} max={5} step={0.1} value={budgetPerMeal}
            onChange={e => setBudgetPerMeal(Number(e.target.value))}
            className="w-full mb-2" style={{ accentColor: C.pink }} />
          <div className="flex justify-between" style={{ color: '#9ca3af', fontSize: '11px' }}>
            {['€0.50', '€1.00', '€2.00', '€3.00', '€4.00', '€5.00'].map(l => <span key={l}>{l}</span>)}
          </div>

          {/* Budget tags */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {[
              { label: '🍳 Super cheap (≤€1)', val: 1 },
              { label: '💚 Budget (≤€2)', val: 2 },
              { label: '🎯 Standard (≤€3)', val: 3 },
              { label: '⭐ Flexible (≤€5)', val: 5 },
            ].map(b => (
              <button key={b.val} onClick={() => setBudgetPerMeal(b.val)}
                className="px-3 py-1.5 rounded-xl transition-all"
                style={{
                  background: budgetPerMeal === b.val ? 'linear-gradient(135deg,#F24E6F,#29B6C5)' : '#F8F9FF',
                  color: budgetPerMeal === b.val ? '#fff' : '#6b7280',
                  border: `1px solid ${budgetPerMeal === b.val ? 'transparent' : '#e5e7eb'}`,
                  fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                }}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)', marginBottom: '28px' }} />

        {/* ── Step 2: Dietary preference ──────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#29B6C5,#4dd0dd)', fontSize: '14px', fontWeight: 700 }}>2</div>
            <div>
              <h2 style={{ color: '#111', fontSize: '16px', fontWeight: 700 }}>Dietary preference</h2>
              <p style={{ color: '#9ca3af', fontSize: '12px' }}>Pick what suits your lifestyle</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DIETARY_OPTS.map(opt => (
              <motion.button key={opt.value} whileTap={{ scale: 0.96 }}
                onClick={() => setDietary(opt.value)}
                className="p-4 rounded-2xl flex flex-col items-center gap-2 transition-all"
                style={{
                  background: dietary === opt.value ? `${opt.color}18` : '#F8F9FF',
                  border: `2px solid ${dietary === opt.value ? opt.color : '#e5e7eb'}`,
                  cursor: 'pointer',
                }}>
                <span style={{ fontSize: '24px' }}>{opt.emoji}</span>
                <div style={{ color: dietary === opt.value ? opt.color : '#111', fontSize: '13px', fontWeight: dietary === opt.value ? 700 : 500 }}>{opt.label}</div>
                <div style={{ color: '#9ca3af', fontSize: '11px', textAlign: 'center' }}>{opt.desc}</div>
                {dietary === opt.value && (
                  <div className="w-2 h-2 rounded-full" style={{ background: opt.color }} />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)', marginBottom: '28px' }} />

        {/* ── Step 3: Kitchen items ────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#2196F3,#42a8f5)', fontSize: '14px', fontWeight: 700 }}>3</div>
            <div>
              <h2 style={{ color: '#111', fontSize: '16px', fontWeight: 700 }}>What's in your kitchen?</h2>
              <p style={{ color: '#9ca3af', fontSize: '12px' }}>Add ingredients you already have — we'll match recipes to them</p>
            </div>
          </div>

          {/* Input */}
          <div className="relative mb-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addItem(inputValue); if (e.key === 'Escape') setSuggestions([]); }}
                  placeholder="e.g. eggs, pasta, garlic, rice..."
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ background: '#F8F9FF', border: '2px solid #e5e7eb', color: '#111', fontSize: '14px' }}
                  onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                />
                {/* Autocomplete */}
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
                      style={{ background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb' }}>
                      {suggestions.map(s => (
                        <button key={s} onMouseDown={() => addItem(s)}
                          className="w-full text-left px-4 py-2.5 hover:bg-[#F8F9FF] transition-colors flex items-center gap-2"
                          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#111' }}>
                          <Plus size={12} style={{ color: C.teal }} /> {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => addItem(inputValue)}
                className="px-5 py-3 rounded-xl flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg,#2196F3,#29B6C5)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                <Plus size={16} /> Add
              </motion.button>
            </div>
          </div>

          {/* Quick add */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span style={{ color: '#9ca3af', fontSize: '11px', alignSelf: 'center' }}>Quick add:</span>
            {['eggs', 'pasta', 'rice', 'lentils', 'onions', 'garlic', 'tomatoes', 'chicken', 'cheese', 'bread', 'oats', 'milk'].map(item => (
              !kitchenItems.includes(item) && (
                <button key={item} onClick={() => addItem(item)}
                  className="px-2.5 py-1 rounded-lg hover:opacity-80 transition-all"
                  style={{ background: '#F8F9FF', border: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11px', cursor: 'pointer' }}>
                  + {item}
                </button>
              )
            ))}
          </div>

          {/* Kitchen items chips */}
          {kitchenItems.length > 0 && (
            <div>
              <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>
                Your kitchen ({kitchenItems.length} items):
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {kitchenItems.map(item => (
                    <motion.div key={item}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                      style={{ background: '#F0FAF8', border: '1px solid #29B6C530' }}>
                      <span style={{ color: '#111', fontSize: '13px' }}>{item}</span>
                      <button onClick={() => removeItem(item)}
                        className="hover:opacity-70 transition-opacity"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                        <X size={12} style={{ color: '#9ca3af' }} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {kitchenItems.length === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#FFF5F7', border: '1px dashed #F24E6F40' }}>
              <UtensilsCrossed size={14} style={{ color: C.pink }} />
              <span style={{ color: '#9ca3af', fontSize: '13px' }}>Add at least one item to get better recipe matches</span>
            </div>
          )}
        </div>

        {/* ── Generate button ─────────────────────────────── */}
        <motion.button whileTap={{ scale: 0.98 }} onClick={generate} disabled={loading}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
          style={{
            background: loading ? '#e5e7eb' : 'linear-gradient(135deg,#F24E6F,#29B6C5)',
            color: loading ? '#9ca3af' : '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px', fontWeight: 700, boxShadow: loading ? 'none' : '0 6px 20px rgba(242,78,111,0.3)',
          }}>
          {loading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <RefreshCw size={20} />
              </motion.div>
              Generating your recipes...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              {generated ? 'Regenerate Recipes' : 'Generate My Recipes ✨'}
            </>
          )}
        </motion.button>
      </motion.div>

      {/* ── Loading animation ──────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-10 mb-8 flex flex-col items-center gap-4"
            style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              style={{ fontSize: '48px' }}>
              🍳
            </motion.div>
            <div>
              <h3 style={{ color: '#111', fontSize: '18px', fontWeight: 700, textAlign: 'center', marginBottom: '4px' }}>
                Cooking up your matches...
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center' }}>
                Scanning {ALL_RECIPES.length} recipes for the best combinations
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              {[C.pink, C.teal, C.blue, '#f59e0b'].map((color, i) => (
                <motion.div key={i} className="w-2.5 h-2.5 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  style={{ background: color }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {results && !loading && (
          <motion.div ref={resultsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Results header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 style={{ color: '#111', fontSize: '20px', fontWeight: 800 }}>
                  ✨ {results.length} recipes generated!
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '2px' }}>
                  Matched to your kitchen & budget · {dietary !== 'all' ? DIETARY_OPTS.find(o => o.value === dietary)?.label : 'All diets'} · max €{budgetPerMeal.toFixed(2)}/meal
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-80"
                  style={{ background: '#F8F9FF', color: '#6b7280', border: '1px solid #e5e7eb', fontSize: '13px', cursor: 'pointer' }}>
                  <RefreshCw size={13} /> Reset
                </button>
              </div>
            </div>

            {/* Match legend */}
            <div className="flex gap-3 mb-5 flex-wrap">
              {[
                { color: '#22c55e', label: '80–100% — Great match' },
                { color: '#f59e0b', label: '50–79% — Good match' },
                { color: C.pink,   label: '0–49% — Partial match' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                  <span style={{ color: '#6b7280', fontSize: '11px' }}>{l.label}</span>
                </div>
              ))}
            </div>

            {results.length === 0 ? (
              <div className="rounded-2xl p-12 flex flex-col items-center"
                style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '48px', marginBottom: '12px' }}>😕</span>
                <h3 style={{ color: '#111', fontSize: '16px', fontWeight: 700 }}>No recipes found</h3>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px', textAlign: 'center' }}>
                  Try increasing your budget or changing your dietary preference
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                  {results.map((result, i) => <ResultCard key={result.id} result={result} index={i} />)}
                </div>

                {/* Add missing items to grocery */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="rounded-2xl p-5"
                  style={{ background: 'linear-gradient(135deg,#F24E6F08,#29B6C508)', border: '1px solid #F24E6F20' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag size={16} style={{ color: C.pink }} />
                    <h3 style={{ color: '#111', fontSize: '15px', fontWeight: 700 }}>Add missing ingredients to your grocery list</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {results.slice(0, 3).map(result => (
                      result.missingItems.length > 0 && (
                        <button key={result.id} onClick={() => addMissingToGrocery(result)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:opacity-80 transition-all"
                          style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#111', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
                          <Plus size={12} style={{ color: C.teal }} />
                          Add {result.missingItems.length} missing for "{result.name}"
                        </button>
                      )
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state (before generating) ────────────────── */}
      {!results && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-10 flex flex-col items-center"
          style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px dashed #e5e7eb' }}>
          <div className="flex gap-3 mb-5">
            {['🥚', '🍝', '🥦', '🫘', '🍗'].map((e, i) => (
              <motion.span key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                style={{ fontSize: '28px' }}>{e}</motion.span>
            ))}
          </div>
          <h3 style={{ color: '#111', fontSize: '18px', fontWeight: 700, textAlign: 'center', marginBottom: '6px' }}>
            Ready to cook something great?
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', maxWidth: '400px' }}>
            Fill in your budget, dietary preference and kitchen items above — then hit <strong>Generate</strong> to discover your perfect student meals!
          </p>
        </motion.div>
      )}
    </div>
  );
}
