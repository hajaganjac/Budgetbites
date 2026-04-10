import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  Wallet, Flame, ChefHat, Zap, CheckCircle2,
  Trash2, TrendingUp, ArrowRight, Sparkles, Quote, Trophy,
} from 'lucide-react';
import { useApp, ALL_RECIPES } from '../context/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import { useConfetti } from '../hooks/useConfetti';

const C = { pink: '#F24E6F', teal: '#29B6C5', blue: '#2196F3' };
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AVG_TAKEAWAY = 10;

const ALL_QUOTES = [
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

function StatCard({ icon: Icon, label, value, sub, gradient, delay = 0 }: {
  icon: React.ElementType; label: string; value: string; sub?: string; gradient: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: gradient }}>
          <Icon size={18} color="#fff" />
        </div>
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>{label}</span>
      </div>
      <div>
        <div style={{ color: '#111', fontSize: '22px', fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
        {sub && <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const {
    weeklyBudget, setWeeklyBudget, calorieGoal, setCalorieGoal,
    cookedMeals, uncookMeal, cookMeal,
    totalCaloriesToday, totalSpentThisWeek, remainingBudget, todayMeals,
    streak, totalSaved, levelInfo, achievements,
    studentName, dailyQuote,
  } = useApp();

  const { burst } = useConfetti();
  const prevMealCount = useRef(todayMeals.length);

  // Burst confetti when a meal is logged on this page
  useEffect(() => {
    if (todayMeals.length > prevMealCount.current) {
      burst();
    }
    prevMealCount.current = todayMeals.length;
  }, [todayMeals.length]);

  const spentPct = Math.min(100, (totalSpentThisWeek / weeklyBudget) * 100);
  const calPct   = Math.min(100, (totalCaloriesToday / calorieGoal) * 100);
  const unlockedAch = achievements.filter(a => a.unlocked).length;

  const donutData = [
    { name: 'Consumed', value: Math.min(totalCaloriesToday, calorieGoal), fill: C.pink },
    {
      name: totalCaloriesToday > calorieGoal ? 'Over' : 'Remaining',
      value: totalCaloriesToday > calorieGoal ? totalCaloriesToday - calorieGoal : calorieGoal - totalCaloriesToday,
      fill: totalCaloriesToday > calorieGoal ? '#ff8c00' : '#eef0f8',
    },
  ];

  const today = new Date();
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (6 - i));
    const spent = cookedMeals.filter(m => new Date(m.cookedAt).toDateString() === d.toDateString()).reduce((s, m) => s + m.price, 0);
    return { day: DAY_LABELS[d.getDay()], spent: parseFloat(spent.toFixed(2)), isToday: d.toDateString() === today.toDateString() };
  });

  const quickPicks = [...ALL_RECIPES].sort((a, b) => a.price - b.price).slice(0, 3);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const budgetTip =
    weeklyBudget < 25 ? '🔥 Tight budget! Lean on lentils, eggs and oats.' :
    weeklyBudget < 35 ? '👍 Good budget! Mix proteins with pantry staples.' :
    weeklyBudget < 50 ? '🎉 Comfortable! Enjoy variety across all meal types.' :
    '⭐ Great budget! Explore premium ingredients too.';

  const streakMessage =
    streak === 0 ? 'Cook something today to start your streak!' :
    streak < 3   ? `${streak} day streak — keep it going! 💪` :
    streak < 7   ? `🔥 ${streak} days strong — you're on fire!` :
    `🏆 ${streak} day legend streak — absolutely incredible!`;

  /* Quote slider state */
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteDir, setQuoteDir] = useState(1); // 1 = forward, -1 = back

  useEffect(() => {
    const t = setInterval(() => {
      setQuoteDir(1);
      setQuoteIdx(i => (i + 1) % ALL_QUOTES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const goToQuote = (idx: number) => {
    setQuoteDir(idx > quoteIdx ? 1 : -1);
    setQuoteIdx(idx);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">

      {/* ── Header ──────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 style={{ color: '#111', fontSize: '24px', fontWeight: 800 }}>
              {greeting}, {studentName}! 👋
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '2px' }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Link to="/generate"
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#F24E6F,#29B6C5)', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
            <Sparkles size={14} /> Generate a recipe
          </Link>
        </div>
      </motion.div>

      {/* ── Daily quote ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#111 0%,#1a1a2e 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
      >
        {/* Subtle pink glow */}
        <div style={{ position: 'absolute', top: -30, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,78,111,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="p-4 flex items-start gap-3">
          {/* Big decorative quote mark */}
          <span style={{ color: C.pink, fontSize: '28px', lineHeight: 1, flexShrink: 0, fontFamily: 'Georgia, serif', marginTop: '2px', opacity: 0.9 }}>&ldquo;</span>

          {/* Sliding text */}
          <div style={{ flex: 1, minHeight: 60, position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence mode="wait" custom={quoteDir}>
              <motion.div
                key={quoteIdx}
                custom={quoteDir}
                initial={(dir: number) => ({ opacity: 0, y: dir > 0 ? 18 : -18 })}
                animate={{ opacity: 1, y: 0 }}
                exit={(dir: number) => ({ opacity: 0, y: dir > 0 ? -18 : 18 })}
                transition={{ duration: 0.38, ease: 'easeInOut' }}
              >
                <p style={{ color: '#fff', fontSize: '14px', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '6px' }}>
                  "{ALL_QUOTES[quoteIdx].text}"
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>— {ALL_QUOTES[quoteIdx].author}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0, justifyContent: 'center', paddingTop: 6 }}>
            {ALL_QUOTES.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => goToQuote(i)}
                animate={{ height: i === quoteIdx ? 16 : 5, opacity: i === quoteIdx ? 1 : 0.28, background: i === quoteIdx ? C.pink : '#ffffff' }}
                transition={{ duration: 0.22 }}
                style={{ width: 4, borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0 }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── 5 stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={Wallet}     label="Weekly Budget"     value={`€${weeklyBudget}`}                  sub={`€${(weeklyBudget/7).toFixed(2)}/day`}        gradient="linear-gradient(135deg,#F24E6F,#ff7a92)"  delay={0}    />
        <StatCard icon={TrendingUp} label="Spent This Week"   value={`€${totalSpentThisWeek.toFixed(2)}`} sub={`${spentPct.toFixed(0)}% of budget`}          gradient="linear-gradient(135deg,#2196F3,#42a8f5)"  delay={0.05} />
        <StatCard icon={Zap}        label="Remaining"         value={`€${remainingBudget.toFixed(2)}`}    sub={`${(100-spentPct).toFixed(0)}% left`}         gradient="linear-gradient(135deg,#29B6C5,#4dd0dd)"  delay={0.10} />
        <StatCard icon={Flame}      label="Calories Today"    value={`${totalCaloriesToday}`}             sub={`Goal: ${calorieGoal} kcal`}                  gradient="linear-gradient(135deg,#f59e0b,#fbbf24)"  delay={0.15} />
        <StatCard icon={Trophy}     label="Achievements"      value={`${unlockedAch}/${achievements.length}`} sub="badges earned"                           gradient="linear-gradient(135deg,#8b5cf6,#a78bfa)"  delay={0.20} />
      </div>

      {/* ── Streak + Money Saved row ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

        {/* Streak card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: streak >= 3 ? 'linear-gradient(135deg,#1a0a00,#2a1000)' : '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: streak >= 3 ? '1px solid rgba(255,122,0,0.25)' : '1px solid rgba(0,0,0,0.05)' }}>
          {streak >= 3 && (
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(255,122,0,0.15) 0%, transparent 60%)' }} />
          )}
          <div className="flex items-center gap-4">
            <motion.div
              animate={streak >= 1 ? { scale: [1, 1.12, 1], rotate: [0, -5, 5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2.5 }}
              style={{ fontSize: '52px', lineHeight: 1 }}>
              {streak >= 7 ? '🏆' : streak >= 3 ? '🔥' : streak >= 1 ? '✨' : '💤'}
            </motion.div>
            <div>
              <div style={{ color: streak >= 1 ? (streak >= 3 ? '#ff9a3c' : C.teal) : '#9ca3af', fontSize: '36px', fontWeight: 900, lineHeight: 1 }}>
                {streak}<span style={{ fontSize: '16px', fontWeight: 400, marginLeft: '4px' }}>days</span>
              </div>
              <div style={{ color: streak >= 3 ? 'rgba(255,154,60,0.7)' : '#9ca3af', fontSize: '13px', marginTop: '2px' }}>
                {streakMessage}
              </div>
            </div>
          </div>
          {streak >= 3 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {Array.from({ length: Math.min(streak, 14) }, (_, i) => (
                <div key={i} className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                  style={{ background: 'rgba(255,122,0,0.2)', border: '1px solid rgba(255,122,0,0.3)' }}>
                  🔥
                </div>
              ))}
              {streak > 14 && <span style={{ color: 'rgba(255,154,60,0.6)', fontSize: '12px', alignSelf: 'center' }}>+{streak - 14} more</span>}
            </div>
          )}
        </motion.div>

        {/* Money Saved card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#0a1a0a,#0d260d)', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at bottom left, rgba(34,197,94,0.1) 0%, transparent 60%)' }} />
          <div className="flex items-start justify-between mb-2">
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>💰 Saved vs eating out</div>
              <div style={{ color: '#4ade80', fontSize: '38px', fontWeight: 900, lineHeight: 1 }}>
                €{totalSaved.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>avg takeaway</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 600 }}>€{AVG_TAKEAWAY}/meal</div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
            From {cookedMeals.length} home-cooked meals 🍳
          </div>
          <div className="mt-3 w-full rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(255,255,255,0.08)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totalSaved / 100) * 100)}%` }} transition={{ duration: 1 }}
              style={{ height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg,#22c55e,#4ade80)' }} />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '4px' }}>
            Goal: save €100 vs eating out ({Math.min(100, Math.round((totalSaved / 100) * 100))}%)
          </div>
        </motion.div>
      </div>

      {/* ── Main grid: sliders + chart | donut + cooked today ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Left col */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Budget + calorie sliders */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}
            className="rounded-2xl p-5"
            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h2 style={{ color: '#111', fontSize: '16px', fontWeight: 700 }}>Weekly Budget</h2>
                <p style={{ color: '#9ca3af', fontSize: '12px' }}>Drag to set your grocery budget</p>
              </div>
              <div className="px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg,#F24E6F,#ff7a92)', color: '#fff' }}>
                <span style={{ fontSize: '20px', fontWeight: 800 }}>€{weeklyBudget}</span>
              </div>
            </div>

            <input type="range" min={10} max={80} step={1} value={weeklyBudget} onChange={e => setWeeklyBudget(Number(e.target.value))} className="w-full mb-1" style={{ accentColor: C.pink }} />
            <div className="flex justify-between mb-4" style={{ color: '#9ca3af', fontSize: '11px' }}>
              {['€10', '€20', '€35', '€50', '€65', '€80'].map(l => <span key={l}>{l}</span>)}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: '#F8F9FF' }}>
              <span style={{ color: '#6b7280', fontSize: '13px' }}>{budgetTip}</span>
            </div>

            <div className="flex justify-between mb-1">
              <span style={{ color: '#6b7280', fontSize: '12px' }}>Budget used</span>
              <span style={{ color: '#111', fontSize: '12px', fontWeight: 600 }}>€{totalSpentThisWeek.toFixed(2)} / €{weeklyBudget}</span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: '10px', background: '#f3f4f6' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${spentPct}%` }} transition={{ duration: 0.8 }}
                style={{ height: '100%', borderRadius: '999px', background: spentPct > 85 ? 'linear-gradient(90deg,#F24E6F,#ff4757)' : 'linear-gradient(90deg,#29B6C5,#2196F3)' }} />
            </div>
            <div className="flex justify-between mt-1">
              <span style={{ color: '#9ca3af', fontSize: '11px' }}>{spentPct > 85 ? '⚠️ Running low!' : `${(100-spentPct).toFixed(0)}% remaining`}</span>
              <span style={{ color: C.teal, fontSize: '11px', fontWeight: 600 }}>€{remainingBudget.toFixed(2)} left</span>
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: '1px solid #f3f4f6' }}>
              <div className="flex justify-between mb-2">
                <span style={{ color: '#111', fontSize: '13px', fontWeight: 600 }}>Daily Calorie Goal</span>
                <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 700 }}>{calorieGoal} kcal</span>
              </div>
              <input type="range" min={1200} max={3500} step={50} value={calorieGoal} onChange={e => setCalorieGoal(Number(e.target.value))} className="w-full" style={{ accentColor: '#f59e0b' }} />
              <div className="flex justify-between" style={{ color: '#9ca3af', fontSize: '11px' }}><span>1200</span><span>2000</span><span>3500</span></div>
            </div>
          </motion.div>

          {/* Weekly chart */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.24 }}
            className="rounded-2xl p-5"
            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h2 style={{ color: '#111', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Weekly Spending</h2>
            <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '16px' }}>Daily food cost over the last 7 days</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
                <Tooltip formatter={v => [`€${v}`, 'Spent']} contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', fontSize: '12px' }} />
                <defs>
                  <linearGradient id="barBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#29B6C5" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#2196F3" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="barToday" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F24E6F" />
                    <stop offset="100%" stopColor="#ff7a92" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, i) => <Cell key={i} fill={entry.isToday ? 'url(#barToday)' : 'url(#barBase)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-4">

          {/* Calorie donut */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.20 }}
            className="rounded-2xl p-5"
            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h2 style={{ color: '#111', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Calories Today</h2>
            <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
              {totalCaloriesToday >= calorieGoal ? '⚠️ Over daily goal!' : `${calorieGoal - totalCaloriesToday} kcal remaining`}
            </p>
            <div className="relative flex justify-center">
              <PieChart width={180} height={180}>
                <Pie data={donutData} cx={90} cy={90} innerRadius={58} outerRadius={78} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                  {donutData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} kcal`, n]} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div style={{ color: '#111', fontSize: '20px', fontWeight: 800 }}>{totalCaloriesToday}</div>
                <div style={{ color: '#9ca3af', fontSize: '10px' }}>of {calorieGoal}</div>
                <div style={{ color: calPct >= 100 ? C.pink : C.teal, fontSize: '11px', fontWeight: 600 }}>{calPct.toFixed(0)}%</div>
              </div>
            </div>
            <div className="w-full rounded-full overflow-hidden mt-2" style={{ height: '6px', background: '#f3f4f6' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, calPct)}%` }} transition={{ duration: 0.8 }}
                style={{ height: '100%', borderRadius: '999px', background: calPct >= 100 ? '#F24E6F' : 'linear-gradient(90deg,#F24E6F,#f59e0b)' }} />
            </div>
          </motion.div>

          {/* Cooked today */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 }}
            className="rounded-2xl p-5 flex-1"
            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ color: '#111', fontSize: '16px', fontWeight: 700 }}>Cooked Today</h2>
              <span className="px-2 py-1 rounded-lg" style={{ background: '#F24E6F15', color: C.pink, fontSize: '11px', fontWeight: 600 }}>
                {todayMeals.length} meals
              </span>
            </div>
            {todayMeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <ChefHat size={28} style={{ opacity: 0.2, marginBottom: '8px' }} />
                <p style={{ color: '#9ca3af', fontSize: '13px' }}>No meals logged today</p>
                <Link to="/recipes" style={{ color: C.pink, fontSize: '12px', marginTop: '6px', textDecoration: 'none', fontWeight: 600 }}>Browse recipes →</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: '240px' }}>
                <AnimatePresence>
                  {todayMeals.map(meal => (
                    <motion.div key={meal.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                      className="flex items-center gap-2 p-2.5 rounded-xl"
                      style={{ background: '#F8F9FF', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#29B6C510' }}>
                        <CheckCircle2 size={14} style={{ color: C.teal }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ color: '#111', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meal.recipeName}</div>
                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>{meal.calories} kcal · €{meal.price.toFixed(2)}</div>
                      </div>
                      <button onClick={() => uncookMeal(meal.id)} className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ background: '#fee2e2', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={11} style={{ color: '#ef4444' }} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Quick picks ───────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ color: '#111', fontSize: '18px', fontWeight: 800 }}>Today's Cheapest Picks 🍽️</h2>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>Meals under €2 — perfect for your budget</p>
          </div>
          <Link to="/recipes" className="flex items-center gap-1 px-4 py-2 rounded-xl transition-all hover:opacity-80"
            style={{ background: '#F24E6F15', color: C.pink, textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
            See all recipes <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickPicks.map((recipe, i) => (
            <motion.div key={recipe.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 + i * 0.07 }}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="relative" style={{ height: '130px', overflow: 'hidden' }}>
                <ImageWithFallback src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45))' }} />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white" style={{ background: recipe.tagColor, fontSize: '10px', fontWeight: 600 }}>{recipe.tag}</div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-white" style={{ background: 'rgba(0,0,0,0.55)', fontSize: '11px', fontWeight: 700 }}>€{recipe.price.toFixed(2)}</div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 style={{ color: '#111', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{recipe.name}</h3>
                <div className="flex gap-2 mb-3 mt-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg" style={{ background: '#fff5f7', color: C.pink, fontSize: '11px', fontWeight: 600 }}>🔥 {recipe.calories} kcal</span>
                  <span className="px-2 py-0.5 rounded-lg" style={{ background: '#f0fafb', color: C.teal, fontSize: '11px', fontWeight: 600 }}>⏱ {recipe.time}</span>
                </div>
                <div className="mt-auto flex gap-2">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => cookMeal(recipe)}
                    className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5"
                    style={{ background: 'linear-gradient(135deg,#F24E6F,#29B6C5)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    <ChefHat size={13} /> Cook It!
                  </motion.button>
                  <Link to="/recipes" className="px-3 py-2 rounded-xl flex items-center justify-center"
                    style={{ background: '#F8F9FF', border: '1px solid #e5e7eb', color: '#6b7280', textDecoration: 'none', fontSize: '12px' }}>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}