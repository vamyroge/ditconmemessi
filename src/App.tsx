import React, { useState, useEffect } from 'react';
import { HUD } from './components/HUD';
import { Leaderboard } from './components/Leaderboard';
import { MainBoard } from './components/MainBoard';
import { NormalChallenge } from './components/challenges/NormalChallenge';
import { HardChallenge } from './components/challenges/HardChallenge';
import { ExtremeChallenge } from './components/challenges/ExtremeChallenge';
import { WheelModal } from './components/WheelModal';
import { PodiumScreen } from './components/PodiumScreen';
import { DEFAULT_TEAMS } from './types/game';
import type { CharacterItem, Team, ScoreTransaction, WheelSector } from './types/game';
import { DEMO_CHARACTERS } from './data/demoCharacters';
import { sound } from './services/soundService';

type GamePhase = 'BOARD' | 'CHALLENGE' | 'PODIUM';

// Helper to shuffle the 9 tiles randomly (3 NORMAL, 3 HARD, 3 EXTREME)
function getShuffledCharacters(): CharacterItem[] {
  const shuffled = [...DEMO_CHARACTERS].sort(() => Math.random() - 0.5);
  return shuffled.map(c => ({
    ...c,
    completed: false,
    awardedTeamId: null,
    scoreDelta: null
  }));
}

