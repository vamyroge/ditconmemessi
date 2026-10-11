import React from 'react';
import { motion } from 'framer-motion';
import type { Team } from '../types/game';
import { sound } from '../services/soundService';

interface CompactTeamButtonsProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
  label?: string;
}

export const CompactTeamButtons: React.FC<CompactTeamButtonsProps> = ({
  teams,
  onSelectTeam,
  label = 'AWARD POINTS TO:'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="mt-3 flex flex-col items-center gap-1.5 z-30 select-none"
    >
      <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1 drop-shadow">
        <span>★</span>
        <span>{label}</span>
        <span>★</span>
      </span>

      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        {teams.map((team) => (
          <motion.button
            key={team.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sound.playClick();
              onSelectTeam(team);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border bg-slate-900/90 hover:bg-slate-800 shadow-lg cursor-pointer transition active:scale-95"
            style={{
              borderColor: `${team.color}99`,
              boxShadow: `0 0 12px ${team.color}35`
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shadow shrink-0"
              style={{ backgroundColor: team.color }}
            />
            <span className="text-xs font-black text-white truncate max-w-[120px]">
              {team.name}
            </span>
            <span className="text-[11px] font-bold text-slate-300">
              ({team.score} pts)
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
