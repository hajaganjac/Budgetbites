import React, { useState } from 'react';
import {
  ShoppingCart, Plus, Trash2, CheckCircle2, Circle,
  Package, X, Sparkles, ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = {
  pink: '#F24E6F',
  teal: '#29B6C5',
  blue: '#2196F3',
  dark: '#111111',
  bg: '#F8F9FF',
};

const STORE_OPTIONS = ['Any Store', 'Lidl', 'Albert Heijn', 'Aldi'];
const STORE_COLORS: Record<string, string> = {
  'Lidl': '#0050AA',
  'Albert Heijn': '#00A0E2',
  'Aldi': '#E5002B',
  'Any Store': '#9ca3af',
};

const SUGGESTIONS = [
  'Pasta (500g)', 'Rice (1kg)', 'Red lentils', 'Eggs (12-pack)',
  'Canned tomatoes', 'Frozen vegetables', 'Onions (1kg)',
  'Garlic', 'Bread (whole grain)', 'Oats (1kg)',
  'Chicken breast', 'Minced beef', 'Avocados', 'Bananas',
  'Milk (1L)', 'Butter', 'Olive oil', 'Soy sauce',
];

export function GroceryNotes() {
  const { groceryItems, addGroceryItem, toggleGroceryItem, deleteGroceryItem, clearCheckedItems } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [selectedStore, setSelectedStore] = useState('Any Store');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterStore, setFilterStore] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    addGroceryItem(trimmed, selectedStore === 'Any Store' ? undefined : selectedStore);
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setShowSuggestions(false);
  };

  const checkedCount = groceryItems.filter(i => i.checked).length;
  const uncheckedCount = groceryItems.filter(i => !i.checked).length;

  const filteredItems = groceryItems.filter(item =>
    !filterStore || item.store === filterStore || (!item.store && filterStore === 'Any Store')
  );

  const uncheckedItems = filteredItems.filter(i => !i.checked);
  const checkedItems = filteredItems.filter(i => i.checked);

  const matchingSuggestions = SUGGESTIONS.filter(s =>
    inputValue.length > 0 &&
    s.toLowerCase().includes(inputValue.toLowerCase()) &&
    !groceryItems.some(g => g.name.toLowerCase() === s.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="p-6 max-w-[860px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 style={{ color: '#111111', fontSize: '24px', fontWeight: 800, lineHeight: 1.2 }}>
              Grocery Notes 🛒
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '2px' }}>
              Plan your shopping list and stay on budget
            </p>
          </div>

          {/* Stats badges */}
          <div className="flex gap-2 flex-wrap">
            <div className="px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <ShoppingCart size={14} style={{ color: COLORS.pink }} />
              <span style={{ color: '#111111', fontSize: '13px', fontWeight: 600 }}>
                {uncheckedCount} to buy
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <CheckCircle2 size={14} style={{ color: COLORS.teal }} />
              <span style={{ color: '#111111', fontSize: '13px', fontWeight: 600 }}>
                {checkedCount} bought
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {groceryItems.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span style={{ color: '#6b7280', fontSize: '12px' }}>Shopping progress</span>
              <span style={{ color: '#111111', fontSize: '12px', fontWeight: 600 }}>
                {checkedCount}/{groceryItems.length} items
              </span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: '8px', background: '#f3f4f6' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${groceryItems.length > 0 ? (checkedCount / groceryItems.length) * 100 : 0}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #29B6C5, #2196F3)',
                }}
              />
            </div>
            {checkedCount === groceryItems.length && groceryItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-2"
              >
                <Sparkles size={14} style={{ color: '#f59e0b' }} />
                <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>
                  All done! 🎉 You've got everything.
                </span>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* Add item card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl p-5 mb-4"
        style={{ background: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
      >
        <h2 style={{ color: '#111111', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Add Item</h2>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {/* Input with suggestions */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={e => { setInputValue(e.target.value); setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="e.g. Red lentils, Pasta, Eggs..."
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                background: '#F8F9FF',
                border: '2px solid #e5e7eb',
                color: '#111111',
                fontSize: '14px',
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {/* Suggestions dropdown */}
            {showSuggestions && matchingSuggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
                style={{ background: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb' }}
              >
                {matchingSuggestions.map(s => (
                  <button
                    key={s}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#F8F9FF] transition-colors flex items-center gap-2"
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#111111' }}
                    onMouseDown={() => {
                      setInputValue(s);
                      setShowSuggestions(false);
                    }}
                  >
                    <Plus size={12} style={{ color: COLORS.teal }} />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Store selector */}
          <select
            value={selectedStore}
            onChange={e => setSelectedStore(e.target.value)}
            className="px-3 py-3 rounded-xl outline-none"
            style={{
              background: '#F8F9FF',
              border: '2px solid #e5e7eb',
              color: '#111111',
              fontSize: '13px',
              cursor: 'pointer',
              minWidth: '130px',
            }}
          >
            {STORE_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Add button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            className="px-5 py-3 rounded-xl flex items-center gap-2 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #F24E6F, #29B6C5)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <Plus size={16} />
            Add
          </motion.button>
        </div>

        {/* Quick add chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span style={{ color: '#9ca3af', fontSize: '11px', alignSelf: 'center' }}>Quick add:</span>
          {['Eggs', 'Pasta', 'Rice', 'Onions', 'Lentils', 'Bread'].map(item => (
            <button
              key={item}
              onClick={() => {
                addGroceryItem(item);
              }}
              className="px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
              style={{
                background: '#F8F9FF',
                border: '1px solid #e5e7eb',
                color: '#6b7280',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              + {item}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filter tabs */}
      {groceryItems.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button
            onClick={() => setFilterStore(null)}
            className="px-3 py-1.5 rounded-xl whitespace-nowrap transition-all"
            style={{
              background: !filterStore ? 'linear-gradient(135deg, #F24E6F, #29B6C5)' : '#ffffff',
              color: !filterStore ? 'white' : '#6b7280',
              border: `1px solid ${!filterStore ? 'transparent' : '#e5e7eb'}`,
              fontSize: '12px',
              fontWeight: !filterStore ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            All Stores
          </button>
          {STORE_OPTIONS.slice(1).map(store => {
            const hasItems = groceryItems.some(g => g.store === store);
            if (!hasItems) return null;
            return (
              <button
                key={store}
                onClick={() => setFilterStore(filterStore === store ? null : store)}
                className="px-3 py-1.5 rounded-xl whitespace-nowrap transition-all"
                style={{
                  background: filterStore === store ? STORE_COLORS[store] : '#ffffff',
                  color: filterStore === store ? 'white' : '#6b7280',
                  border: `1px solid ${filterStore === store ? 'transparent' : '#e5e7eb'}`,
                  fontSize: '12px',
                  fontWeight: filterStore === store ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {store}
              </button>
            );
          })}
        </div>
      )}

      {/* Grocery list */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
      >
        {/* To buy section */}
        {uncheckedItems.length > 0 && (
          <div>
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ borderBottom: '1px solid #f3f4f6' }}
            >
              <ShoppingBag size={14} style={{ color: COLORS.pink }} />
              <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                To Buy ({uncheckedItems.length})
              </span>
            </div>
            <AnimatePresence>
              {uncheckedItems.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAFBFF] transition-colors group"
                  style={{ borderBottom: '1px solid #f9fafb' }}
                >
                  <button
                    onClick={() => toggleGroceryItem(item.id)}
                    className="flex-shrink-0 hover:scale-110 transition-transform"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Circle size={20} style={{ color: '#d1d5db' }} />
                  </button>
                  <span className="flex-1" style={{ color: '#111111', fontSize: '14px' }}>{item.name}</span>
                  {item.store && (
                    <span
                      className="px-2 py-0.5 rounded-lg"
                      style={{
                        background: `${STORE_COLORS[item.store] || '#9ca3af'}15`,
                        color: STORE_COLORS[item.store] || '#9ca3af',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {item.store}
                    </span>
                  )}
                  <button
                    onClick={() => deleteGroceryItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                    style={{ background: '#fee2e2', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} style={{ color: '#ef4444' }} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Bought section */}
        {checkedItems.length > 0 && (
          <div>
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid #f3f4f6', borderTop: uncheckedItems.length > 0 ? '2px solid #f3f4f6' : 'none' }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} style={{ color: COLORS.teal }} />
                <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Already Bought ({checkedItems.length})
                </span>
              </div>
              {checkedItems.length > 0 && (
                <div className="relative">
                  {showClearConfirm ? (
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>Clear all bought?</span>
                      <button
                        onClick={() => { clearCheckedItems(); setShowClearConfirm(false); }}
                        className="px-2 py-1 rounded-lg"
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2 py-1 rounded-lg"
                        style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="px-3 py-1 rounded-lg hover:opacity-80 transition-opacity flex items-center gap-1"
                      style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', cursor: 'pointer', fontSize: '11px' }}
                    >
                      <X size={10} />
                      Clear bought
                    </button>
                  )}
                </div>
              )}
            </div>
            <AnimatePresence>
              {checkedItems.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFBFF] transition-colors group"
                  style={{ borderBottom: '1px solid #f9fafb' }}
                >
                  <button
                    onClick={() => toggleGroceryItem(item.id)}
                    className="flex-shrink-0 hover:scale-110 transition-transform"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <CheckCircle2 size={20} style={{ color: COLORS.teal }} />
                  </button>
                  <span className="flex-1 line-through" style={{ color: '#9ca3af', fontSize: '14px' }}>{item.name}</span>
                  {item.store && (
                    <span
                      className="px-2 py-0.5 rounded-lg opacity-50"
                      style={{
                        background: `${STORE_COLORS[item.store] || '#9ca3af'}15`,
                        color: STORE_COLORS[item.store] || '#9ca3af',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {item.store}
                    </span>
                  )}
                  <button
                    onClick={() => deleteGroceryItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                    style={{ background: '#fee2e2', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} style={{ color: '#ef4444' }} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {groceryItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#F8F9FF' }}>
              <ShoppingCart size={28} style={{ color: '#d1d5db' }} />
            </div>
            <p style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 500 }}>Your grocery list is empty</p>
            <p style={{ color: '#d1d5db', fontSize: '12px', marginTop: '4px' }}>Add items above to get started!</p>
          </div>
        )}

        {filteredItems.length === 0 && groceryItems.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Package size={28} style={{ color: '#d1d5db', marginBottom: '8px' }} />
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>No items for this store filter</p>
          </div>
        )}
      </motion.div>

      {/* Suggested grocery list based on recipes */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 rounded-2xl p-5"
        style={{ background: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} style={{ color: COLORS.pink }} />
          <h2 style={{ color: '#111111', fontSize: '15px', fontWeight: 700 }}>Smart Suggestions</h2>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>— based on popular student recipes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { store: 'Lidl', items: ['Spaghetti 500g — €0.59', 'Minced beef 300g — €1.20', 'Onions 1kg — €0.59'], color: '#0050AA' },
            { store: 'Aldi', items: ['Red lentils 500g — €0.89', 'Canned tomatoes (3x) — €1.17', 'Curry paste — €0.89'], color: '#E5002B' },
            { store: 'Albert Heijn', items: ['Frozen vegetables 1kg — €1.49', 'Avocados 2x — €1.29', 'Whole grain bread — €1.09'], color: '#00A0E2' },
            { store: 'Any Store', items: ['Eggs 12-pack — ~€2.49', 'Basmati rice 1kg — ~€1.39', 'Garlic bulb — ~€0.49'], color: '#9ca3af' },
          ].map(({ store, items, color }) => (
            <div
              key={store}
              className="p-4 rounded-xl"
              style={{ background: `${color}08`, border: `1px solid ${color}20` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span style={{ color, fontSize: '13px', fontWeight: 700 }}>{store}</span>
              </div>
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1" style={{ borderBottom: i < items.length - 1 ? `1px solid ${color}15` : 'none' }}>
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>{item.split(' — ')[0]}</span>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#111111', fontSize: '12px', fontWeight: 600 }}>{item.split(' — ')[1]}</span>
                    <button
                      onClick={() => addGroceryItem(item.split(' — ')[0], store === 'Any Store' ? undefined : store)}
                      className="p-1 rounded-md hover:opacity-80 transition-opacity"
                      style={{ background: `${color}20`, border: 'none', cursor: 'pointer' }}
                    >
                      <Plus size={10} style={{ color }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
