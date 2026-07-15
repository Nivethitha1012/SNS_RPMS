import React, { useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import {
  FileText,
  Activity,
  CheckCircle,
  Shield,
  CreditCard,
  Users,
  ArrowRight,
  Upload,
  CheckSquare,
  BarChart,
  Layers,
  Search,
  Settings
} from 'lucide-react';
import rpmsLogo from '../../assets/logos/app-logo.png';
import BlurText from '../../components/BlurText';
import ScrollReveal from '../../components/ScrollReveal';

const borderGlowCss = `
.glare-hover {
  width: var(--gh-width);
  height: var(--gh-height);
  background: var(--gh-bg);
  border-radius: var(--gh-br);
  border: 1px solid var(--gh-border);
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glare-hover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    var(--gh-angle),
    hsla(0, 0%, 0%, 0) 60%,
    var(--gh-rgba) 70%,
    hsla(0, 0%, 0%, 0),
    hsla(0, 0%, 0%, 0) 100%
  );
  transition: var(--gh-duration) ease;
  background-size:
    var(--gh-size) var(--gh-size),
    100% 100%;
  background-repeat: no-repeat;
  background-position:
    -100% -100%,
    0 0;
  z-index: 1;
  pointer-events: none;
}

.glare-hover:hover {
  cursor: pointer;
}

.glare-hover:hover::before {
  background-position:
    100% 100%,
    0 0;
}

.glare-hover--play-once::before {
  transition: none;
}

.glare-hover--play-once:hover::before {
  transition: var(--gh-duration) ease;
  background-position:
    100% 100%,
    0 0;
}

.card-spotlight {
  position: relative;
  overflow: hidden;
  --mouse-x: 50%;
  --mouse-y: 50%;
  --spotlight-color: rgba(255, 255, 255, 0.05);
}

.card-spotlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 300px);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: 0;
}

.card-spotlight:hover::before,
.card-spotlight:focus-within::before {
  opacity: 1;
}

.border-glow-card {
  --edge-proximity: 0;
  --cursor-angle: 45deg;
  --edge-sensitivity: 30;
  --color-sensitivity: calc(var(--edge-sensitivity) + 20);
  --border-radius: 28px;
  --glow-padding: 40px;
  --cone-spread: 25;

  position: relative;
  border-radius: var(--border-radius);
  isolation: isolate;
  transform: translate3d(0, 0, 0.01px);
  display: grid;
  border: 1px solid rgb(255 255 255 / 15%);
  background: var(--card-bg, #120F17);
  overflow: visible;
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 1px 2px,
    rgba(0, 0, 0, 0.1) 0px 2px 4px,
    rgba(0, 0, 0, 0.1) 0px 4px 8px,
    rgba(0, 0, 0, 0.1) 0px 8px 16px,
    rgba(0, 0, 0, 0.1) 0px 16px 32px,
    rgba(0, 0, 0, 0.1) 0px 32px 64px;
}

.border-glow-card::before,
.border-glow-card::after,
.border-glow-card > .edge-light {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  transition: opacity 0.25s ease-out;
  z-index: -1;
}

.border-glow-card:not(:hover):not(.sweep-active)::before,
.border-glow-card:not(:hover):not(.sweep-active)::after,
.border-glow-card:not(:hover):not(.sweep-active) > .edge-light {
  opacity: 0;
  transition: opacity 0.75s ease-in-out;
}

.border-glow-card::before {
  border: 1px solid transparent;
  background:
    linear-gradient(var(--card-bg, #120F17) 0 100%) padding-box,
    linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box,
    var(--gradient-one, radial-gradient(at 80% 55%, hsla(268, 100%, 76%, 1) 0px, transparent 50%)) border-box,
    var(--gradient-two, radial-gradient(at 69% 34%, hsla(349, 100%, 74%, 1) 0px, transparent 50%)) border-box,
    var(--gradient-three, radial-gradient(at 8% 6%, hsla(136, 100%, 78%, 1) 0px, transparent 50%)) border-box,
    var(--gradient-four, radial-gradient(at 41% 38%, hsla(192, 100%, 64%, 1) 0px, transparent 50%)) border-box,
    var(--gradient-five, radial-gradient(at 86% 85%, hsla(186, 100%, 74%, 1) 0px, transparent 50%)) border-box,
    var(--gradient-six, radial-gradient(at 82% 18%, hsla(52, 100%, 65%, 1) 0px, transparent 50%)) border-box,
    var(--gradient-seven, radial-gradient(at 51% 4%, hsla(12, 100%, 72%, 1) 0px, transparent 50%)) border-box,
    var(--gradient-base, linear-gradient(#c299ff 0 100%)) border-box;

  opacity: calc((var(--edge-proximity) - var(--color-sensitivity)) / (100 - var(--color-sensitivity)));

  mask-image:
    conic-gradient(
      from var(--cursor-angle) at center,
      black calc(var(--cone-spread) * 1%),
      transparent calc((var(--cone-spread) + 15) * 1%),
      transparent calc((100 - var(--cone-spread) - 15) * 1%),
      black calc((100 - var(--cone-spread)) * 1%)
    );
}

.border-glow-card::after {
  border: 1px solid transparent;
  background:
    var(--gradient-one, radial-gradient(at 80% 55%, hsla(268, 100%, 76%, 1) 0px, transparent 50%)) padding-box,
    var(--gradient-two, radial-gradient(at 69% 34%, hsla(349, 100%, 74%, 1) 0px, transparent 50%)) padding-box,
    var(--gradient-three, radial-gradient(at 8% 6%, hsla(136, 100%, 78%, 1) 0px, transparent 50%)) padding-box,
    var(--gradient-four, radial-gradient(at 41% 38%, hsla(192, 100%, 64%, 1) 0px, transparent 50%)) padding-box,
    var(--gradient-five, radial-gradient(at 86% 85%, hsla(186, 100%, 74%, 1) 0px, transparent 50%)) padding-box,
    var(--gradient-six, radial-gradient(at 82% 18%, hsla(52, 100%, 65%, 1) 0px, transparent 50%)) padding-box,
    var(--gradient-seven, radial-gradient(at 51% 4%, hsla(12, 100%, 72%, 1) 0px, transparent 50%)) padding-box,
    var(--gradient-base, linear-gradient(#c299ff 0 100%)) padding-box;

  mask-image:
    linear-gradient(to bottom, black, black),
    radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%),
    radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%),
    radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%),
    radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%),
    radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%),
    conic-gradient(from var(--cursor-angle) at center, transparent 5%, black 15%, black 85%, transparent 95%);

  mask-composite: subtract, add, add, add, add, add;
  opacity: calc(var(--fill-opacity, 0.5) * (var(--edge-proximity) - var(--color-sensitivity)) / (100 - var(--color-sensitivity)));
  mix-blend-mode: soft-light;
}

.border-glow-card > .edge-light {
  inset: calc(var(--glow-padding) * -1);
  pointer-events: none;
  z-index: 1;

  mask-image:
    conic-gradient(
      from var(--cursor-angle) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%
    );

  opacity: calc((var(--edge-proximity) - var(--edge-sensitivity)) / (100 - var(--edge-sensitivity)));
  mix-blend-mode: plus-lighter;
}

.border-glow-card > .edge-light::before {
  content: "";
  position: absolute;
  inset: var(--glow-padding);
  border-radius: inherit;
  box-shadow:
    inset 0 0 0 1px var(--glow-color, hsl(40deg 80% 80% / 100%)),
    inset 0 0 1px 0 var(--glow-color-60, hsl(40deg 80% 80% / 60%)),
    inset 0 0 3px 0 var(--glow-color-50, hsl(40deg 80% 80% / 50%)),
    inset 0 0 6px 0 var(--glow-color-40, hsl(40deg 80% 80% / 40%)),
    inset 0 0 15px 0 var(--glow-color-30, hsl(40deg 80% 80% / 30%)),
    inset 0 0 25px 2px var(--glow-color-20, hsl(40deg 80% 80% / 20%)),
    inset 0 0 50px 2px var(--glow-color-10, hsl(40deg 80% 80% / 10%)),
    0 0 1px 0 var(--glow-color-60, hsl(40deg 80% 80% / 60%)),
    0 0 3px 0 var(--glow-color-50, hsl(40deg 80% 80% / 50%)),
    0 0 6px 0 var(--glow-color-40, hsl(40deg 80% 80% / 40%)),
    0 0 15px 0 var(--glow-color-30, hsl(40deg 80% 80% / 30%)),
    0 0 25px 2px var(--glow-color-20, hsl(40deg 80% 80% / 20%)),
    0 0 50px 2px var(--glow-color-10, hsl(40deg 80% 80% / 10%));
}

.border-glow-inner {
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: auto;
  z-index: 1;
}
`;

function parseHSL(hslStr) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const vars = {};
  for (let i = 0; i < opacities.length; i++) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
  }
  return vars;
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors) {
  const vars = {};
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x) { return x * x * x; }

