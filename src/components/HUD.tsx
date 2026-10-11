import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Undo2, RotateCcw, AlertTriangle } from 'lucide-react';
import { sound } from '../services/soundService';

interface HUDProps {
  roundProgress: { current: number; total: number };
  canUndo: boolean;
  onUndo: () => void;
  onNewGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  roundProgress,
  canUndo,
  onUndo,
  onNewGame,
  soundEnabled,
  onToggleSound
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const toggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <>
      <header className="h-16 px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-30 select-none">
        {/* Logo and Progress */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow">
              WHo is this??
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              GAME SHOW
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400">Progress:</span>
            <span className="text-sm font-bold text-cyan-400">
              {roundProgress.current} / {roundProgress.total} Characters
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Undo Button */}
          <button
            onClick={() => {
              if (canUndo) {
                sound.playClick();
                onUndo();
              }
            }}
            disabled={!canUndo}
            title={canUndo ? "Undo last score transaction" : "No score transactions to undo"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
              canUndo
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 active:scale-95 cursor-pointer shadow-sm'
                : 'bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
            }`}
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden md:inline">Undo</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            title={soundEnabled ? "Mute sound" : "Enable sound"}
            className={`p-2 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="Toggle fullscreen presentation"
            className="p-2 rounded-lg text-sm font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* New Game / Reset */}
          <button
            onClick={() => {
              sound.playClick();
              setShowConfirmReset(true);
            }}
            title="Start a new game"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">New Game</span>
          </button>
        </div>
      </header>

      {/* Confirmation Modal for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Start a New Game?</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Are you sure you want to end the current game? All 4 team scores and progress across the 9 characters will be reset.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowConfirmReset(false);
                  onNewGame();
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 cursor-pointer transition-colors"
              >
                Confirm & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
