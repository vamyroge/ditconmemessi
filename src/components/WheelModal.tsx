import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { REWARD_WHEEL_SECTORS, PENALTY_WHEEL_SECTORS, calculateScore } from '../types/game';
import type { WheelSector, Difficulty, Team } from '../types/game';
import { sound } from '../services/soundService';

interface WheelModalProps {
  type: 'REWARD' | 'PENALTY';
  difficulty: Difficulty;
  team: Team;
  onCommitScore: (finalDelta: number, baseSector: WheelSector) => void;
}

export const WheelModal: React.FC<WheelModalProps> = ({
  type,
  difficulty,
  team,
  onCommitScore
}) => {
  const isReward = type === 'REWARD';
  const baseSectors = isReward ? REWARD_WHEEL_SECTORS : PENALTY_WHEEL_SECTORS;

  // 12 sectors around 360 disk (2 full cycles of the 6 prize sectors for rich visual density)
  const fullSectors: WheelSector[] = [...baseSectors, ...baseSectors];
  const numSectors = fullSectors.length; // 12
  const sectorAngle = 360 / numSectors; // 30 degrees per sector

  // SVG Geometry parameters for giant semicircular stage (90% width)
  const svgWidth = 1200;
  const svgHeight = 670;
  const cx = 600;
  const cy = 70; // Top straight edge center
  const radius = 530; // Outer radius of radiating wedges
  const textRadius = 390; // Radial distance for sector labels

  const [spinning, setSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [pointerFlick, setPointerFlick] = useState<number>(0);
  const [winningSector, setWinningSector] = useState<WheelSector | null>(null);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [finalScoreDelta, setFinalScoreDelta] = useState<number | null>(null);
  const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [marqueeStep, setMarqueeStep] = useState<number>(0);

  const prevAngleRef = useRef<number>(0);
  const spinRafRef = useRef<number | null>(null);
  const marqueeIntervalRef = useRef<number | null>(null);

  // Generate SVG path for a 30-degree sector wedge radiating from (cx, cy)
  const getSectorPath = (index: number) => {
    const startAngleRad = (index * sectorAngle) * (Math.PI / 180);
    const endAngleRad = ((index + 1) * sectorAngle) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startAngleRad);
    const y1 = cy + radius * Math.sin(startAngleRad);
    const x2 = cx + radius * Math.cos(endAngleRad);
    const y2 = cy + radius * Math.sin(endAngleRad);

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
  };

  // Pre-generate rim bulbs positions along the lower arc
  const totalBulbs = 31;
  const bulbs = Array.from({ length: totalBulbs }).map((_, i) => {
    // Semicircle arc spans from 0 to 180 degrees
    const angleRad = (i * (180 / (totalBulbs - 1))) * (Math.PI / 180);
    const bulbR = radius + 22;
    return {
      x: cx + bulbR * Math.cos(angleRad),
      y: cy + bulbR * Math.sin(angleRad),
      angle: i * (180 / (totalBulbs - 1))
    };
  });

  // Chasing rim lights during idle/spin
  useEffect(() => {
    marqueeIntervalRef.current = window.setInterval(() => {
      setMarqueeStep((s) => (s + 1) % 4);
    }, 120);
    return () => {
      if (marqueeIntervalRef.current) clearInterval(marqueeIntervalRef.current);
    };
  }, []);

  // Spin execution (exactly ~3 seconds with Quintic ease-out)
  const startSpin = () => {
    if (spinning || hasSpun) return;

    sound.playClick();
    setSpinning(true);
    setHasSpun(true);

    // 1. Fair random pick from 12 sectors
    const targetIdx = Math.floor(Math.random() * numSectors);
    const winner = fullSectors[targetIdx];
    const calculatedDelta = calculateScore(winner.baseValue, difficulty);

    // Center angle of chosen sector
    const sectorCenterAngle = targetIdx * sectorAngle + sectorAngle / 2; // e.g. targetIdx * 30 + 15

    // Bottom pointer is at angle 90 degrees (pointing directly UP from bottom)
    // We need (sectorCenterAngle + rotation) % 360 == 90
    // => rotationOffset = (90 - sectorCenterAngle + 360) % 360
    const offset = (90 - sectorCenterAngle + 360) % 360;

    // Organic jitter within sector (+- 7 degrees inside 30-deg wedge)
    const jitter = (Math.random() - 0.5) * 14;

    // 5 full rotations + offset (approximately 3 seconds spin)
    const fullSpins = 5;
    const targetTotalRotation = fullSpins * 360 + offset + jitter;

    const startTime = performance.now();
    const duration = 3000; // 3.0 seconds

    // Quintic Ease-Out curve for strong acceleration and natural smooth stop
    const easeOutQuint = (x: number): number => 1 - Math.pow(1 - x, 5);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = easeOutQuint(progress);
      const currentRot = targetTotalRotation * ease;

      setRotation(currentRot);

      // Check if crossed a 30-degree sector peg for synchronized ticking
      if (Math.floor(currentRot / sectorAngle) > Math.floor(prevAngleRef.current / sectorAngle)) {
        sound.playWheelTick();
        setPointerFlick(-9 * (1 - progress)); // Needle bounce
      } else {
        setPointerFlick((f) => f * 0.82); // Needle spring back
      }
      prevAngleRef.current = currentRot;

      if (progress < 1) {
        spinRafRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished precisely at 3s
        setSpinning(false);
        setPointerFlick(0);
        setWinningSector(winner);
        setWinningIndex(targetIdx);
        setFinalScoreDelta(calculatedDelta);

        // Confetti burst
        confetti({
          particleCount: 55,
          spread: 80,
          origin: { x: 0.5, y: 0.85 }
        });

        if (winner.baseValue >= 0) {
          sound.playWheelWin();
        } else {
          sound.playScoreDown();
        }
      }
    };

    spinRafRef.current = requestAnimationFrame(animate);
  };

  // Auto-start spin 400ms after component mounts so host doesn't need redundant clicks
  useEffect(() => {
    const timer = setTimeout(() => {
      startSpin();
    }, 450);

    return () => {
      clearTimeout(timer);
      if (spinRafRef.current) cancelAnimationFrame(spinRafRef.current);
    };
  }, []);

  const multiplierText =
    difficulty === 'EXTREME' ? '2.0x' : difficulty === 'HARD' ? '1.5x' : '1.0x';

  const difficultyLabel =
    difficulty === 'EXTREME'
      ? 'EXTREME (2.0x)'
      : difficulty === 'HARD'
      ? 'HARD (1.5x)'
      : 'NORMAL (1.0x)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-2xl p-4 select-none animate-in fade-in duration-300 overflow-hidden">
      {/* Background Stage Light Cones */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-32 left-1/4 w-96 h-[800px] blur-3xl opacity-20 transform -rotate-12 ${
            isReward ? 'bg-cyan-500' : 'bg-rose-600'
          }`}
        />
        <div
          className={`absolute -top-32 right-1/4 w-96 h-[800px] blur-3xl opacity-20 transform rotate-12 ${
            isReward ? 'bg-amber-400' : 'bg-purple-600'
          }`}
        />
      </div>

      <div className="relative max-w-6xl w-full flex flex-col items-center justify-between h-[96vh]">
        {/* Top Header Banner */}
        <div className="w-full flex items-center justify-between px-6 pt-2 z-20">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-black px-4 py-1.5 rounded-full border tracking-wider uppercase shadow-lg ${
                isReward
                  ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400/80 glow-blue-neon'
                  : 'bg-rose-950/90 text-rose-300 border-rose-500/80 glow-red-neon'
              }`}
            >
              {isReward ? 'REWARD WHEEL' : 'PENALTY WHEEL'}
            </span>

            <span className="text-xs font-black px-3 py-1.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/60 uppercase">
              {difficultyLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-300">SPINNING FOR:</span>
            <span
              className="text-base font-black px-4 py-1 rounded-xl shadow-lg border"
              style={{
                backgroundColor: `${team.color}25`,
                borderColor: team.color,
                color: '#ffffff'
              }}
            >
              {team.name}
            </span>
          </div>
        </div>

        {/* GIANT SEMICIRCULAR PRIZE WHEEL STAGE (Dominates 85-95% screen width) */}
        <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-auto overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-[70vh] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
          >
            <defs>
              {/* Outer rim neon glow */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Metallic Hub Gradient */}
              <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="40%" stopColor="#94a3b8" />
                <stop offset="70%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>

              {/* Straight Edge Stage Truss */}
              <linearGradient id="trussGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* Straight Upper Stage Border Bar */}
            <rect
              x="40"
              y="54"
              width="1120"
              height="28"
              rx="14"
              fill="url(#trussGradient)"
              stroke="#0f172a"
              strokeWidth="4"
            />

            {/* ROTATING WHEEL DISK */}
            <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
              {fullSectors.map((sec, idx) => {
                const isSelected = !spinning && winningIndex === idx;
                const centerAngle = idx * sectorAngle + sectorAngle / 2;

                return (
                  <g key={idx}>
                    {/* Wedge Path */}
                    <path
                      d={getSectorPath(idx)}
                      fill={sec.color}
                      stroke="#070a14"
                      strokeWidth="3.5"
                      className={`transition-opacity duration-300 ${
                        isSelected ? 'filter brightness-125' : ''
                      }`}
                    />

                    {/* Sector Text Label (Transformed to read upright at bottom pointer) */}
                    <g transform={`rotate(${centerAngle}, ${cx}, ${cy})`}>
                      <text
                        x={cx + textRadius}
                        y={cy}
                        transform={`rotate(-90, ${cx + textRadius}, ${cy})`}
                        fill="#ffffff"
                        fontSize={sec.isSpecial ? '21' : '28'}
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)] tracking-wider"
                      >
                        {sec.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* FIXED SEMICIRCULAR OUTER CASING & RIM */}
            {/* Outer Arch Border */}
            <path
              d={`M ${cx - radius - 8} ${cy} A ${radius + 8} ${radius + 8} 0 0 1 ${cx + radius + 8} ${cy}`}
              fill="none"
              stroke={isReward ? '#06b6d4' : '#ef4444'}
              strokeWidth="14"
              strokeLinecap="round"
              filter="url(#neonGlow)"
            />

            <path
              d={`M ${cx - radius - 28} ${cy} A ${radius + 28} ${radius + 28} 0 0 1 ${cx + radius + 28} ${cy}`}
              fill="none"
              stroke="#0f172a"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Animated Marquee LED Bulbs around the Semicircular Rim */}
            {bulbs.map((bulb, i) => {
              const isLit = (i + marqueeStep) % 2 === 0;
              const bulbColor = isReward
                ? isLit
                  ? '#38bdf8'
                  : '#facc15'
                : isLit
                ? '#f43f5e'
                : '#fbbf24';

              return (
                <circle
                  key={i}
                  cx={bulb.x}
                  cy={bulb.y}
                  r={isLit ? 7 : 5}
                  fill={bulbColor}
                  stroke="#020617"
                  strokeWidth="2"
                  className="transition-all duration-100"
                  style={{
                    filter: isLit ? 'drop-shadow(0 0 6px currentColor)' : 'none'
                  }}
                />
              );
            })}

            {/* Central Metallic Hub at Top Center (cx, cy) */}
            <circle
              cx={cx}
              cy={cy}
              r="62"
              fill="url(#hubGradient)"
              stroke="#f8fafc"
              strokeWidth="6"
              className="filter drop-shadow-xl"
            />
            <circle
              cx={cx}
              cy={cy}
              r="34"
              fill="#090d16"
              stroke={isReward ? '#06b6d4' : '#f43f5e'}
              strokeWidth="4"
            />
            <text
              x={cx}
              y={cy + 5}
              fill="#ffffff"
              fontSize="14"
              fontWeight="900"
              textAnchor="middle"
              className="tracking-widest uppercase"
            >
              SPIN
            </text>

            {/* FIXED POINTER NEEDLE AT BOTTOM APEX (Pointing directly UP into winning sector) */}
            <g
              transform={`translate(${cx}, ${cy + radius - 4}) rotate(${pointerFlick})`}
              className="filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.9)]"
            >
              {/* Needle Arrow Tip */}
              <polygon
                points="0,-38 -18,16 18,16"
                fill="url(#hubGradient)"
                stroke="#facc15"
                strokeWidth="3.5"
              />
              {/* Pointer Center Peg */}
              <circle cx="0" cy="16" r="10" fill="#facc15" stroke="#78350f" strokeWidth="2.5" />
            </g>
          </svg>
        </div>

        {/* BOTTOM ACTION & RESULT DOCK */}
        <div className="w-full flex flex-col items-center justify-center pb-4 min-h-[105px] z-20">
          <AnimatePresence>
            {winningSector && finalScoreDelta !== null && !spinning && (
              <motion.div
                initial={{ scale: 0.75, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col md:flex-row items-center justify-center gap-6 bg-slate-900/90 border-2 border-slate-700/80 p-4 px-8 rounded-3xl shadow-2xl backdrop-blur-xl"
              >
                {/* Result formula */}
                <div className="flex items-center gap-3 text-lg md:text-2xl font-black text-white">
                  <span className="text-amber-400 text-2xl md:text-3xl font-extrabold drop-shadow">
                    {winningSector.label}
                  </span>
                  <span className="text-slate-500 font-normal">×</span>
                  <span className="text-purple-300 font-bold">{multiplierText}</span>
                  <span className="text-slate-500 font-normal">=</span>
                  <span
                    className={`text-2xl md:text-4xl font-black drop-shadow-xl ${
                      finalScoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {finalScoreDelta > 0 ? `+${finalScoreDelta}` : finalScoreDelta} PTS
                  </span>
                  <span className="text-sm font-semibold text-slate-300 ml-1">
                    for {team.name}
                  </span>
                </div>

                {/* Continue button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    sound.playClick();
                    onCommitScore(finalScoreDelta, winningSector);
                  }}
                  className="px-8 py-3.5 rounded-2xl text-base font-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-xl shadow-emerald-500/30 flex items-center gap-2.5 cursor-pointer transition glow-gold"
                >
                  <span>CONTINUE & UPDATE SCORES</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spin status indicator when moving */}
          {spinning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-cyan-300 font-black tracking-widest text-base uppercase animate-pulse flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>SPINNING... WATCH FOR THE RESULT!</span>
              <Sparkles className="w-5 h-5 animate-spin" />
            </motion.div>
          )}

          {/* Idle / manual spin button if not yet spinning */}
          {!spinning && !winningSector && (
            <button
              onClick={startSpin}
              className="px-8 py-3 rounded-2xl font-black text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xl flex items-center gap-2 cursor-pointer transition active:scale-95 glow-gold"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>CLICK TO SPIN NOW</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