function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }) {
  const t0 = performance.now() + delay;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else if (onEnd) onEnd();
  }
  setTimeout(() => requestAnimationFrame(tick), delay);
}

const BorderGlow = ({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#120F17',
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity = 0.5,
}) => {
  const cardRef = useRef(null);

  const getCenterOfElement = useCallback((el) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProximity = useCallback((el, x, y) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }, [getCenterOfElement]);

  const getCursorAngle = useCallback((el, x, y) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }, [getCenterOfElement]);

  const handlePointerMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const edge = getEdgeProximity(card, x, y);
    const angle = getCursorAngle(card, x, y);

    card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
  }, [getEdgeProximity, getCursorAngle]);

  useEffect(() => {
    if (!animated || !cardRef.current) return;
    const card = cardRef.current;
    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', `${angleStart}deg`);

    animateValue({ duration: 500, onUpdate: v => card.style.setProperty('--edge-proximity', v) });
    animateValue({
      ease: easeInCubic, duration: 1500, end: 50, onUpdate: v => {
        card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
      }
    });
    animateValue({
      ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v => {
        card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
      }
    });
    animateValue({
      ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
      onUpdate: v => card.style.setProperty('--edge-proximity', v),
      onEnd: () => card.classList.remove('sweep-active'),
    });
  }, [animated]);

  const glowVars = buildGlowVars(glowColor, glowIntensity);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...glowVars,
        ...buildGradientVars(colors),
      }}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">
        {children}
      </div>
    </div>
  );
};

