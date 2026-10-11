export type Difficulty = 'NORMAL' | 'HARD' | 'EXTREME';

export interface CharacterItem {
  id: string;
  name: string;
  imageSrc: string; // Data URL or external image URL
  difficulty: Difficulty;
  hints: [string, string, string, string, string]; // 5 hints from difficult to easy
  faceFocus?: {
    x: number; // 0-100% horizontal center
    y: number; // 0-100% vertical center
    radius: number; // 0-100% mask coverage
  };
  completed: boolean;
  awardedTeamId?: string | null;
  scoreDelta?: number | null;
}

export interface Team {
  id: string;
  name: string;
  color: string; // Hex color
  bgGradient: string; // Tailwind/CSS gradient
  score: number;
}

export interface ScoreTransaction {
  id: string;
  timestamp: number;
  characterId: string;
  teamId: string;
  delta: number;
  type: 'REWARD' | 'PENALTY';
  difficulty: Difficulty;
  previousScores: Record<string, number>;
  previousCompleted: boolean;
}

export interface WheelSector {
  id: string;
  label: string;
  baseValue: number;
  color: string;
  isSpecial?: boolean;
}

export const REWARD_WHEEL_SECTORS: WheelSector[] = [
  { id: 'r1', label: '+5', baseValue: 5, color: '#06B6D4' },        // Cyan
  { id: 'r2', label: '+10', baseValue: 10, color: '#3B82F6' },      // Blue
  { id: 'r3', label: '+15', baseValue: 15, color: '#8B5CF6' },      // Violet
  { id: 'r4', label: '+20', baseValue: 20, color: '#EC4899' },      // Pink
  { id: 'r5', label: '+30', baseValue: 30, color: '#F59E0B' },      // Amber
  { id: 'r6', label: 'JACKPOT +50', baseValue: 50, color: '#10B981', isSpecial: true } // Emerald Jackpot
];

export const PENALTY_WHEEL_SECTORS: WheelSector[] = [
  { id: 'p1', label: '-5', baseValue: -5, color: '#F97316' },       // Orange
  { id: 'p2', label: '-10', baseValue: -10, color: '#EF4444' },     // Red
  { id: 'p3', label: '-15', baseValue: -15, color: '#DC2626' },     // Crimson
  { id: 'p4', label: '-20', baseValue: -20, color: '#B91C1C' },     // Deep Red
  { id: 'p5', label: '-30', baseValue: -30, color: '#7F1D1D' },     // Dark Red
  { id: 'p6', label: 'LUCKY ESCAPE (0)', baseValue: 0, color: '#10B981', isSpecial: true } // Lucky Escape
];

export const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  NORMAL: 1.0,
  HARD: 1.5,
  EXTREME: 2.0
};

export function calculateScore(baseValue: number, difficulty: Difficulty): number {
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
  const sign = baseValue < 0 ? -1 : 1;
  return sign * Math.round(Math.abs(baseValue) * multiplier);
}

export const DEFAULT_TEAMS: Team[] = [
  { id: 'team-1', name: 'Group 1', color: '#EF4444', bgGradient: 'from-red-500 to-rose-600', score: 0 },
  { id: 'team-2', name: 'Group 2', color: '#3B82F6', bgGradient: 'from-blue-500 to-cyan-600', score: 0 },
  { id: 'team-3', name: 'Group 3', color: '#F59E0B', bgGradient: 'from-amber-400 to-orange-500', score: 0 },
  { id: 'team-4', name: 'Group 4', color: '#10B981', bgGradient: 'from-emerald-400 to-teal-600', score: 0 },
];
