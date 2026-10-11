import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, AlertOctagon, RotateCcw, X } from 'lucide-react';
import type { Team } from '../types/game';
import { sound } from '../services/soundService';

interface TeamSelectorModalProps {
  type: 'REWARD' | 'PENALTY';
  teams: Team[];
  onSelectTeam: (team: Team) => void;
  onContinueGuessing?: () => void;
  onCancel: () => void;
}

export const TeamSelectorModal: React.FC<TeamSelectorModalProps> = ({
  type,
  teams,
  onSelectTeam,
  onContinueGuessing,
  onCancel
}) => {
  const isReward = type === 'REWARD';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative"
      >
        {/* Close / Cancel Button */}
        <button
          onClick={() => {
            sound.playClick();
            onCancel();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl mb-2 shadow-inner border">
            {isReward ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Trophy className="w-8 h-8" />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <AlertOctagon className="w-8 h-8" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {isReward ? 'SELECT CORRECT TEAM' : 'SELECT PENALIZED TEAM'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isReward
              ? 'Select the winning team to proceed to the REWARD WHEEL!'
              : 'Select the team that guessed wrong to spin the PENALTY WHEEL!'}
          </p>
        </div>

        {/* 4 Team Buttons Grid */}
        <div className="grid grid-cols-2 gap-3.5 mb-5">
          {teams.map((team) => (
            <motion.button
              key={team.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sound.playClick();
                onSelectTeam(team);
              }}
              className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-slate-500 flex items-center justify-between shadow-lg cursor-pointer transition text-left group"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full shadow shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <div>
                  <h3 className="font-black text-white text-base group-hover:text-cyan-300 transition-colors">
                    {team.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">
                    Current: {team.score} pts
                  </span>
                </div>
              </div>

              <span className="text-xs font-black px-2 py-1 rounded-lg bg-slate-700/80 text-slate-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                Select &rarr;
              </span>
            </motion.button>
          ))}
        </div>

        {/* Action options for Wrong answers */}
        {!isReward && onContinueGuessing && (
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Want to allow another guess?</span>
            <button
              onClick={() => {
                sound.playClick();
                onContinueGuessing();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 cursor-pointer transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Let Another Team Guess</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
