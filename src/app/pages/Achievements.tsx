import React from 'react';
import { motion } from 'motion/react';
import { Lock, Trophy, Star, Zap, TrendingUp } from 'lucide-react';
import { useApp, AVATAR_EMOJIS } from '../context/AppContext';

const C = { pink: '#F24E6F', teal: '#29B6C5', blue: '#2196F3' };

const LEVEL_BADGE_LABELS = [
  'Hungry Student', 'Kitchen Rookie', 'Budget Chef',
  'Flavor Hunter', 'Iron Chef', 'Kitchen Legend',
];
const LEVEL_COLORS = ['#9ca3af', '#29B6C5', '#2196F3', '#8b5cf6', '#F24E6F', '#f59e0b'];

function AchievementCard({ ach, index }: { ach: ReturnType<typeof useApp>['achievements'][0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden"
      style={{
        background: ach.unlocked ? '#fff' : '#f9fafb',
        boxShadow: ach.unlocked ? `0 4px 20px ${ach.color}22` : '0 2px 8px rgba(0,0,0,0.04)',
        border: ach.unlocked ? `1.5px solid ${ach.color}30` : '1.5px solid #f3f4f6',
        opacity: ach.unlocked ? 1 : 0.75,
      }}
    >
      {/* Subtle bg glow for unlocked */}
      {ach.unlocked && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse at top left, ${ach.color}08 0%, transparent 65%)`,
        }} />
      )}

      {/* Top row */}
      <div className="flex items-start justify-between">
        <motion.div
          animate={ach.unlocked ? { rotate: [0, -8, 8, 0] } : {}}
          transition={{ duration: 0.6, delay: index * 0.05 + 0.3 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: ach.unlocked ? `linear-gradient(135deg, ${ach.color}22, ${ach.color}10)` : '#f3f4f6',
            border: ach.unlocked ? `1.5px solid ${ach.color}30` : '1.5px solid #e5e7eb',
            filter: ach.unlocked ? 'none' : 'grayscale(1)',
          }}
        >
          {ach.unlocked ? ach.emoji : <Lock size={18} style={{ color: '#d1d5db' }} />}
        </motion.div>

        {ach.unlocked && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.05 + 0.4, type: 'spring' }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: `${ach.color}18`, border: `1px solid ${ach.color}30` }}
          >
            <Star size={10} fill={ach.color} stroke="none" />
            <span style={{ color: ach.color, fontSize: '11px', fontWeight: 700 }}>+{ach.xpReward} XP</span>
          </motion.div>
        )}
      </div>

      {/* Text */}
      <div>
        <h3 style={{ color: ach.unlocked ? '#111' : '#9ca3af', fontSize: '15px', fontWeight: 700, marginBottom: '3px' }}>
          {ach.title}
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '12px', lineHeight: 1.4 }}>{ach.description}</p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between mb-1.5">
          <span style={{ color: '#9ca3af', fontSize: '11px' }}>{ach.progressLabel}</span>
          <span style={{ color: ach.unlocked ? ach.color : '#9ca3af', fontSize: '11px', fontWeight: 600 }}>
            {ach.unlocked ? '✅ Unlocked' : `${Math.round(ach.progress ?? 0)}%`}
          </span>
        </div>
        <div className="w-full rounded-full overflow-hidden" style={{ height: '6px', background: '#f3f4f6' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ach.progress ?? 0}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 + 0.2, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: '999px',
              background: ach.unlocked ? `linear-gradient(90deg, ${ach.color}, ${ach.color}aa)` : '#e5e7eb',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function Achievements() {
  const { achievements, levelInfo, streak, cookedMeals, totalSaved, studentName, studentEmoji, favorites } = useApp();

  const unlocked = achievements.filter(a => a.unlocked).length;
  const totalXP   = cookedMeals.length * 25;
  const nextLevel = levelInfo.level < 6 ? levelInfo.xpForNext : null;

  return (
    <div className="p-6 max-w-[1200px] mx-auto">

      {/* ── Header ───────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#F24E6F)' }}>
            🏆
          </div>
          <div>
            <h1 style={{ color: '#111', fontSize: '24px', fontWeight: 800 }}>Achievements</h1>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>{unlocked}/{achievements.length} unlocked · Keep cooking to earn more!</p>
          </div>
        </div>
      </motion.div>

      {/* ── Profile card ─────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="rounded-3xl p-6 mb-6 relative overflow-hidden"
        style={{ background: '#111', color: '#fff' }}>

        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: `radial-gradient(circle, ${levelInfo.color}22 0%, transparent 70%)` }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '30%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, #29B6C518 0%, transparent 70%)' }} />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.15)' }}>
              {studentEmoji}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: levelInfo.color, fontSize: '11px', fontWeight: 800, color: '#fff', border: '2px solid #111' }}>
              {levelInfo.level}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '2px' }}>{studentName}</h2>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1 rounded-full" style={{ background: `${levelInfo.color}25`, color: levelInfo.color, fontSize: '12px', fontWeight: 700, border: `1px solid ${levelInfo.color}40` }}>
                {levelInfo.title}
              </span>
              {streak >= 3 && (
                <span className="px-3 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(255,122,0,0.2)', color: '#ff7a00', fontSize: '12px', fontWeight: 700 }}>
                  🔥 {streak}-day streak
                </span>
              )}
            </div>

            {/* XP bar */}
            <div className="mb-1 flex justify-between">
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                Level {levelInfo.level} · {totalXP} XP total
              </span>
              {nextLevel && (
                <span style={{ color: levelInfo.color, fontSize: '12px', fontWeight: 600 }}>
                  {nextLevel} XP for Level {levelInfo.level + 1}
                </span>
              )}
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: '10px', background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${levelInfo.xpProgress}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                style={{ height: '100%', borderRadius: '999px', background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}aa)` }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 flex-shrink-0">
            {[
              { label: 'Meals Cooked', value: cookedMeals.length, icon: '🍳' },
              { label: 'Money Saved',  value: `€${totalSaved.toFixed(0)}`, icon: '💰' },
              { label: 'Favourites',   value: favorites.length, icon: '❤️' },
              { label: 'Badges',       value: `${unlocked}/${achievements.length}`, icon: '🏅' },
            ].map(s => (
              <div key={s.label} className="px-4 py-2 rounded-xl text-center"
                style={{ background: 'rgba(255,255,255,0.07)', minWidth: '100px' }}>
                <div style={{ fontSize: '16px' }}>{s.icon}</div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Level Roadmap ─────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 mb-6"
        style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#111', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>🗺️ Level Roadmap</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {LEVEL_BADGE_LABELS.map((title, i) => {
            const reached = levelInfo.level > i + 1;
            const current = levelInfo.level === i + 1;
            const color = LEVEL_COLORS[i];
            return (
              <React.Fragment key={title}>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ minWidth: '80px' }}>
                  <motion.div
                    animate={current ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                      background: reached || current ? `linear-gradient(135deg, ${color}30, ${color}15)` : '#f3f4f6',
                      border: current ? `2px solid ${color}` : reached ? `1.5px solid ${color}50` : '1.5px solid #e5e7eb',
                      position: 'relative',
                    }}>
                    <span style={{ fontSize: '18px', filter: reached || current ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                      {['🥚','👶','🍳','🌟','⚡','👑'][i]}
                    </span>
                    {reached && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: color, fontSize: '10px' }}>✓</div>
                    )}
                  </motion.div>
                  <div style={{ color: reached || current ? '#111' : '#9ca3af', fontSize: '10px', fontWeight: current ? 700 : 400, textAlign: 'center', lineHeight: 1.2 }}>{title}</div>
                  <div style={{ color: LEVEL_COLORS[i], fontSize: '10px', fontWeight: 600 }}>Lv. {i + 1}</div>
                </div>
                {i < LEVEL_BADGE_LABELS.length - 1 && (
                  <div className="flex-1 h-px" style={{ minWidth: '12px', background: i < levelInfo.level - 1 ? `linear-gradient(90deg, ${LEVEL_COLORS[i]}, ${LEVEL_COLORS[i + 1]})` : '#e5e7eb', marginBottom: '24px' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>

      {/* ── Badges Grid ──────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <h2 style={{ color: '#111', fontSize: '18px', fontWeight: 800 }}>🏅 All Badges</h2>
        <span className="px-3 py-1 rounded-full" style={{ background: '#F24E6F15', color: C.pink, fontSize: '12px', fontWeight: 600 }}>
          {unlocked} / {achievements.length} earned
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Unlocked first */}
        {[...achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
          .map((ach, i) => <AchievementCard key={ach.id} ach={ach} index={i} />)}
      </div>

      {/* ── Motivational footer ──────────────────────────── */}
      {unlocked < achievements.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-8 rounded-2xl p-5 text-center"
          style={{ background: 'linear-gradient(135deg,#F24E6F08,#29B6C508)', border: '1px dashed #F24E6F30' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            🚀 <strong>{achievements.length - unlocked} more badges</strong> to unlock — keep cooking every day to earn them all!
          </p>
        </motion.div>
      )}
    </div>
  );
}
