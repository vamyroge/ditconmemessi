import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, GripHorizontal, Zap } from 'lucide-react';
import type { CharacterItem, Team } from '../../types/game';
import { JudgeBar } from './JudgeBar';
import { CompactTeamButtons } from '../CompactTeamButtons';
import { sound } from '../../services/soundService';

interface ExtremeChallengeProps {
  character: CharacterItem;
  revealed: boolean;
  answerPhase?: 'REWARD' | 'PENALTY' | null;
  teams: Team[];
  onCorrect: () => void;
  onWrong: () => void;
  onReveal: () => void;
  onBack: () => void;
  onSelectRewardTeam: (team: Team) => void;
  onSelectPenaltyTeam: (team: Team) => void;
}

export const ExtremeChallenge: React.FC<ExtremeChallengeProps> = ({
  character,
  revealed,
  answerPhase = null,
  teams,
  onCorrect,
  onWrong,
  onReveal,
  onBack,
  onSelectRewardTeam,
  onSelectPenaltyTeam
}) => {
  // Curtain reveal percent from bottom: 0% to 100% max
  const [curtainPercent, setCurtainPercent] = useState<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (revealed) return;
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current || revealed) return;
    const rect = containerRef.current.getBoundingClientRect();
    const fromBottom = rect.bottom - e.clientY;
    const pct = Math.max(0, Math.min(100, (fromBottom / rect.height) * 100));
    setCurtainPercent(Math.round(pct));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const setPresetCurtain = (pct: number) => {
    if (revealed) return;
    sound.playClick();
    setCurtainPercent(pct);
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none">
      {/* Top Banner - Purple Hardcore */}
      <div className="p-3 px-6 flex items-center justify-between border-b border-purple-500/30 bg-[#0c0817]/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black px-3.5 py-1 rounded-full bg-purple-950/90 text-purple-200 border border-purple-400 uppercase shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>EXTREME MODE — PURPLE HARDCORE (2.0x)</span>
          </span>
          <span className="text-slate-400 text-sm hidden md:inline">
            Drag the curtain up to inspect the outfit
          </span>
        </div>

        {/* Quick Curtain Preset Buttons */}
        <div className="flex items-center gap-2">
          {!revealed && (
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-purple-500/40 shadow-inner">
              <span className="text-[11px] font-bold text-purple-300 px-1.5">Quick presets:</span>
              <button
                onClick={() => setPresetCurtain(33)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  curtainPercent === 33
                    ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                33%
              </button>
              <button
                onClick={() => setPresetCurtain(66)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  curtainPercent === 66
                    ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                66%
              </button>
              <button
                onClick={() => setPresetCurtain(100)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                  curtainPercent === 100
                    ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                100% (Full)
              </button>
            </div>
          )}

          {revealed && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-200 font-black text-base shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <Sparkles className="w-5 h-5 text-fuchsia-400" />
              <span>ANSWER: {character.name}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Draggable Reveal Box - Purple Hardcore */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
        {/* Ambient Glow */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${character.imageSrc})` }}
        />

        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-fit max-w-[min(28rem,90vw)] max-h-[66vh] rounded-3xl overflow-hidden border-4 border-purple-500 shadow-2xl bg-slate-950 glow-purple-hardcore touch-none select-none"
        >
          {/* Base Character Image - keep full portrait visible, no cropping */}
          <img
            src={character.imageSrc}
            alt="Extreme challenge character"
            className="block w-auto max-w-[min(28rem,90vw)] max-h-[62vh] object-contain mx-auto select-none pointer-events-none"
            draggable={false}
          />

          {/* Opaque Curtain Mask Overlay (moves up from bottom) */}
          {!revealed && (
            <div
              className="absolute inset-x-0 top-0 bg-[#080512] transition-all duration-75 ease-out pointer-events-none"
              style={{
                bottom: `${curtainPercent}%`,
                backgroundImage:
                  'repeating-linear-gradient(45deg, #090514, #090514 15px, #120b24 15px, #120b24 30px)'
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-400/40 opacity-70">
                <span className="text-3xl font-black tracking-widest uppercase">MYSTERY</span>
                <span className="text-xs font-semibold mt-1">Drag the curtain up from below</span>
              </div>
            </div>
          )}

          {/* Draggable Curtain Handle bar */}
          {!revealed && (
            <div
              onPointerDown={handlePointerDown}
              className="absolute inset-x-0 h-11 flex items-center justify-center cursor-ns-resize z-20 transition-all duration-75"
              style={{ bottom: `calc(${curtainPercent}% - 22px)` }}
            >
              <div className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white font-black text-xs flex items-center gap-2 shadow-2xl border-2 border-purple-300 active:scale-105 transition-transform glow-purple-hardcore">
                <GripHorizontal className="w-4 h-4" />
                <span>PULL CURTAIN UP ({curtainPercent}%)</span>
              </div>
            </div>
          )}

          {/* Full answer overlay and compact team buttons on completion */}
          {revealed && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent p-5 pb-6 text-center z-30"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-xl tracking-wider uppercase text-purple-100">
                {character.name}
              </h2>

              {/* Step 2: Compact horizontal team buttons directly beneath answer */}
              {answerPhase === 'REWARD' && (
                <CompactTeamButtons
                  teams={teams}
                  onSelectTeam={onSelectRewardTeam}
                  label="AWARD REWARD TO:"
                />
              )}

              {answerPhase === 'PENALTY' && (
                <CompactTeamButtons
                  teams={teams}
                  onSelectTeam={onSelectPenaltyTeam}
                  label="SELECT PENALIZED TEAM:"
                />
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Host Controls */}
      <JudgeBar
        onCorrect={onCorrect}
        onWrong={onWrong}
        onReveal={onReveal}
        onBack={onBack}
        disabled={!!answerPhase}
      />
    </div>
  );
};
