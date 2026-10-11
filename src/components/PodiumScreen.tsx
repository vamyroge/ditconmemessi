import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Sparkles, RotateCcw, Award } from 'lucide-react';
import type { Team } from '../types/game';
import { sound } from '../services/soundService';

interface PodiumScreenProps {
  teams: Team[];
  onPlayAgain: () => void;
}

export const PodiumScreen: React.FC<PodiumScreenProps> = ({ teams, onPlayAgain }) => {
  // Sort descending by score. Tie break by team ID.
  const sorted = [...teams].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });

  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const fourth = sorted[3];

  const isCoChampion = second && second.score === first.score;

  // Fire celebratory confetti and play victory fanfare on mount
  useEffect(() => {
    sound.playVictory();

    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 }
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 }
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 select-none relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-[#070a14]">
      {/* Top Victory Header */}
      <div className="text-center pt-4 z-10">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 mb-3"
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-black uppercase tracking-widest">
            FINAL PODIUM CEREMONY
          </span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </motion.div>

        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white drop-shadow-xl flex items-center justify-center gap-3"
        >
          <Crown className="w-10 h-10 text-amber-400 fill-amber-400" />
          <span>
            {isCoChampion
              ? `CO-CHAMPIONS: ${first.name} & ${second.name}!`
              : `CHAMPION: ${first.name}!`}
          </span>
          <Crown className="w-10 h-10 text-amber-400 fill-amber-400" />
        </motion.h1>
      </div>

      {/* 3D Olympic Podium Center Display */}
      <div className="flex-1 max-w-5xl mx-auto w-full flex items-end justify-center gap-4 md:gap-8 pb-10 z-10">
        {/* 2nd Place: Silver Podium */}
        {second && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 max-w-[220px] flex flex-col items-center"
          >
            <div className="mb-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-300 text-slate-950 flex items-center justify-center shadow-lg font-black text-xl mb-2 mx-auto border-2 border-white">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-200 truncate">{second.name}</h3>
              <span className="text-xl font-black text-cyan-400">{second.score} pts</span>
            </div>

            <div className="w-full h-44 rounded-t-3xl bg-gradient-to-b from-slate-400 to-slate-700 border-t-4 border-slate-300 shadow-2xl flex flex-col items-center justify-center p-4">
              <span className="text-3xl font-black text-white drop-shadow">2ND PLACE</span>
              <span className="text-xs font-bold text-slate-200 mt-1 uppercase">RUNNER-UP</span>
            </div>
          </motion.div>
        )}

        {/* 1st Place: Gold Podium */}
        {first && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 max-w-[260px] flex flex-col items-center -mt-10"
          >
            <div className="mb-3 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 flex items-center justify-center shadow-2xl font-black text-3xl mb-2 mx-auto border-4 border-amber-200 glow-gold animate-bounce">
                <Crown className="w-10 h-10 fill-current" />
              </div>
              <h3 className="text-lg font-black text-amber-300 truncate">{first.name}</h3>
              <span className="text-3xl font-black text-amber-400">{first.score} pts</span>
            </div>

            <div className="w-full h-64 rounded-t-3xl bg-gradient-to-b from-amber-400 to-amber-700 border-t-4 border-amber-200 shadow-2xl flex flex-col items-center justify-center p-4 glow-gold">
              <span className="text-4xl font-black text-white drop-shadow-lg">1ST PLACE</span>
              <span className="text-sm font-black text-amber-100 mt-1 uppercase tracking-wider">
                CHAMPION
              </span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place: Bronze Podium */}
        {third && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 max-w-[220px] flex flex-col items-center"
          >
            <div className="mb-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-700 text-amber-100 flex items-center justify-center shadow-lg font-black text-xl mb-2 mx-auto border-2 border-amber-500">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-200 truncate">{third.name}</h3>
              <span className="text-xl font-black text-cyan-400">{third.score} pts</span>
            </div>

            <div className="w-full h-36 rounded-t-3xl bg-gradient-to-b from-amber-700 to-amber-900 border-t-4 border-amber-500 shadow-2xl flex flex-col items-center justify-center p-4">
              <span className="text-3xl font-black text-white drop-shadow">3RD PLACE</span>
              <span className="text-xs font-bold text-amber-200 mt-1 uppercase">BRONZE</span>
            </div>
          </motion.div>
        )}

        {/* 4th Place: Honorable */}
        {fourth && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex-1 max-w-[190px] flex flex-col items-center"
          >
            <div className="mb-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center shadow-lg font-black text-lg mb-2 mx-auto border border-slate-700">
                #4
              </div>
              <h3 className="text-sm font-bold text-slate-300 truncate">{fourth.name}</h3>
              <span className="text-lg font-bold text-slate-400">{fourth.score} pts</span>
            </div>

            <div className="w-full h-28 rounded-t-3xl bg-slate-800/80 border-t-2 border-slate-700 shadow-xl flex flex-col items-center justify-center p-4">
              <span className="text-2xl font-black text-slate-400">4TH PLACE</span>
              <span className="text-xs text-slate-500 mt-0.5">HONORABLE</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-4 flex items-center justify-center z-10 border-t border-slate-800/80">
        <button
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="px-8 py-3.5 rounded-2xl text-base font-black bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 shadow-2xl flex items-center gap-2.5 cursor-pointer active:scale-95 transition glow-cyan"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
