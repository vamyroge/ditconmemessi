import React from 'react';
import { Check, X, Eye, ArrowLeft } from 'lucide-react';
import { sound } from '../../services/soundService';

interface JudgeBarProps {
  onCorrect: () => void;
  onWrong: () => void;
  onReveal: () => void;
  onBack: () => void;
  disabled?: boolean;
}

export const JudgeBar: React.FC<JudgeBarProps> = ({
  onCorrect,
  onWrong,
  onReveal,
  onBack,
  disabled = false
}) => {
  return (
    <div className="w-full bg-slate-900/90 border-t border-slate-800 p-3 md:p-4 px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 z-20 backdrop-blur-md select-none">
      {/* Back button */}
      <button
        onClick={() => {
          sound.playClick();
          onBack();
        }}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Board</span>
      </button>

      {/* Primary Host Judgment Buttons */}
      <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
        {/* Reveal without points */}
        <button
          onClick={() => {
            sound.playClick();
            onReveal();
          }}
          disabled={disabled}
          title="If no team can guess correctly, reveal the answer and continue without scoring changes"
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Eye className="w-5 h-5 text-slate-400" />
          <span>Reveal Answer (0 pts)</span>
        </button>

        {/* Wrong button */}
        <button
          onClick={() => {
            sound.playClick();
            onWrong();
          }}
          disabled={disabled}
          className="flex items-center gap-2 px-7 py-3 rounded-xl text-base font-black bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30 border border-rose-400/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <X className="w-6 h-6 stroke-[3]" />
          <span>✕ WRONG</span>
        </button>

        {/* Correct button */}
        <button
          onClick={() => {
            sound.playClick();
            onCorrect();
          }}
          disabled={disabled}
          className="flex items-center gap-2 px-8 py-3 rounded-xl text-base font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30 border border-emerald-300/60 transition-all cursor-pointer active:scale-95 disabled:opacity-50 glow-cyan"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          <span>✓ CORRECT</span>
        </button>
      </div>
    </div>
  );
};