export const App: React.FC = () => {
  // Game state - Enters BOARD directly without Setup screen
  const [phase, setPhase] = useState<GamePhase>('BOARD');
  const [characters, setCharacters] = useState<CharacterItem[]>(() => getShuffledCharacters());
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [activeCharacter, setActiveCharacter] = useState<CharacterItem | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [answerPhase, setAnswerPhase] = useState<'REWARD' | 'PENALTY' | null>(null);

  // Wheel modal states
  const [activeWheelType, setActiveWheelType] = useState<'REWARD' | 'PENALTY' | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Undo transaction history
  const [transactions, setTransactions] = useState<ScoreTransaction[]>([]);
  const [lastDelta, setLastDelta] = useState<{ teamId: string; delta: number; type: 'REWARD' | 'PENALTY' } | null>(null);

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Load saved state from LocalStorage on mount if exists
  useEffect(() => {
    const saved = localStorage.getItem('whoisthis_gamestate');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.characters && parsed.teams && parsed.characters.length === 9) {
          setCharacters(parsed.characters);
          setTeams(parsed.teams);
          // activeCharacter / wheel state is not persisted, so never restore
          // directly into CHALLENGE (would render a blank screen). Fall back to BOARD.
          if (parsed.phase === 'BOARD' || parsed.phase === 'PODIUM') {
            setPhase(parsed.phase);
          } else {
            setPhase('BOARD');
          }
        }
      } catch {}
    }
  }, []);

  // Save state on change
  useEffect(() => {
    localStorage.setItem(
      'whoisthis_gamestate',
      JSON.stringify({ characters, teams, phase })
    );
  }, [characters, teams, phase]);

  // Select a character tile
  const handleSelectCharacter = (char: CharacterItem) => {
    if (char.completed) return;
    setActiveCharacter(char);
    setIsAnswerRevealed(false);
    setAnswerPhase(null);
    setPhase('CHALLENGE');
  };

  // Host clicks [CORRECT]: Reveal answer first, show compact team buttons under answer
  const handleHostCorrect = () => {
    sound.playCorrect();
    setIsAnswerRevealed(true);
    setAnswerPhase('REWARD');
  };

  // Team selected from compact buttons under revealed answer (Reward)
  const handleSelectRewardTeam = (team: Team) => {
    setSelectedTeam(team);
    setActiveWheelType('REWARD');
    setAnswerPhase(null);
  };

  // Host clicks [WRONG]: Reveal answer first, show compact team buttons under answer
  const handleHostWrong = () => {
    sound.playWrong();
    setIsAnswerRevealed(true);
    setAnswerPhase('PENALTY');
  };

  // Team selected from compact buttons under revealed answer (Penalty)
  const handleSelectPenaltyTeam = (team: Team) => {
    setSelectedTeam(team);
    setActiveWheelType('PENALTY');
    setAnswerPhase(null);
  };

  // Host clicks [Reveal / Skip] (no points awarded or deducted)
  const handleHostRevealNoScore = () => {
    sound.playHintReveal();
    setIsAnswerRevealed(true);

    if (activeCharacter) {
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === activeCharacter.id
            ? { ...c, completed: true, awardedTeamId: null, scoreDelta: 0 }
            : c
        )
      );
    }

    setTimeout(() => {
      setActiveCharacter(null);
      setIsAnswerRevealed(false);
      setPhase('BOARD');
    }, 1800);
  };

  // Commit score from wheel spin
  const handleCommitScore = (finalDelta: number, _baseSector: WheelSector) => {
    if (!activeCharacter || !selectedTeam || !activeWheelType) return;

    // Snapshot current scores for robust undo
    const scoreSnapshot: Record<string, number> = {};
    teams.forEach((t) => {
      scoreSnapshot[t.id] = t.score;
    });

    const newTeamScore = selectedTeam.score + finalDelta;

    // Apply score to team
    setTeams((prev) =>
      prev.map((t) => (t.id === selectedTeam.id ? { ...t, score: newTeamScore } : t))
    );

    // Mark character completed
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === activeCharacter.id
          ? {
              ...c,
              completed: true,
              awardedTeamId: selectedTeam.id,
              scoreDelta: finalDelta
            }
          : c
      )
    );

    // Push transaction to undo stack
    const tx: ScoreTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: Date.now(),
      characterId: activeCharacter.id,
      teamId: selectedTeam.id,
      delta: finalDelta,
      type: activeWheelType,
      difficulty: activeCharacter.difficulty,
      previousScores: scoreSnapshot,
      previousCompleted: false
    };

    setTransactions((prev) => [...prev, tx]);
    setLastDelta({ teamId: selectedTeam.id, delta: finalDelta, type: activeWheelType });

    // Close wheel and return to board
    setActiveWheelType(null);
    setSelectedTeam(null);
    setActiveCharacter(null);
    setIsAnswerRevealed(false);
    setPhase('BOARD');
  };

  // Undo last completed score transaction
  const handleUndo = () => {
    if (transactions.length === 0) return;

    const lastTx = transactions[transactions.length - 1];

    // Restore previous scores
    setTeams((prev) =>
      prev.map((t) => {
        const prevScore = lastTx.previousScores[t.id];
        return prevScore !== undefined ? { ...t, score: prevScore } : t;
      })
    );

    // Restore character uncompleted
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === lastTx.characterId
          ? { ...c, completed: false, awardedTeamId: null, scoreDelta: null }
          : c
      )
    );

    // Pop transaction
    setTransactions((prev) => prev.slice(0, prev.length - 1));
    setLastDelta(null);
    // If undoing the final tile from PODIUM, return to BOARD
    if (phase === 'PODIUM') {
      setPhase('BOARD');
    }
    sound.playScoreDown();
  };

  const completedCount = characters.filter((c) => c.completed).length;

  // Check end game condition
  useEffect(() => {
    if (phase === 'BOARD' && completedCount === 9) {
      const timer = setTimeout(() => {
        setPhase('PODIUM');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phase, completedCount]);

  // New game reset - Resets scores, shuffles tile order, and stays on BOARD
  const handleNewGame = () => {
    localStorage.removeItem('whoisthis_gamestate');
    setCharacters(getShuffledCharacters());
    setTeams(DEFAULT_TEAMS.map(t => ({ ...t, score: 0 })));
    setTransactions([]);
    setLastDelta(null);
    setActiveCharacter(null);
    setIsAnswerRevealed(false);
    setAnswerPhase(null);
    setPhase('BOARD');
  };

  const toggleSound = () => {
    const nextVal = sound.toggleSound();
    setSoundEnabled(nextVal);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#070a14] text-slate-100 overflow-hidden font-['Outfit',sans-serif]">
      {/* Top HUD */}
      <HUD
        roundProgress={{ current: completedCount, total: 9 }}
        canUndo={transactions.length > 0}
        onUndo={handleUndo}
        onNewGame={handleNewGame}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Compact Horizontal Leaderboard (Visible during BOARD and CHALLENGE) */}
      {(phase === 'BOARD' || phase === 'CHALLENGE') && (
        <Leaderboard teams={teams} lastDelta={lastDelta} />
      )}

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* 3x3 MAIN BOARD */}
        {phase === 'BOARD' && (
          <MainBoard
            characters={characters}
            teams={teams}
            onSelectCharacter={handleSelectCharacter}
          />
        )}

        {/* ACTIVE CHALLENGE VIEW */}
        {phase === 'CHALLENGE' && activeCharacter && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeCharacter.difficulty === 'NORMAL' && (
              <NormalChallenge
                key={activeCharacter.id}
                character={activeCharacter}
                revealed={isAnswerRevealed}
                answerPhase={answerPhase}
                teams={teams}
                onCorrect={handleHostCorrect}
                onWrong={handleHostWrong}
                onReveal={handleHostRevealNoScore}
                onBack={() => setPhase('BOARD')}
                onSelectRewardTeam={handleSelectRewardTeam}
                onSelectPenaltyTeam={handleSelectPenaltyTeam}
              />
            )}

            {activeCharacter.difficulty === 'HARD' && (
              <HardChallenge
                key={activeCharacter.id}
                character={activeCharacter}
                revealed={isAnswerRevealed}
                answerPhase={answerPhase}
                teams={teams}
                onCorrect={handleHostCorrect}
                onWrong={handleHostWrong}
                onReveal={handleHostRevealNoScore}
                onBack={() => setPhase('BOARD')}
                onSelectRewardTeam={handleSelectRewardTeam}
                onSelectPenaltyTeam={handleSelectPenaltyTeam}
              />
            )}

            {activeCharacter.difficulty === 'EXTREME' && (
              <ExtremeChallenge
                key={activeCharacter.id}
                character={activeCharacter}
                revealed={isAnswerRevealed}
                answerPhase={answerPhase}
                teams={teams}
                onCorrect={handleHostCorrect}
                onWrong={handleHostWrong}
                onReveal={handleHostRevealNoScore}
                onBack={() => setPhase('BOARD')}
                onSelectRewardTeam={handleSelectRewardTeam}
                onSelectPenaltyTeam={handleSelectPenaltyTeam}
              />
            )}
          </div>
        )}

        {/* FINAL PODIUM */}
        {phase === 'PODIUM' && (
          <PodiumScreen teams={teams} onPlayAgain={handleNewGame} />
        )}
      </div>

      {/* MODAL: FULLSCREEN REWARD / PENALTY WHEEL */}
      {activeWheelType && selectedTeam && activeCharacter && (
        <WheelModal
          type={activeWheelType}
          difficulty={activeCharacter.difficulty}
          team={selectedTeam}
          onCommitScore={handleCommitScore}
        />
      )}
    </div>
  );
};

export default App;
