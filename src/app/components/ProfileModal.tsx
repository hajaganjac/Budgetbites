import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Camera, Flame, Target, Star } from 'lucide-react';
import { useApp, AVATAR_EMOJIS } from '../context/AppContext';

const THEME_EMOJIS = ['🍕','🥗','🍜','🌮','🥘','🍱','🧆','🫕','🫔','🍛','🥙','🥚'];

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const {
    studentName, setStudentName,
    studentEmoji, setStudentEmoji,
    calorieGoal, setCalorieGoal,
    weeklyBudget, setWeeklyBudget,
    levelInfo, streak, cookedMeals, totalSaved, achievements,
  } = useApp();

  const [name, setName] = useState(studentName);
  const [emoji, setEmoji] = useState(studentEmoji);
  const [calories, setCalories] = useState(calorieGoal);
  const [budget, setBudget] = useState(weeklyBudget);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setStudentName(name.trim() || studentName);
    setStudentEmoji(emoji);
    setCalorieGoal(calories);
    setWeeklyBudget(budget);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const unlockedAch = achievements.filter(a => a.unlocked).length;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 9998,
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
            }}
          />

          {/* Modal — truly centered using translate trick */}
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              style={{
                width: '100%',
                maxWidth: 520,
                maxHeight: '90vh',
                overflow: 'auto',
                background: '#fff',
                borderRadius: 28,
                boxShadow: '0 32px 80px rgba(0,0,0,0.30)',
                pointerEvents: 'all',
              }}
            >
              {/* ── Header ──────────────────────────────────── */}
              <div style={{ padding: '24px 28px 0' }}>
                <div className="flex items-center justify-between">
                  <h2 style={{ color: '#111', fontSize: 20, fontWeight: 800 }}>✏️ Edit Profile</h2>
                  <button onClick={onClose}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* ── Level banner ────────────────────────────── */}
              <div style={{ padding: '16px 28px 0' }}>
                <div className="rounded-2xl p-4 relative overflow-hidden"
                  style={{ background: '#111' }}>
                  <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at top right, ${levelInfo.color}25 0%, transparent 60%)`, pointerEvents: 'none' }} />
                  <div className="flex items-center gap-3 relative">
                    {/* Big avatar */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl relative flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.15)' }}>
                      {emoji}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: levelInfo.color, color: '#fff', fontSize: '11px', fontWeight: 800, border: '2px solid #111' }}>
                        {levelInfo.level}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{name || studentName}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full" style={{ background: `${levelInfo.color}25`, color: levelInfo.color, fontSize: '11px', fontWeight: 700 }}>
                          {levelInfo.title}
                        </span>
                        {streak >= 2 && (
                          <span style={{ color: '#ff9a3c', fontSize: '12px', fontWeight: 600 }}>🔥 {streak}d streak</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div style={{ color: levelInfo.color, fontSize: 20, fontWeight: 900 }}>{levelInfo.xp}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>XP total</div>
                    </div>
                  </div>
                  {/* XP bar */}
                  <div style={{ marginTop: 12 }}>
                    <div className="w-full rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(255,255,255,0.1)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${levelInfo.xpProgress}%` }} transition={{ duration: 0.8 }}
                        style={{ height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}99)` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{levelInfo.xp} XP</span>
                      <span style={{ color: levelInfo.color, fontSize: '10px', fontWeight: 600 }}>{levelInfo.xpForNext} XP for Lv.{levelInfo.level + 1}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Mini stats row ───────────────────────────── */}
              <div style={{ padding: '14px 28px 0' }}>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: '🍳', label: 'Meals',     value: cookedMeals.length },
                    { icon: '💰', label: 'Saved',     value: `€${totalSaved.toFixed(0)}` },
                    { icon: '🏅', label: 'Badges',    value: `${unlockedAch}/${achievements.length}` },
                    { icon: '🔥', label: 'Streak',    value: `${streak}d` },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: '#F8F9FF', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div style={{ fontSize: '18px', marginBottom: '2px' }}>{s.icon}</div>
                      <div style={{ color: '#111', fontSize: '15px', fontWeight: 800 }}>{s.value}</div>
                      <div style={{ color: '#9ca3af', fontSize: '10px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Form fields ──────────────────────────────── */}
              <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Name */}
                <div>
                  <label style={{ color: '#374151', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                    Your Name
                  </label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '2px solid #e5e7eb', background: '#fff', fontSize: 15,
                      outline: 'none', fontFamily: 'inherit', color: '#111', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#F24E6F')}
                    onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                  />
                </div>

                {/* Avatar emoji */}
                <div>
                  <label style={{ color: '#374151', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                    Avatar <Camera size={12} style={{ display: 'inline', marginLeft: 4, color: '#9ca3af' }} />
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {AVATAR_EMOJIS.map(e => (
                      <motion.button key={e} whileTap={{ scale: 0.82 }} whileHover={{ scale: 1.18 }} onClick={() => setEmoji(e)}
                        style={{
                          width: 44, height: 44, borderRadius: 13,
                          border: emoji === e ? '2.5px solid #F24E6F' : '2px solid #e5e7eb',
                          background: emoji === e ? '#fff5f7' : 'white', cursor: 'pointer',
                          fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: emoji === e ? '0 0 0 4px rgba(242,78,111,0.14)' : 'none',
                          transition: 'all 0.15s',
                        }}>
                        {e}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Calorie goal */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label style={{ color: '#374151', fontSize: 13, fontWeight: 600 }}>
                      <Flame size={13} style={{ display: 'inline', color: '#f59e0b', marginRight: 5 }} />
                      Daily Calorie Goal
                    </label>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>{calories} kcal</span>
                  </div>
                  <input type="range" min={1200} max={3500} step={50} value={calories} onChange={e => setCalories(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b' }} />
                  <div className="flex justify-between mt-1" style={{ color: '#9ca3af', fontSize: '11px' }}>
                    <span>1,200 kcal</span><span>2,000 kcal</span><span>3,500 kcal</span>
                  </div>
                </div>

                {/* Weekly budget */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label style={{ color: '#374151', fontSize: 13, fontWeight: 600 }}>
                      <Target size={13} style={{ display: 'inline', color: '#F24E6F', marginRight: 5 }} />
                      Weekly Grocery Budget
                    </label>
                    <span style={{ color: '#F24E6F', fontWeight: 700 }}>€{budget}</span>
                  </div>
                  <input type="range" min={10} max={80} step={1} value={budget} onChange={e => setBudget(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#F24E6F' }} />
                  <div className="flex justify-between mt-1" style={{ color: '#9ca3af', fontSize: '11px' }}>
                    <span>€10</span><span>€40</span><span>€80</span>
                  </div>
                </div>
              </div>

              {/* ── Save button ──────────────────────────────── */}
              <div style={{ padding: '0 28px 28px', display: 'flex', gap: 10 }}>
                <button onClick={onClose}
                  style={{ flex: 1, padding: '13px 0', borderRadius: 14, border: '2px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  style={{
                    flex: 2, padding: '13px 0', borderRadius: 14, border: 'none',
                    background: saved ? 'linear-gradient(135deg,#22c55e,#4ade80)' : 'linear-gradient(135deg,#F24E6F,#29B6C5)',
                    color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 16px rgba(242,78,111,0.28)',
                    transition: 'background 0.3s',
                  }}
                >
                  {saved ? <><Check size={16} /> Saved!</> : <><Star size={15} /> Save Changes</>}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}