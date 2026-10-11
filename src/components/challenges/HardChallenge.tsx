import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, HelpCircle, Eye, Pause, Play, Flame } from 'lucide-react';
import type { CharacterItem, Team } from '../../types/game';
import { JudgeBar } from './JudgeBar';
import { CompactTeamButtons } from '../CompactTeamButtons';
import { sound } from '../../services/soundService';

interface HardChallengeProps {
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

export const HardChallenge: React.FC<HardChallengeProps> = ({
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
  // 10 pieces represented as an array of booleans (false = hidden, true = revealed)
  const [piecesRevealed, setPiecesRevealed] = useState<boolean[]>(() =>
    new Array(10).fill(false)
  );

  // Progressive hints: indices revealed [0..4]
  const [hintCount, setHintCount] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const pieceTimerRef = useRef<number | null>(null);
  const hintTimerRef = useRef<number | null>(null);

  // 1. Reveal one piece every 3 seconds
  useEffect(() => {
    if (revealed || isPaused) return;

    pieceTimerRef.current = window.setInterval(() => {
      setPiecesRevealed((prev) => {
        const unrevealedIndices = prev
          .map((isRev, idx) => (!isRev ? idx : -1))
          .filter((idx) => idx !== -1);

        if (unrevealedIndices.length === 0) {
          if (pieceTimerRef.current) clearInterval(pieceTimerRef.current);
          return prev;
        }

        const randomIdx =
          unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
        const next = [...prev];
        next[randomIdx] = true;
        sound.playHintReveal();
        return next;
      });
    }, 3000);

    return () => {
      if (pieceTimerRef.current) clearInterval(pieceTimerRef.current);
    };
  }, [revealed, isPaused]);

  // 2. Reveal one hint every 6 seconds (up to 5 hints)
  useEffect(() => {
    if (revealed || isPaused) return;

    hintTimerRef.current = window.setInterval(() => {
      setHintCount((prev) => {
        if (prev < 5) {
          sound.playHintReveal();
          return prev + 1;
        }
        if (hintTimerRef.current) clearInterval(hintTimerRef.current);
        return prev;
      });
    }, 6000);

    return () => {
      if (hintTimerRef.current) clearInterval(hintTimerRef.current);
    };
  }, [revealed, isPaused]);

  // Clean up all timers when round ends or answer revealed
  useEffect(() => {
    if (revealed) {
      if (pieceTimerRef.current) clearInterval(pieceTimerRef.current);
      if (hintTimerRef.current) clearInterval(hintTimerRef.current);
      setPiecesRevealed(new Array(10).fill(true));
      setHintCount(5);
    }
  }, [revealed]);

  const revealedPiecesCount = piecesRevealed.filter(Boolean).length;

  const handleManualNextHint = () => {
    if (hintCount < 5) {
      sound.playClick();
      setHintCount((c) => c + 1);
    }
  };

  const handleManualNextPiece = () => {
    setPiecesRevealed((prev) => {
      const unrevealed = prev
        .map((isRev, idx) => (!isRev ? idx : -1))
        .filter((idx) => idx !== -1);
      if (unrevealed.length === 0) return prev;
      const next = [...prev];
      next[unrevealed[0]] = true;
      sound.playHintReveal();
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none">
      {/* Top Banner - Red Neon */}
      <div className="p-3 px-6 flex items-center justify-between border-b border-rose-500/30 bg-slate-900/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black px-3.5 py-1 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/80 uppercase shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>HARD MODE — RED NEON (1.5x)</span>
          </span>
          <span className="text-slate-400 text-sm hidden md:inline">
            10-Tile Mosaic • Progressive Clues
          </span>
        </div>

        {/* Timer status & Manual controls */}
        <div className="flex items-center gap-2">
          {!revealed && (
            <>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsPaused(!isPaused);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-rose-400" />}
                <span>{isPaused ? 'Resume Timer' : 'Pause'}</span>
              </button>

              <button
                onClick={handleManualNextPiece}
                disabled={revealedPiecesCount >= 10}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 cursor-pointer disabled:opacity-40"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal 1 Tile</span>
              </button>
            </>
          )}

          {revealed && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/60 text-rose-300 font-black text-base shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <Sparkles className="w-5 h-5 text-rose-400" />
              <span>ANSWER: {character.name}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content Area: 2-Column Balanced Layout (Image on Left, Large Prominent Hints on Right) */}
      <div className="flex-1 p-3 md:p-6 flex items-center justify-center max-w-6xl mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 w-full items-center max-h-[72vh]">
          {/* Left Column: 10-Piece Visual Shutter Grid (Image) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative w-fit max-w-full max-h-[56vh] rounded-3xl overflow-hidden border-4 border-rose-500/80 shadow-2xl bg-slate-950 glow-red-neon">
              {/* Underlying Character Image - natural ratio, no cropping */}
              <img
                src={character.imageSrc}
                alt="Challenge character"
                className="block w-auto max-w-full max-h-[52vh] object-contain mx-auto"
              />

              {/* 10-Cell Mosaic Mask Overlay */}
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-2">
                {piecesRevealed.map((isRev, idx) => (
                  <div
                    key={idx}
                    className={`border border-rose-950/40 transition-all duration-700 relative flex items-center justify-center overflow-hidden ${
                      isRev
                        ? 'opacity-0 pointer-events-none scale-105'
                        : 'opacity-100 bg-slate-950'
                    }`}
                  >
                    {!isRev && (
                      <div className="flex flex-col items-center justify-center text-rose-700">
                        <HelpCircle className="w-5 h-5 opacity-40 mb-1" />
                        <span className="text-xs font-black tracking-wider opacity-60">
                          {idx + 1}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Answer title and compact team buttons reveal on completion */}
              {revealed && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent p-5 pb-6 text-center z-20"
                >
                  <h2 className="text-3xl font-black text-white drop-shadow-xl tracking-wider uppercase text-rose-100">
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

            {/* Piece progress indicator */}
            <div className="w-full mt-2.5 flex items-center justify-between text-xs text-slate-400 font-bold px-2">
              <span>Revealed: {revealedPiecesCount} / 10 Tiles</span>
              <div className="w-44 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] transition-all duration-300"
                  style={{ width: `${(revealedPiecesCount / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Prominent, High-Contrast Progressive Hints Panel */}
          <div className="lg:col-span-5 flex flex-col justify-center h-full">
            <div className="bg-slate-900/90 border-2 border-rose-500/40 rounded-3xl p-4 md:p-5 shadow-2xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-black tracking-wider text-rose-300 uppercase">
                    CLUES & HINTS ({hintCount}/5)
                  </span>
                </div>
                {!revealed && hintCount < 5 && (
                  <button
                    onClick={handleManualNextHint}
                    className="text-xs font-bold px-3 py-1 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-500/50 hover:bg-rose-500/30 cursor-pointer transition shadow-sm"
                  >
                    + Next Hint
                  </button>
                )}
              </div>

              {/* 5 Distinct Hint Cards */}
              <div className="flex flex-col gap-2">
                {character.hints.map((hintText, index) => {
                  const isUnlocked = index < hintCount;
                  const parts = hintText.split(': ');
                  const label = parts.length > 1 ? parts[0] : `Clue ${index + 1}`;
                  const value = parts.length > 1 ? parts.slice(1).join(': ') : hintText;

                  return (
                    <motion.div
                      key={index}
                      initial={false}
                      animate={isUnlocked ? { opacity: 1, scale: 1 } : { opacity: 0.45, scale: 0.98 }}
                      className={`p-2.5 md:p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border-rose-500/50 shadow-md shadow-rose-950/40 text-slate-100'
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-black text-xs mt-0.5 ${
                          isUnlocked
                            ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        {isUnlocked ? (
                          <div className="leading-snug">
                            <span className="text-xs font-black uppercase tracking-wider text-rose-300 block mb-0.5">
                              {label}
                            </span>
                            <span className="text-sm md:text-base font-bold text-white drop-shadow-sm">
                              {value}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-600 italic">
                            <span>Locked clue (reveals soon...)</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
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
