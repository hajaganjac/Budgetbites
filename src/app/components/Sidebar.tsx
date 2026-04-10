import React, { useState } from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard, ShoppingCart, X, Wand2, BookOpen, Trophy,
  Wallet, TrendingUp, Pencil, Settings, LogOut,
} from 'lucide-react';
import { useApp, AVATAR_EMOJIS } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileModal } from './ProfileModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const navItems = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard',        color: '#F24E6F' },
  { to: '/recipes',      icon: BookOpen,         label: 'Recipes',          color: '#29B6C5' },
  { to: '/generate',     icon: Wand2,            label: 'Recipe Generator', color: '#2196F3' },
  { to: '/grocery',      icon: ShoppingCart,     label: 'Grocery Notes',    color: '#f59e0b' },
  { to: '/achievements', icon: Trophy,           label: 'Achievements',     color: '#8b5cf6' },
];

export function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  const {
    weeklyBudget, remainingBudget, totalSpentThisWeek,
    totalCaloriesToday, calorieGoal,
    studentName, setStudentName, studentEmoji, setStudentEmoji,
    levelInfo, streak, achievements,
  } = useApp();

  const spentPct = Math.min(100, (totalSpentThisWeek / weeklyBudget) * 100);
  const calPct   = Math.min(100, (totalCaloriesToday / calorieGoal) * 100);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState(studentName);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const saveName = () => {
    if (nameInput.trim()) setStudentName(nameInput.trim());
    setEditingName(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      )}

      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto"
        style={{ width: '260px', background: '#111111', transform: isOpen ? 'translateX(0)' : 'translateX(-260px)' }}
      >
        {/* ── Logo ──────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #F24E6F, #29B6C5)' }}>
              🍝
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.3px' }}>BudgetBites</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>Student Kitchen</div>
            </div>
          </div>
          <button className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors" onClick={onClose} style={{ color: 'rgba(255,255,255,0.5)' }}>
            <X size={18} />
          </button>
        </div>

        {/* ── Nav ───────────────────────────────────────── */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-0">
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>
            Menu
          </div>

          {navItems.map(({ to, icon: Icon, label, color }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '12px', marginBottom: '2px',
                background: isActive ? `${color}18` : 'transparent',
                textDecoration: 'none', transition: 'all 0.2s',
              })}>
              {({ isActive }) => (
                <>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: isActive ? `${color}25` : 'rgba(255,255,255,0.06)' }}>
                    <Icon size={16} style={{ color: isActive ? color : 'rgba(255,255,255,0.45)' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400, color: isActive ? '#fff' : 'rgba(255,255,255,0.55)', flex: 1 }}>
                    {label}
                  </span>
                  {to === '/achievements' && unlockedCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md" style={{ background: '#8b5cf620', color: '#8b5cf6', fontSize: '10px', fontWeight: 700 }}>
                      {unlockedCount}
                    </span>
                  )}
                  {isActive && <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
                </>
              )}
            </NavLink>
          ))}

          {/* ── This Week stats ─────────────────────────── */}
          <div className="mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '12px' }}>
              This Week
            </div>

            {/* Budget */}
            <div className="mx-1 p-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wallet size={12} style={{ color: '#F24E6F' }} />
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>Budget</span>
                </div>
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>€{remainingBudget.toFixed(2)} left</span>
              </div>
              <div className="w-full rounded-full" style={{ background: 'rgba(255,255,255,0.08)', height: '4px' }}>
                <div className="rounded-full transition-all duration-500"
                  style={{ width: `${spentPct}%`, height: '4px', background: spentPct > 80 ? '#F24E6F' : 'linear-gradient(90deg,#29B6C5,#2196F3)' }} />
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>€{totalSpentThisWeek.toFixed(2)} spent</span>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>€{weeklyBudget}</span>
              </div>
            </div>

            {/* Calories */}
            <div className="mx-1 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={12} style={{ color: '#29B6C5' }} />
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>Calories</span>
                </div>
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{totalCaloriesToday} kcal</span>
              </div>
              <div className="w-full rounded-full" style={{ background: 'rgba(255,255,255,0.08)', height: '4px' }}>
                <div className="rounded-full transition-all duration-500"
                  style={{ width: `${calPct}%`, height: '4px', background: calPct > 100 ? '#F24E6F' : 'linear-gradient(90deg,#F24E6F,#2196F3)' }} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', marginTop: '4px' }}>Goal: {calorieGoal} kcal</div>
            </div>
          </div>
        </nav>

        {/* ── Profile footer ─────────────────────────────── */}
        <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Streak + Level row */}
          <div className="flex gap-2 mb-3">
            <motion.div
              animate={streak >= 1 ? { scale: [1, 1.04, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: streak >= 3 ? 'rgba(255,122,0,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${streak >= 3 ? 'rgba(255,122,0,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
              <span style={{ fontSize: '16px' }}>{streak >= 3 ? '🔥' : streak >= 1 ? '✨' : '💤'}</span>
              <div>
                <div style={{ color: streak >= 1 ? '#ff9a3c' : 'rgba(255,255,255,0.3)', fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>{streak}d</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>streak</div>
              </div>
            </motion.div>

            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: `${levelInfo.color}15`, border: `1px solid ${levelInfo.color}30` }}>
              <span style={{ fontSize: '16px' }}>⭐</span>
              <div>
                <div style={{ color: levelInfo.color, fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>Lv.{levelInfo.level}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{levelInfo.xp} XP</div>
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div className="mx-1 mb-3">
            <div className="flex justify-between mb-1">
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>{levelInfo.title}</span>
              <span style={{ color: levelInfo.color, fontSize: '10px', fontWeight: 600 }}>{Math.round(levelInfo.xpProgress)}%</span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', height: '5px' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${levelInfo.xpProgress}%` }} transition={{ duration: 1 }}
                style={{ height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}99)` }}
              />
            </div>
          </div>

          {/* Student profile — click opens ProfileModal */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full rounded-xl p-3 text-left transition-all hover:opacity-80 group"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', marginBottom: '8px' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 relative"
                style={{ background: 'linear-gradient(135deg,#F24E6F40,#2196F340)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {studentEmoji}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: '#F24E6F', border: '1px solid #111' }}>
                  <Pencil size={8} color="#fff" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{studentName}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{levelInfo.title}</div>
              </div>
              <Settings size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            </div>
          </button>

          {/* Logout button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{
              background: 'rgba(242,78,111,0.12)',
              border: '1px solid rgba(242,78,111,0.25)',
              color: '#F24E6F',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <LogOut size={14} />
            Log Out
          </motion.button>
        </div>
      </aside>

      {/* Profile modal */}
      <ProfileModal open={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}