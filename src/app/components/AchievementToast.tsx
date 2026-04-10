import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useConfetti } from '../hooks/useConfetti';
import { Star } from 'lucide-react';

export function AchievementToast() {
  const { newlyUnlocked, achievements, clearNewlyUnlocked, levelInfo } = useApp();
  const { achievement: fireAchievement, levelUp } = useConfetti();

  const toShow = achievements.filter(a => newlyUnlocked.includes(a.id));

  useEffect(() => {
    if (toShow.length > 0) {
      fireAchievement();
      const timer = setTimeout(clearNewlyUnlocked, 4000);
      return () => clearTimeout(timer);
    }
  }, [toShow.length]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toShow.map((ach, i) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.15 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl pointer-events-auto"
            style={{
              background: '#111',
              boxShadow: `0 8px 32px ${ach.color}40, 0 2px 8px rgba(0,0,0,0.3)`,
              border: `1.5px solid ${ach.color}40`,
              minWidth: '280px',
            }}
          >
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -6, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${ach.color}20`, border: `1.5px solid ${ach.color}40` }}
            >
              {ach.emoji}
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span style={{ color: ach.color, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Achievement Unlocked!</span>
              </div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>{ach.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{ach.description}</div>
            </div>

            {/* XP pill */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl flex-shrink-0"
              style={{ background: `${ach.color}20`, border: `1px solid ${ach.color}30` }}>
              <Star size={10} fill={ach.color} stroke="none" />
              <span style={{ color: ach.color, fontSize: '12px', fontWeight: 700 }}>+{ach.xpReward}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
