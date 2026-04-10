import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, ArrowRight, ChefHat, Lock, User, Mail, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StoredUser {
  email: string;
  password: string;
  name: string;
  emoji: string;
}

// ─── Local "DB" helpers ───────────────────────────────────────────────────────
const USERS_KEY = 'budgetbites_users';

function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch (_e) { return []; }
}
function saveUser(u: StoredUser) {
  const users = getUsers().filter(x => x.email !== u.email);
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, u]));
}
function findUser(email: string, password: string): StoredUser | null {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password) ?? null;
}
function emailExists(email: string): boolean {
  return getUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
}

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATARS = ['👨‍🎓','👩‍🎓','🧑‍🍳','👨‍🍳','👩‍🍳','🧑‍💻','🦸','🧙'];
const FLOAT_FOODS = ['🍕','🥗','🍜','🌮','🥙','🍱','🧀','🥦','🍅','🌽','🧄','🍳','🥚','🫐'];

const QUOTES = [
  { text: "Good food is the foundation of genuine happiness.", author: "Auguste Escoffier" },
  { text: "Cooking is at once child's play and adult joy.", author: "Craig Claiborne" },
  { text: "Budget cooking is an art form. You're basically a student Picasso.", author: "BudgetBites" },
  { text: "Rice, beans, and a dream — the student holy trinity.", author: "Every broke student ever" },
  { text: "You don't need money to eat well. You need knowledge.", author: "BudgetBites" },
  { text: "Every great chef started with eggs and a broken pan.", author: "Kitchen wisdom" },
];

