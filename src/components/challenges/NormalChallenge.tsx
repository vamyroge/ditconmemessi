import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { CharacterItem, Team } from '../../types/game';
import { JudgeBar } from './JudgeBar';
import { CompactTeamButtons } from '../CompactTeamButtons';

interface NormalChallengeProps {
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

export const NormalChallenge: React.FC<NormalChallengeProps> = ({
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
  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative select-none">
      {/* Top Banner - Blue Neon */}
      <div className="p-3 px-8 flex items-center justify-between border-b border-cyan-500/30 bg-slate-900/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black px-3.5 py-1 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-400/80 uppercase shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            NORMAL MODE — BLUE NEON (1.0x)
          </span>
          <span className="text-slate-400 text-sm hidden sm:inline">
            Look at the picture and raise hands to guess the character
          </span>
        </div>

        {revealed && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-black text-base shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>ANSWER: {character.name}</span>
          </motion.div>
        )}
      </div>

      {/* Main Image Display */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 transform scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${character.imageSrc})` }}
        />

        {/* Framing Container with Blue Neon glow - fixed large stage, small images upscale */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-[min(44rem,94vw)] max-h-[68vh] rounded-3xl overflow-hidden border-4 border-cyan-400/90 shadow-2xl bg-slate-950 glow-blue-neon flex items-center justify-center"
        >
          <img
            src={character.imageSrc}
            alt="Challenge character"
            className="block w-full h-[min(62vh,44rem)] object-contain mx-auto"
          />

          {/* Answer overlay and compact team buttons when revealed */}
          {revealed && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent p-5 pb-6 text-center z-20"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-xl tracking-wider uppercase text-cyan-100">
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
        </motion.div>
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
