import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import type { Team } from '../types/game';

interface LeaderboardProps {
  teams: Team[];
  lastDelta?: { teamId: string; delta: number; type: 'REWARD' | 'PENALTY' } | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ teams, lastDelta }) => {
  // Sort teams descending by score. Deterministic tie-break by team ID order.
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });

  // Calculate rank with shared rank support for tied scores
  const getRank = (index: number, score: number): number => {
    if (index === 0) return 1;
    const prev = sortedTeams[index - 1];
    if (prev.score === score) {
      return sortedTeams.findIndex((t) => t.score === score) + 1;
    }
    return index + 1;
  };

  const highestScore = sortedTeams[0]?.score ?? 0;

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 z-20 select-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Subtle Side Trophy Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider shrink-0 pr-3 border-r border-slate-800">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>LEADERBOARD</span>
        </div>

        {/* 4 Team Entries with Comfortable Vertical Space */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          <AnimatePresence mode="popLayout">
            {sortedTeams.map((team, index) => {
              const rank = getRank(index, team.score);
              const isLeader = rank === 1 && highestScore > 0;
              const hasRecentDelta = lastDelta?.teamId === team.id;

              return (
                <motion.div
                  key={team.id}
                  layout
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  className={`relative p-2.5 px-3 rounded-2xl border flex flex-col justify-between items-center transition-all min-h-[64px] min-w-0 ${
                    isLeader
                      ? 'bg-amber-500/15 border-amber-400/70 shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/40'
                      : 'bg-slate-800/85 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  {/* Top Bar: Rank & Team Badge */}
                  <div className="w-full flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`text-[10px] md:text-[11px] font-black px-1.5 py-0.5 rounded-md flex items-center justify-center shrink-0 ${
                          rank === 1
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : rank === 2
                            ? 'bg-slate-300 text-slate-950 font-bold'
                            : rank === 3
                            ? 'bg-amber-700 text-amber-100 font-bold'
                            : 'bg-slate-700 text-slate-300 font-semibold'
                        }`}
                      >
                        {isLeader ? <Crown className="w-3 h-3 fill-current" /> : `#${rank}`}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="font-bold text-[11px] md:text-xs text-slate-300 truncate">
                        {team.name}
                      </span>
                    </div>

                    {/* Animated Floating Score Delta */}
                    <AnimatePresence>
                      {hasRecentDelta && (
                        <motion.span
                          initial={{ opacity: 0, y: -4, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className={`flex items-center text-xs font-black shrink-0 ${
                            lastDelta.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {lastDelta.delta >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                          )}
                          {lastDelta.delta > 0 ? `+${lastDelta.delta}` : lastDelta.delta}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Center / Dominant Feature: Extra Large, High-Contrast Score */}
                  <div className="my-0.5 flex items-baseline justify-center gap-1 w-full text-center">
                    <span
                      className={`font-black text-2xl md:text-3xl tracking-tight leading-none drop-shadow-md ${
                        team.score > 0
                          ? 'text-cyan-300'
                          : team.score < 0
                          ? 'text-rose-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {team.score}
                    </span>
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      pts
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