// ─── FloatingFood ─────────────────────────────────────────────────────────────
function FloatingFood({ emoji, x, dur, delay }: { emoji: string; x: number; dur: number; delay: number }) {
  return (
    <motion.div
      initial={{ y: '108vh', opacity: 0, rotate: 0, scale: 0.6 }}
      animate={{ y: '-8vh', opacity: [0, 0.55, 0.55, 0], rotate: [0, 180, 360], scale: [0.6, 1, 0.7] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear' }}
      style={{ position: 'absolute', left: `${x}%`, fontSize: '18px', pointerEvents: 'none', zIndex: 0 }}
    >
      {emoji}
    </motion.div>
  );
}

// ─── QuoteSlider ──────────────────────────────────────────────────────────────
function QuoteSlider() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % QUOTES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 290 }}>
      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.11)',
        borderRadius: 20,
        padding: '20px 22px 18px',
        position: 'relative',
        minHeight: 118,
        backdropFilter: 'blur(8px)',
      }}>
        {/* Pink quote mark */}
        <div style={{
          color: '#F24E6F', fontSize: 30, lineHeight: 1,
          marginBottom: 8, fontFamily: 'Georgia, serif', opacity: 0.9, userSelect: 'none',
        }}>
          &ldquo;
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <p style={{
              color: 'rgba(255,255,255,0.88)', fontSize: '13px',
              lineHeight: 1.65, margin: 0, marginBottom: 10, fontStyle: 'italic',
            }}>
              "{QUOTES[idx].text}"
            </p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', margin: 0, fontWeight: 500 }}>
              — {QUOTES[idx].author}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12, alignItems: 'center' }}>
        {QUOTES.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setIdx(i)}
            animate={{
              width: i === idx ? 20 : 6,
              opacity: i === idx ? 1 : 0.3,
            }}
            transition={{ duration: 0.25 }}
            style={{
              height: 6, borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0,
              background: i === idx ? '#F24E6F' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SpeechBubble ─────────────────────────────────────────────────────────────
function SpeechBubble({ text }: { text: string }) {
  return (
    <AnimatePresence mode="wait">
      {text && (
        <motion.div
          key={text}
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 6 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          style={{
            background: 'white', borderRadius: 16, padding: '10px 16px',
            fontSize: '14px', fontWeight: 600, color: '#111',
            boxShadow: '0 6px 24px rgba(0,0,0,0.16)', border: '2px solid #f0f0f5',
            whiteSpace: 'nowrap', position: 'relative', marginBottom: 14,
            maxWidth: 240, textAlign: 'center', lineHeight: 1.4,
          }}
        >
          {text}
          <div style={{
            position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid white',
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── BurgerEye ────────────────────────────────────────────────────────────────
function BurgerEye({ offsetX, offsetY, closed, curious, size = 40 }: {
  offsetX: number; offsetY: number; closed: boolean; curious?: boolean; size?: number;
}) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (closed) return;
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => { setBlinking(false); schedule(); }, 110);
      }, 2800 + Math.random() * 2200);
    };
    schedule();
    return () => clearTimeout(t);
  }, [closed]);

  const lidDown = closed || blinking;

  return (
    <motion.div
      animate={{ scale: curious ? 1.18 : 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'white', border: `${Math.round(size * 0.07)}px solid #2a1206`,
        position: 'relative', overflow: 'hidden', flexShrink: 0,
        boxShadow: `inset 0 2px 5px rgba(0,0,0,0.14), 0 3px 8px rgba(0,0,0,0.22)`,
      }}
    >
      <motion.div
        animate={{ x: lidDown ? 0 : offsetX, y: lidDown ? 3 : offsetY }}
        transition={{ type: 'spring', stiffness: 160, damping: 22 }}
        style={{
          position: 'absolute', width: size * 0.52, height: size * 0.52,
          borderRadius: '50%', background: 'radial-gradient(circle at 38% 35%, #8a6040, #3a1e08)',
          top: '50%', left: '50%',
          marginTop: -(size * 0.52) / 2, marginLeft: -(size * 0.52) / 2, zIndex: 1,
        }}
      >
        <div style={{ position: 'absolute', width: '46%', height: '46%', borderRadius: '50%', background: '#080808', top: '18%', left: '18%' }} />
        <div style={{ position: 'absolute', width: '22%', height: '22%', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', top: '8%', right: '10%' }} />
      </motion.div>
      <motion.div
        animate={{ height: lidDown ? '115%' : '0%' }}
        transition={{ duration: lidDown && !blinking ? 0.36 : 0.08, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 0, left: '-6%', right: '-6%',
          background: 'linear-gradient(to bottom, #dea020, #c07008)',
          borderRadius: '0 0 55% 55%', zIndex: 4,
        }}
      />
    </motion.div>
  );
}

// ─── Eyebrow ──────────────────────────────────────────────────────────────────
function Eyebrow({ left, curious, happy }: { left: boolean; curious: boolean; happy: boolean }) {
  return (
    <motion.div
      animate={{
        y: curious ? -6 : happy ? -3 : 0,
        rotate: curious ? (left ? -12 : 12) : happy ? (left ? 10 : -10) : (left ? 6 : -6),
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      style={{
        width: 28, height: 5, borderRadius: '3px', background: '#2a1206',
        transformOrigin: left ? 'right center' : 'left center',
      }}
    />
  );
}

// ─── HamburgerCharacter ───────────────────────────────────────────────────────
function HamburgerCharacter({ mousePos, focusField, celebrating, shaking }: {
  mousePos: { x: number; y: number };
  focusField: 'none' | 'text' | 'password';
  celebrating: boolean;
  shaking: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isPassword  = focusField === 'password';
  const isCurious   = focusField === 'text';
  const isHappy     = celebrating;

  // Phase of the celebration run-away sequence
  // 0 = normal, 1 = turn + legs out (0–0.4s), 2 = rocket off screen (0.4s+)
  const [celebPhase, setCelebPhase] = useState(0);

  useEffect(() => {
    if (!celebrating) { setCelebPhase(0); return; }
    // Phase 1: turn around + sprout legs immediately
    setCelebPhase(1);
    // Phase 2: blast off after a short wind-up
    const t = setTimeout(() => setCelebPhase(2), 420);
    return () => clearTimeout(t);
  }, [celebrating]);

  const { ex, ey, tiltX, tiltY } = React.useMemo(() => {
    if (!ref.current) return { ex: 0, ey: 0, tiltX: 0, tiltY: 0 };
    const r = ref.current.getBoundingClientRect();
    const dx = mousePos.x - (r.left + r.width  * 0.5);
    const dy = mousePos.y - (r.top  + r.height * 0.26);
    const dist = Math.hypot(dx, dy) || 1;
    const f = Math.min(1, dist / 300);
    return {
      ex: (dx / dist) * 9 * f,
      ey: (dy / dist) * 9 * f,
      tiltX: ((mousePos.y - (r.top  + r.height * 0.5)) / window.innerHeight) * -16,
      tiltY: ((mousePos.x - (r.left + r.width  * 0.5)) / window.innerWidth)  *  16,
    };
  }, [mousePos]);

  const showLimbs = isPassword || celebPhase >= 1;

  return (
    <div ref={ref} style={{ perspective: 900, position: 'relative' }}>

      {/* ── MOVEMENT WRAPPER ── */}
      <motion.div
        animate={{
          y: celebPhase === 2
            ? -520        // blast off upward
            : celebPhase === 1
            ? -18         // slight wind-up hop
            : isPassword  ? 70
            : shaking     ? [0, -5, 5, -4, 4, -2, 0]
            : isCurious   ? -10
            : 0,
          x: celebPhase === 2
            ? 30          // slight rightward drift as it rockets
            : shaking ? [0, -9, 9, -6, 6, -3, 0] : 0,
          scale: celebPhase === 2
            ? 0.08        // shrink into the distance
            : celebPhase === 1
            ? 1.08        // puff up before launch
            : isPassword ? 0.52 : 1,
          rotate: celebPhase === 2 ? -15 : 0,
          opacity: celebPhase === 2 ? 0 : 1,
        }}
        transition={{
          y: celebPhase === 2
            ? { duration: 0.72, ease: [0.2, 0, 0.4, 1] }
            : celebPhase === 1
            ? { type: 'spring', stiffness: 280, damping: 18 }
            : isPassword
            ? { type: 'spring', stiffness: 75, damping: 15 }
            : shaking
            ? { duration: 0.45 }
            : { type: 'spring', stiffness: 220, damping: 22 },
          x: (shaking && !celebrating)
            ? { duration: 0.45 }
            : { type: 'spring', stiffness: 200, damping: 24 },
          scale: celebPhase === 2
            ? { duration: 0.72, ease: [0.2, 0, 0.4, 1] }
            : { type: 'spring', stiffness: 180, damping: 16 },
          rotate: { duration: 0.72, ease: 'easeIn' },
          opacity: { duration: 0.55, ease: 'easeIn', delay: 0.2 },
        }}
        style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}
      >

        {/* ── ARMS ── */}
        <AnimatePresence>
          {showLimbs && (
            <motion.div
              key="arms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}
            >
              {/* Left arm — waves faster during celebration */}
              <motion.div
                animate={{ rotate: [-20, 42, -20] }}
                transition={{
                  duration: celebPhase >= 1 ? 0.22 : 0.36,
                  repeat: Infinity, ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute', left: -42, top: 88,
                  width: 42, height: 14,
                  background: 'linear-gradient(to right, #7a3c00, #d88010)',
                  borderRadius: '8px 3px 3px 8px',
                  transformOrigin: 'right center',
                }}
              />
              {/* Right arm */}
              <motion.div
                animate={{ rotate: [20, -42, 20] }}
                transition={{
                  duration: celebPhase >= 1 ? 0.22 : 0.36,
                  repeat: Infinity, ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute', right: -42, top: 88,
                  width: 42, height: 14,
                  background: 'linear-gradient(to left, #7a3c00, #d88010)',
                  borderRadius: '3px 8px 8px 3px',
                  transformOrigin: 'left center',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 3-D BURGER ── */}
        <motion.div
          animate={{
            rotateY: (isPassword || celebPhase >= 1) ? 180 : tiltY,
            rotateX: (isPassword || celebPhase >= 1) ? 0   : tiltX,
          }}
          transition={{
            rotateY: (isPassword || celebPhase >= 1)
              ? { duration: 0.42, ease: [0.4, 0, 0.2, 1] }
              : { duration: 0.07 },
            rotateX: { duration: 0.07 },
          }}
          style={{ width: 190, transformStyle: 'preserve-3d', position: 'relative' }}
        >
          {/* ─ FRONT face ─ */}
          <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
            <motion.div
              animate={{ scaleX: isCurious ? 1.04 : 1 }}
              transition={{ type: 'spring', stiffness: 240 }}
              style={{
                width: '100%',
                background: 'linear-gradient(160deg, #f2b020 0%, #d88010 45%, #b86808 100%)',
                borderRadius: '110px 110px 12px 12px',
                padding: '22px 22px 16px',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
                zIndex: 2,
              }}
            >
              <div style={{ position: 'absolute', top: 10, left: 18, right: 60, height: 14, background: 'rgba(255,255,255,0.18)', borderRadius: '50%' }} />

              {/* Eyebrows */}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 18, paddingRight: 18, marginBottom: 10 }}>
                <Eyebrow left={true}  curious={isCurious} happy={isHappy} />
                <Eyebrow left={false} curious={isCurious} happy={isHappy} />
              </div>

              {/* Eyes */}
              <div style={{ display: 'flex', justifyContent: 'space-around', paddingLeft: 8, paddingRight: 8 }}>
                <BurgerEye offsetX={ex} offsetY={ey} closed={false} curious={isCurious} size={42} />
                <BurgerEye offsetX={ex} offsetY={ey} closed={false} curious={isCurious} size={42} />
              </div>

              {/* Mouth */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 9 }}>
                <motion.div
                  animate={{ scaleX: isHappy ? 1.3 : 1, scaleY: isHappy ? 0.6 : 1 }}
                  style={{ width: 24, height: 12, background: isHappy ? '#c0392b' : '#5a2a0e', borderRadius: '0 0 40% 40%' }}
                />
              </div>

              {/* Curious bubble */}
              <AnimatePresence>
                {isCurious && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: 'spring', stiffness: 380 }}
                    style={{
                      position: 'absolute', top: -16, right: -10,
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'white', border: '2px solid #F24E6F',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 800, color: '#F24E6F',
                      boxShadow: '0 3px 10px rgba(242,78,111,0.3)',
                    }}
                  >
                    ?
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Happy stars */}
              <AnimatePresence>
                {isHappy && [[-24,-28],[24,-28]].map(([ox, oy], i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: [0, 1.4, 1], rotate: [0, 20, -10, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.45 }}
                    style={{ position: 'absolute', top: oy, left: `calc(50% + ${ox}px)`, fontSize: '18px' }}
                  >
                    ⭐
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Lettuce */}
            <div style={{ width: '110%', marginLeft: '-5%', background: 'linear-gradient(to bottom, #5dbb5d, #3a8a3a)', height: 20, position: 'relative', zIndex: 1, clipPath: 'polygon(0% 55%,5% 0%,10% 55%,15% 0%,20% 55%,25% 0%,30% 55%,35% 0%,40% 55%,45% 0%,50% 55%,55% 0%,60% 55%,65% 0%,70% 55%,75% 0%,80% 55%,85% 0%,90% 55%,95% 0%,100% 55%,100% 100%,0% 100%)' }} />
            {/* Cheese */}
            <div style={{ width: '104%', marginLeft: '-2%', background: 'linear-gradient(to bottom, #ffe040, #ffbb00)', height: 11, borderRadius: '2px', position: 'relative', zIndex: 1 }} />
            {/* Patty */}
            <div style={{ width: '100%', background: 'linear-gradient(to bottom, #6d4220, #4a2c10)', height: 28, borderRadius: '7px', boxShadow: '0 4px 14px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 }} />
            {/* Bottom bun */}
            <div style={{ width: '88%', marginLeft: '6%', background: 'linear-gradient(to top, #b86808, #d88010)', borderRadius: '5px 5px 90px 90px', height: 24, boxShadow: '0 8px 20px rgba(0,0,0,0.22)' }} />
          </div>

          {/* ─ BACK face ─ */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 2,
          }}>
            <div style={{
              width: 190,
              background: 'linear-gradient(to top, #f2b020 0%, #d88010 55%, #b86808 100%)',
              borderRadius: '95px 95px 12px 12px', height: 98,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              boxShadow: '0 8px 24px rgba(0,0,0,0.28)', position: 'relative',
            }}>
              <motion.div
                animate={{ rotate: [0, -8, 8, -5, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
                style={{ fontSize: '34px' }}
              >🙈</motion.div>
              <div style={{ color: '#7a4400', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>La la la! 🎵</div>
              <div style={{ position: 'absolute', bottom: 8, left: 20, width: 26, height: 12, borderRadius: '50%', background: 'rgba(255,80,80,0.22)' }} />
              <div style={{ position: 'absolute', bottom: 8, right: 20, width: 26, height: 12, borderRadius: '50%', background: 'rgba(255,80,80,0.22)' }} />
            </div>
            <div style={{ width: 180, height: 18, background: 'rgba(93,187,93,0.4)',   borderRadius: 4 }} />
            <div style={{ width: 186, height: 10, background: 'rgba(255,224,64,0.45)', borderRadius: 3 }} />
            <div style={{ width: 166, height: 25, background: 'rgba(109,66,32,0.55)',  borderRadius: 6 }} />
            <div style={{ width: 170, height: 22, background: 'linear-gradient(to top, #b86808, #d88010)', borderRadius: '5px 5px 85px 85px' }} />
          </div>
        </motion.div>

        {/* ── LEGS ── */}
        <AnimatePresence>
          {showLimbs && (
            <motion.div
              key="legs"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', gap: 28, marginTop: -3, transformOrigin: 'top center' }}
            >
              <motion.div
                animate={{ rotate: [-34, 34, -34] }}
                transition={{
                  duration: celebPhase >= 1 ? 0.18 : 0.36,
                  repeat: Infinity, ease: 'easeInOut',
                }}
                style={{
                  width: 14, height: 46,
                  background: 'linear-gradient(to bottom, #d88010, #6e3d00)',
                  borderRadius: '3px 3px 10px 10px',
                  transformOrigin: 'top center',
                }}
              />
              <motion.div
                animate={{ rotate: [34, -34, 34] }}
                transition={{
                  duration: celebPhase >= 1 ? 0.18 : 0.36,
                  repeat: Infinity, ease: 'easeInOut',
                }}
                style={{
                  width: 14, height: 46,
                  background: 'linear-gradient(to bottom, #d88010, #6e3d00)',
                  borderRadius: '3px 3px 10px 10px',
                  transformOrigin: 'top center',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ROCKET TRAIL (only during blast-off) ── */}
        <AnimatePresence>
          {celebPhase === 2 && (
            <motion.div
              key="trail"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: [0, 0.9, 0], scaleY: [0, 1, 0.6] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                bottom: -50, left: '50%',
                transform: 'translateX(-50%)',
                width: 28, height: 60,
                background: 'linear-gradient(to bottom, rgba(242,78,111,0.85), rgba(255,180,0,0.5), transparent)',
                borderRadius: '50% 50% 80% 80%',
                filter: 'blur(5px)',
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, icon: Icon, type, value, onChange, placeholder, onFocus, onBlur, error, action }: {
  label: string; icon: React.ElementType; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  onFocus?: () => void; onBlur?: () => void;
  error?: string; action?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ color: '#374151', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '7px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focused ? '#F24E6F' : '#9ca3af', transition: 'color 0.2s', pointerEvents: 'none' }} />
        <input
          type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => { setFocused(true); onFocus?.(); }}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={{
            width: '100%', padding: `13px 16px 13px 40px`,
            paddingRight: action ? 44 : 16,
            borderRadius: 12, border: `2px solid ${error ? '#F24E6F' : focused ? '#F24E6F' : '#e5e7eb'}`,
            background: 'white', fontSize: '14px', outline: 'none',
            fontFamily: 'inherit', color: '#111', boxSizing: 'border-box',
            boxShadow: focused ? '0 0 0 4px rgba(242,78,111,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        />
        {action && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{action}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ color: '#F24E6F', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <AlertCircle size={11} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── LoginScreen ──────────────────────────────────────────────────────────────
interface LoginScreenProps {
  onLogin: (name: string, emoji: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [tab,         setTab]         = useState<'login' | 'register'>('login');
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [avatar,      setAvatar]      = useState('👨‍🎓');
  const [focusField,  setFocusField]  = useState<'none' | 'text' | 'password'>('none');
  const [celebrating, setCelebrating] = useState(false);
  const [shaking,     setShaking]     = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [mousePos,    setMousePos]    = useState({ x: 0, y: 0 });
  const [speech,      setSpeech]      = useState('');
  const greetedRef = useRef(false);

  // Show greeting once on mount
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    const t = setTimeout(() => setSpeech('Welcome back, chef! 👋'), 500);
    return () => clearTimeout(t);
  }, []);

  // Swap greeting text when switching tab
  const prevSpeechRef = useRef(speech);
  useEffect(() => {
    prevSpeechRef.current = speech;
  });
  useEffect(() => {
    const prev = prevSpeechRef.current;
    if (prev === 'Welcome back, chef! 👋' || prev === 'Ready to cook? 🍳') {
      setSpeech(tab === 'login' ? 'Welcome back, chef! 👋' : 'Ready to cook? 🍳');
    }
    setErrors({});
    setPassword('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    const h = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const floatData = React.useMemo(() =>
    FLOAT_FOODS.map((emoji, i) => ({
      emoji, x: (i / FLOAT_FOODS.length) * 92 + 3,
      dur: 10 + (i % 5) * 1.6, delay: (i * 0.8) % 11,
    })), []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (tab === 'register' && !name.trim()) e.name = 'Please enter your name';
    if (!email.includes('@')) e.email = 'Enter a valid email address';
    if (password.length < 4) e.password = 'Password must be at least 4 characters';
    return e;
  };

  const shake = () => { setShaking(true); setTimeout(() => setShaking(false), 500); };

  const handleSubmit = () => {
    setSpeech('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); shake(); return; }
    setErrors({});

    if (tab === 'register') {
      if (emailExists(email)) { setErrors({ email: 'An account with this email already exists' }); shake(); return; }
      saveUser({ email, password, name: name.trim(), emoji: avatar });
      setCelebrating(true);
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60,  spread: 55, origin: { x: 0, y: 0.65 }, colors: ['#F24E6F','#29B6C5','#2196F3','#f59e0b'] });
        confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors: ['#F24E6F','#29B6C5','#2196F3','#f59e0b'] });
      }, 300);
      setTimeout(() => onLogin(name.trim(), avatar), 2200);
    } else {
      const user = findUser(email, password);
      if (!user) { setErrors({ password: 'Incorrect email or password' }); shake(); return; }
      setCelebrating(true);
      setTimeout(() => {
        confetti({ particleCount: 70, angle: 60,  spread: 55, origin: { x: 0, y: 0.65 }, colors: ['#F24E6F','#29B6C5','#2196F3'] });
        confetti({ particleCount: 70, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors: ['#F24E6F','#29B6C5','#2196F3'] });
      }, 300);
      setTimeout(() => onLogin(user.name, user.emoji), 2200);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSubmit(); };

  const activeSpeech = celebrating ? "Let's cook! 🎉" : speech;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', overflow: 'hidden' }}>

      {/* ── LEFT: dark character panel ─────────────────────────────── */}
      <div className="hidden lg:flex" style={{
        width: '44%', flexShrink: 0, flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(145deg, #0d1117 0%, #1a0830 55%, #081820 100%)',
      }}>
        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,78,111,0.11) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(41,182,197,0.11) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Floating food */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {floatData.map((d, i) => <FloatingFood key={i} {...d} />)}
        </div>

        {/* Main content: burger + speech bubble centred */}
        <div style={{
          position: 'relative', zIndex: 2,
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px 40px',
        }}>
          {/* Burger + speech bubble */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SpeechBubble text={activeSpeech} />
            <HamburgerCharacter
              mousePos={mousePos}
              focusField={focusField}
              celebrating={celebrating}
              shaking={shaking}
            />
          </div>
        </div>
      </div>

      {/* ── RIGHT: form panel ──────────────────────────────────────── */}
      <div style={{
        flex: 1, background: '#F8F9FF', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 40px', position: 'relative', overflow: 'auto',
      }}>
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#dde2f0 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5, pointerEvents: 'none' }} />

        {/* Mobile: character above form */}
        <div className="flex lg:hidden" style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <SpeechBubble text={activeSpeech} />
          <HamburgerCharacter mousePos={mousePos} focusField={focusField} celebrating={celebrating} shaking={shaking} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ width: 46, height: 46, borderRadius: 15, background: 'linear-gradient(135deg, #F24E6F, #29B6C5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 6px 20px rgba(242,78,111,0.28)' }}>🍝</div>
            <div>
              <div style={{ color: '#111', fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>BudgetBites</div>
              <div style={{ color: '#9ca3af', fontSize: 12 }}>Student Kitchen 🎓</div>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#ededf5', borderRadius: 14, padding: 4, marginBottom: 26 }}>
            {(['login', 'register'] as const).map(t => (
              <motion.button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
                  background: tab === t ? 'white' : 'transparent',
                  color: tab === t ? '#111' : '#9ca3af',
                  fontSize: '14px', fontWeight: tab === t ? 700 : 500,
                  fontFamily: 'inherit',
                  boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {t === 'login' ? '🔑 Log In' : '🚀 Register'}
              </motion.button>
            ))}
          </div>

          {/* Form */}
          {!celebrating && (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: tab === 'register' ? 16 : -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                onKeyDown={handleKey}
              >
                {tab === 'register' && (
                  <Field
                    label="Your Name" icon={User} type="text" value={name} onChange={setName}
                    placeholder="e.g. Alex, Mia, Sam…" error={errors.name}
                    onFocus={() => { setSpeech('Ooh, tell me your name! ✨'); setFocusField('text'); }}
                    onBlur={() => { setSpeech(''); setFocusField('none'); }}
                  />
                )}

                <Field
                  label="Email" icon={Mail} type="email" value={email} onChange={setEmail}
                  placeholder="you@university.edu" error={errors.email}
                  onFocus={() => { setSpeech('Hmm, I wonder who this is... 🤔'); setFocusField('text'); }}
                  onBlur={() => { setSpeech(''); setFocusField('none'); }}
                />

                <Field
                  label="Password" icon={Lock}
                  type={showPass ? 'text' : 'password'} value={password} onChange={setPassword}
                  placeholder={tab === 'register' ? 'Choose a password' : 'Enter your password'}
                  error={errors.password}
                  onFocus={() => { setSpeech(''); setFocusField('password'); }}
                  onBlur={() => setFocusField('none')}
                  action={
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, display: 'flex' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />

                {tab === 'register' && (
                  <div>
                    <label style={{ color: '#374151', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Pick your avatar</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {AVATARS.map(e => (
                        <motion.button
                          key={e} type="button" whileTap={{ scale: 0.82 }} whileHover={{ scale: 1.15 }}
                          onClick={() => setAvatar(e)}
                          style={{
                            width: 42, height: 42, borderRadius: 12,
                            border: avatar === e ? '2.5px solid #F24E6F' : '2px solid #e5e7eb',
                            background: avatar === e ? '#fff5f7' : 'white',
                            cursor: 'pointer', fontSize: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: avatar === e ? '0 0 0 3px rgba(242,78,111,0.15)' : 'none',
                            transition: 'all 0.15s',
                          }}
                        >
                          {e}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 32px rgba(242,78,111,0.38)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  style={{
                    width: '100%', padding: '14px 0', marginTop: 4, borderRadius: 14, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #F24E6F 0%, #29B6C5 100%)',
                    color: 'white', fontSize: '15px', fontWeight: 700, fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    boxShadow: '0 4px 16px rgba(242,78,111,0.28)',
                  }}
                >
                  {tab === 'login' ? <><ChefHat size={16} /> Sign In</> : <><ArrowRight size={16} /> Create Account</>}
                </motion.button>

                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: 2 }}>
                  {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => setTab(tab === 'login' ? 'register' : 'login')}
                    style={{ background: 'none', border: 'none', color: '#F24E6F', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', padding: 0 }}
                  >
                    {tab === 'login' ? 'Register →' : 'Log in →'}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Celebrating state */}
          {celebrating && (
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '16px 0' }}>
              <motion.div
                animate={{ rotate: [0, -12, 12, -8, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8 }}
                style={{ fontSize: 64, marginBottom: 16 }}
              >
                🎉
              </motion.div>
              <div style={{ color: '#111', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                {tab === 'register' ? `Welcome, ${name}!` : 'Welcome back!'}
              </div>
              <p style={{ color: '#6b7280', fontSize: 13 }}>Loading your kitchen…</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                {['#F24E6F', '#29B6C5', '#2196F3'].map((c, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.7, delay: i * 0.16, repeat: Infinity }}
                    style={{ width: 10, height: 10, borderRadius: '50%', background: c }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}