const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.25)' }) => {
  const divRef = useRef(null);

  const handleMouseMove = e => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      {children}
    </div>
  );
};

const GlareHover = ({
  width = '500px',
  height = '500px',
  background = '#000',
  borderRadius = '10px',
  borderColor = '#333',
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = '',
  style = {}
}) => {
  const hex = glareColor.replace('#', '');
  let rgba = glareColor;
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const vars = {
    '--gh-width': width,
    '--gh-height': height,
    '--gh-bg': background,
    '--gh-br': borderRadius,
    '--gh-angle': `${glareAngle}deg`,
    '--gh-duration': `${transitionDuration}ms`,
    '--gh-size': `${glareSize}%`,
    '--gh-rgba': rgba,
    '--gh-border': borderColor
  };

  return (
    <div
      className={`glare-hover ${playOnce ? 'glare-hover--play-once' : ''} ${className}`}
      style={{ ...vars, ...style }}
    >
      {children}
    </div>
  );
};

export default function LandingPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <style>{borderGlowCss}</style>
      <div className={`min-h-screen overflow-x-hidden ${isDark ? 'bg-[#0a0a0a] text-slate-200' : 'bg-slate-50 text-slate-800'}`}>

        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-screen pointer-events-none z-0 overflow-hidden">
          <div className={`absolute inset-0 bg-linear-to-br ${isDark ? 'from-emerald-900/10 via-[#0a0a0a] to-blue-900/10' : 'from-emerald-100/40 via-slate-50 to-blue-100/40'}`} />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzAwMCIvPgo8L3N2Zz4=')] bg-repeat" />
          <motion.div
            animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[120px] ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-300/20'}`}
          />
          <motion.div
            animate={{ y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className={`absolute bottom-0 left-1/4 w-125 h-125 rounded-full blur-[150px] ${isDark ? 'bg-blue-900/10' : 'bg-blue-300/20'}`}
          />
        </div>

        {/* Navbar */}
        <nav className={`absolute top-0 w-full z-50 transition-all duration-300 border-b backdrop-blur-md ${isDark ? 'bg-[#0a0a0a]/80 border-white/5' : 'bg-white/80 border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3">
                <img src={rpmsLogo} alt="RPMS Logo" className="h-10 w-auto object-contain" />
                <span className={`font-bold text-lg hidden sm:block tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  RPMS
                </span>
              </div>
              <div>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all text-white shadow-lg flex items-center gap-2"
                    style={{
                      background: isDark ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: isDark ? '0 8px 24px rgba(4,120,87,0.3)' : '0 8px 24px rgba(5,150,105,0.3)'
                    }}
                  >
                    Sign In
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-10 pt-32 pb-16">

          {/* Hero Section */}
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-10 lg:pt-20 pb-24 text-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 15 }} className="flex justify-center">
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border flex items-center gap-2 shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Research Publication Management System
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 15 }} className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight flex flex-col items-center justify-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <BlurText
                  text="Manage Research Publications"
                  delay={50}
                  animateBy="words"
                  direction="bottom"
                  className="justify-center text-center"
                />
                <BlurText
                  text="Smarter, Faster, Better"
                  delay={50}
                  animateBy="words"
                  direction="bottom"
                  className="justify-center text-center mt-2 sm:mt-4 text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-blue-500 pb-2"
                />
              </motion.div>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 15 }} className={`text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                A centralized platform designed to simplify publication submission, evaluation, tracking, and institutional research management.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 15 }} className="pt-4">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mx-auto block"
                  >
                    <GlareHover
                      width="auto"
                      height="auto"
                      background={isDark ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}
                      borderRadius="12px"
                      borderColor="transparent"
                      glareColor="#ffffff"
                      glareOpacity={0.6}
                      glareAngle={-30}
                      glareSize={250}
                      transitionDuration={1500}
                      className="px-8 py-4 font-bold text-base transition-all text-white shadow-xl group"
                      style={{
                        boxShadow: isDark ? '0 12px 32px rgba(4,120,87,0.4)' : '0 12px 32px rgba(5,150,105,0.4)'
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Sign In to Continue
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </GlareHover>
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </section>


          {/* Features */}
          <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="text-center mb-16 flex flex-col items-center">
              <ScrollReveal
                baseOpacity={0}
                enableBlur={true}
                baseRotation={5}
                blurStrength={10}
                containerClassName="!m-0 mb-4"
                textClassName={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} !text-3xl md:!text-4xl`}
              >
                Powerful Features
              </ScrollReveal>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                Everything you need to manage the research lifecycle efficiently.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: FileText, title: "Manuscript Submission", desc: "Easily submit and categorize manuscripts with our streamlined intake process." },
                { icon: Activity, title: "Publication Tracking", desc: "Monitor real-time status updates from submission to final publication." },
                { icon: CheckSquare, title: "Evaluation Management", desc: "Coordinate peer reviews and track evaluation feedback seamlessly." },
                { icon: Shield, title: "Secure Document Management", desc: "Enterprise-grade security for all your sensitive research documents." },
                { icon: CreditCard, title: "Payment and Invoice Management", desc: "Handle publication fees and invoice generation directly in the platform." },
                { icon: Users, title: "Faculty Profile Management", desc: "Maintain up-to-date researcher profiles and publication histories." },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="h-full"
                >
                  <GlareHover
                    width="100%"
                    height="100%"
                    background={isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff'}
                    borderRadius="16px"
                    borderColor={isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}
                    glareColor={isDark ? '#34d399' : '#10b981'}
                    glareOpacity={isDark ? 0.3 : 0.2}
                    glareAngle={-45}
                    glareSize={250}
                    transitionDuration={1500}
                    className={`h-full transition-shadow hover:shadow-xl backdrop-blur-sm ${isDark
                        ? 'hover:bg-white/5 hover:border-emerald-500/30'
                        : 'hover:border-emerald-200'
                      }`}
                  >
                    <div className="p-8 flex flex-col h-full w-full relative z-10 items-start text-left">
                      <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                        <feature.icon size={24} />
                      </div>
                      <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{feature.desc}</p>
                    </div>
                  </GlareHover>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Workflow */}
          <section className={`py-24 ${isDark ? 'bg-white/2' : 'bg-slate-900/2'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Simplified Workflow
                </h2>
              </motion.div>

              <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 max-w-5xl mx-auto">
                {[
                  { icon: Layers, text: "Select Category" },
                  { icon: Upload, text: "Upload Manuscript" },
                  { icon: CreditCard, text: "Complete Payment" },
                  { icon: CheckCircle, text: "Evaluation" },
                  { icon: Activity, text: "Track Status" },
                ].map((step, i, arr) => (
                  <React.Fragment key={i}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.15 }}
                      className="flex flex-col items-center text-center max-w-35"
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg z-10 relative ${isDark
                          ? 'bg-graphite border border-white/10 text-emerald-400'
                          : 'bg-white border border-slate-200 text-emerald-600'
                        }`}>
                        <step.icon size={24} />
                      </div>
                      <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{step.text}</span>
                    </motion.div>
                    {i < arr.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 + 0.2 }}
                        className="hidden lg:block w-16 h-px border-t-2 border-dashed border-emerald-500/50"
                      />
                    )}
                    {i < arr.length - 1 && (
                      <div className="lg:hidden h-8 border-l-2 border-dashed border-emerald-500/50 my-2" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>



        </main>

        {/* Footer */}
        <footer className={`border-t py-12 transition-colors ${isDark ? 'bg-[#050505] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={rpmsLogo} alt="RPMS Logo" className="h-8 w-auto object-contain" />
              <div className="flex flex-col">
                <span className={`font-bold text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>RPMS</span>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Research Publication Management System</span>
              </div>
            </div>

            <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              &copy; {new Date().getFullYear()} SNS Groups. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
