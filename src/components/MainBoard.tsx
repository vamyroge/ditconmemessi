import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, Dices } from 'lucide-react';
import type { CharacterItem, Difficulty, Team } from '../types/game';
import { TileEnvironmentalVfx } from './TileEnvironmentalVfx';
import { sound } from '../services/soundService';

interface MainBoardProps {
  characters: CharacterItem[];
  teams: Team[];
  onSelectCharacter: (char: CharacterItem) => void;
}

export const MainBoard: React.FC<MainBoardProps> = ({
  characters,
  teams,
  onSelectCharacter
}) => {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isLanded, setIsLanded] = useState<boolean>(false);

  const timeoutsRef = useRef<number[]>([]);

  // Clear pending roulette timers on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const remaining = characters.filter((c) => !c.completed);

  // Full-color difficulty styling configurations
  const getDifficultyStyle = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'NORMAL':
        return {
          label: 'NORMAL (1.0x)',
          borderClass: 'border-cyan-300/90 hover:border-cyan-200',
          bgClass: 'bg-gradient-to-br from-[#023e8a] via-[#005bbd] to-[#01255e]',
          glowClass: 'shadow-[0_0_28px_rgba(6,182,212,0.45)] hover:shadow-[0_0_38px_rgba(6,182,212,0.7)]',
        };
      case 'HARD':
        return {
          label: 'HARD (1.5x)',
          borderClass: 'border-rose-400/90 hover:border-red-300',
          bgClass: 'bg-gradient-to-br from-[#850f0f] via-[#b81d1d] to-[#540606]',
          glowClass: 'shadow-[0_0_30px_rgba(239,68,68,0.55)] hover:shadow-[0_0_42px_rgba(239,68,68,0.8)]',
        };
      case 'EXTREME':
        return {
          label: 'EXTREME (2.0x)',
          borderClass: 'border-fuchsia-400/90 hover:border-fuchsia-300',
          bgClass: 'bg-gradient-to-br from-[#530e84] via-[#7e22ce] to-[#340456]',
          glowClass: 'shadow-[0_0_35px_rgba(192,38,211,0.6)] hover:shadow-[0_0_48px_rgba(192,38,211,0.9)]',
        };
    }
  };

  // Select next character with weighted difficulty probabilities:
  // NORMAL: 50%, HARD: 40%, EXTREME: 10%
  const selectWeightedCharacter = (eligible: CharacterItem[]): CharacterItem => {
    const normalPool = eligible.filter((c) => c.difficulty === 'NORMAL');
    const hardPool = eligible.filter((c) => c.difficulty === 'HARD');
    const extremePool = eligible.filter((c) => c.difficulty === 'EXTREME');

    const roll = Math.random() * 100; // 0..100
    let targetDifficulty: Difficulty;

    if (roll < 50) {
      targetDifficulty = 'NORMAL';
    } else if (roll < 90) {
      targetDifficulty = 'HARD';
    } else {
      targetDifficulty = 'EXTREME';
    }

    // Try target difficulty first
    if (targetDifficulty === 'NORMAL' && normalPool.length > 0) {
      return normalPool[Math.floor(Math.random() * normalPool.length)];
    }
    if (targetDifficulty === 'HARD' && hardPool.length > 0) {
      return hardPool[Math.floor(Math.random() * hardPool.length)];
    }
    if (targetDifficulty === 'EXTREME' && extremePool.length > 0) {
      return extremePool[Math.floor(Math.random() * extremePool.length)];
    }

    // Fallback: If chosen difficulty is depleted, select uniformly from any remaining eligible characters
    return eligible[Math.floor(Math.random() * eligible.length)];
  };

  // Cinematic Decelerating Random Selection
  const handleRandomSelect = () => {
    if (isRolling || remaining.length === 0) return;

    sound.playClick();
    setIsRolling(true);
    setIsLanded(false);

    // Clear any existing timers
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Phase A: Select winner using 50:40:10 weighted difficulty distribution
    const chosen = selectWeightedCharacter(remaining);

    // If only 1 eligible tile remains, jump to it directly with a 1.5s dramatic hold
    if (remaining.length === 1) {
      setHighlightedId(chosen.id);
      setIsLanded(true);
      sound.playSelectTile();

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.55 }
      });

      const t = window.setTimeout(() => {
        setIsRolling(false);
        setIsLanded(false);
        setHighlightedId(null);
        onSelectCharacter(chosen);
      }, 1500);
      timeoutsRef.current.push(t);
      return;
    }

    // Phase B: Multi-step Deceleration Sequence (Roulette)
    const stepDelays = [65, 75, 85, 100, 125, 160, 210, 280, 370, 500];
    const sequence: string[] = [];
    let lastPickId = '';

    for (let i = 0; i < stepDelays.length - 1; i++) {
      const candidates = remaining.filter((c) => c.id !== lastPickId);
      const pick = candidates[Math.floor(Math.random() * candidates.length)] || remaining[0];
      sequence.push(pick.id);
      lastPickId = pick.id;
    }
    // Final hop decisively lands on chosen winner!
    sequence.push(chosen.id);

    let cumulativeTime = 0;

    sequence.forEach((tileId, idx) => {
      const delay = stepDelays[idx];
      cumulativeTime += delay;
      const isFinalHop = idx === sequence.length - 1;

      const timer = window.setTimeout(() => {
        setHighlightedId(tileId);

        if (!isFinalHop) {
          sound.playWheelTick();
        } else {
          // Phase C: Land on the selected tile & trigger dramatic particle burst
          setIsLanded(true);
          sound.playSelectTile();

          confetti({
            particleCount: 50,
            spread: 75,
            origin: { y: 0.55 },
            colors: ['#facc15', '#38bdf8', '#c084fc', '#f43f5e']
          });

          // Phase D: Hold stationary for 1.5s before transitioning to challenge!
          const transitionTimer = window.setTimeout(() => {
            setIsRolling(false);
            setIsLanded(false);
            setHighlightedId(null);
            onSelectCharacter(chosen);
          }, 1500);

          timeoutsRef.current.push(transitionTimer);
        }
      }, cumulativeTime);

      timeoutsRef.current.push(timer);
    });
  };

  return (
    <div className="flex-1 p-3 md:p-5 flex flex-col justify-center items-center overflow-y-auto select-none">
      {/* Action Bar with Prominent 🎲 RANDOM Button */}
      <div className="mb-4 flex items-center justify-center">
        <motion.button
          whileHover={remaining.length > 0 && !isRolling ? { scale: 1.05 } : {}}
          whileTap={remaining.length > 0 && !isRolling ? { scale: 0.95 } : {}}
          onClick={handleRandomSelect}
          disabled={isRolling || remaining.length === 0}
          className={`px-8 py-2.5 rounded-2xl font-black text-sm tracking-wide flex items-center gap-2.5 shadow-2xl transition-all select-none border-2 ${
            remaining.length === 0
              ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
              : isRolling
              ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-amber-400/70 glow-gold cursor-wait scale-105'
              : 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-slate-950 border-amber-200 shadow-amber-500/40 glow-gold cursor-pointer'
          }`}
        >
          <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
          <span>
            {isRolling
              ? isLanded
                ? 'SELECTED! GET READY...'
                : 'SHUFFLING TILES...'
              : remaining.length === 0
              ? 'ALL TILES COMPLETED'
              : `🎲 RANDOM SELECTION (${remaining.length}/9)`}
          </span>
        </motion.button>
      </div>

      {/* 3x3 Responsive Grid - Fixed uniform grid cells (3 cols x 3 rows with identical aspect ratio) */}
      <div className="grid grid-cols-3 grid-rows-3 gap-3.5 md:gap-4 max-w-4xl w-full aspect-[4/3] md:aspect-[16/10]">
        {characters.map((char, index) => {
          const config = getDifficultyStyle(char.difficulty);
          const awardedTeam = teams.find((t) => t.id === char.awardedTeamId);
          const isHighlighted = highlightedId === char.id;

          if (char.completed) {
            return (
              <div
                key={char.id}
                className="w-full h-full min-w-0 min-h-0 box-border relative rounded-2xl md:rounded-3xl bg-slate-900/90 border-2 border-slate-700/80 flex flex-col items-center justify-center p-2.5 text-center overflow-hidden opacity-90 backdrop-blur-sm shadow-xl"
              >
                <div className="absolute top-2 right-2 text-emerald-400 drop-shadow">
                  <CheckCircle2 className="w-5 h-5" />
                </div>

                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-slate-600 mb-1.5 relative shadow-inner shrink-0">
                  <img
                    src={char.imageSrc}
                    alt={char.name}
                    className="w-full h-full object-cover grayscale contrast-110"
                  />
                  <div className="absolute inset-0 bg-slate-950/30" />
                </div>

                <span className="text-xs md:text-sm font-black text-slate-100 truncate max-w-[92%] px-1">
                  {char.name}
                </span>

                {awardedTeam ? (
                  <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800/90 border border-slate-700 max-w-[95%]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: awardedTeam.color }}
                    />
                    <span className="text-slate-200 truncate max-w-[80px]">
                      {awardedTeam.name}
                    </span>
                    {char.scoreDelta !== undefined && char.scoreDelta !== null && (
                      <span
                        className={`shrink-0 font-black ${
                          char.scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        ({char.scoreDelta > 0 ? `+${char.scoreDelta}` : char.scoreDelta})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="mt-1 text-[11px] font-semibold text-slate-400">
                    Revealed (0 pts)
                  </span>
                )}
              </div>
            );
          }

          return (
            <motion.button
              key={char.id}
              aria-label={`Character tile ${index + 1} (${config.label})`}
              whileHover={!isRolling ? { scale: 1.03, y: -3 } : {}}
              whileTap={!isRolling ? { scale: 0.97 } : {}}
              onClick={() => {
                if (isRolling) return;
                sound.playSelectTile();
                onSelectCharacter(char);
              }}
              className={`w-full h-full min-w-0 min-h-0 box-border relative rounded-2xl md:rounded-3xl border-2 p-0 flex flex-col items-center justify-center shadow-2xl cursor-pointer transition-all duration-300 overflow-hidden group select-none ${
                config.bgClass
              } ${config.borderClass} ${config.glowClass} ${
                isHighlighted && isLanded
                  ? 'ring-4 ring-amber-300 animate-land-pulse z-30'
                  : isHighlighted
                  ? 'ring-4 ring-cyan-300 scale-102 z-20 shadow-[0_0_35px_rgba(6,182,212,0.9)]'
                  : ''
              }`}
            >
              {/* Atmospheric Environmental VFX Layer (Smoke / Lava / Lightning) */}
              <TileEnvironmentalVfx difficulty={char.difficulty} />

              {/* Surface Gloss / Ambient Glass Highlight */}
              <div className="card-shine absolute inset-0 pointer-events-none rounded-2xl md:rounded-3xl" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
