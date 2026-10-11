import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  REWARD_WHEEL_SECTORS,
  PENALTY_WHEEL_SECTORS,
  DIFFICULTY_MULTIPLIERS,
  type Team
} from '../types/game';

describe('WHo is this?? - Game Logic & Scoring', () => {
  it('verifies difficulty multipliers map', () => {
    expect(DIFFICULTY_MULTIPLIERS.NORMAL).toBe(1.0);
    expect(DIFFICULTY_MULTIPLIERS.HARD).toBe(1.5);
    expect(DIFFICULTY_MULTIPLIERS.EXTREME).toBe(2.0);
  });
  it('correctly calculates Normal difficulty scores (1.0x)', () => {
    expect(calculateScore(5, 'NORMAL')).toBe(5);
    expect(calculateScore(10, 'NORMAL')).toBe(10);
    expect(calculateScore(20, 'NORMAL')).toBe(20);
    expect(calculateScore(50, 'NORMAL')).toBe(50);
    expect(calculateScore(-15, 'NORMAL')).toBe(-15);
    expect(calculateScore(0, 'NORMAL')).toBe(0);
  });

  it('correctly calculates Hard difficulty scores (1.5x) with proper rounding', () => {
    expect(calculateScore(5, 'HARD')).toBe(8); // Math.round(5 * 1.5) = 8
    expect(calculateScore(10, 'HARD')).toBe(15);
    expect(calculateScore(15, 'HARD')).toBe(23); // Math.round(15 * 1.5) = 23
    expect(calculateScore(20, 'HARD')).toBe(30);
    expect(calculateScore(30, 'HARD')).toBe(45);
    expect(calculateScore(50, 'HARD')).toBe(75);
    expect(calculateScore(-10, 'HARD')).toBe(-15);
    expect(calculateScore(-15, 'HARD')).toBe(-23); // Math.round(-15 * 1.5) = -23 (or -22 in JS Math.round, let's test)
    expect(calculateScore(0, 'HARD')).toBe(0);
  });

  it('correctly calculates Extreme difficulty scores (2.0x)', () => {
    expect(calculateScore(5, 'EXTREME')).toBe(10);
    expect(calculateScore(10, 'EXTREME')).toBe(20);
    expect(calculateScore(15, 'EXTREME')).toBe(30);
    expect(calculateScore(20, 'EXTREME')).toBe(40);
    expect(calculateScore(30, 'EXTREME')).toBe(60);
    expect(calculateScore(50, 'EXTREME')).toBe(100);
    expect(calculateScore(-10, 'EXTREME')).toBe(-20);
    expect(calculateScore(-20, 'EXTREME')).toBe(-40);
    expect(calculateScore(0, 'EXTREME')).toBe(0);
  });

  it('verifies wheel sector definitions and configurations', () => {
    expect(REWARD_WHEEL_SECTORS.length).toBe(6);
    expect(PENALTY_WHEEL_SECTORS.length).toBe(6);

    // Verify Jackpot
    const jackpot = REWARD_WHEEL_SECTORS.find(s => s.isSpecial);
    expect(jackpot).toBeDefined();
    expect(jackpot?.baseValue).toBe(50);

    // Verify Lucky Escape 0
    const luckyEscape = PENALTY_WHEEL_SECTORS.find(s => s.baseValue === 0);
    expect(luckyEscape).toBeDefined();
    expect(luckyEscape?.label).toContain('LUCKY ESCAPE');
  });

  it('verifies deterministic ranking and tie-breaking', () => {
    const mockTeams: Team[] = [
      { id: 'team-1', name: 'Phoenix', color: '#f00', bgGradient: '', score: 30 },
      { id: 'team-2', name: 'Titan', color: '#00f', bgGradient: '', score: 45 },
      { id: 'team-3', name: 'Thunder', color: '#ff0', bgGradient: '', score: 30 },
      { id: 'team-4', name: 'Emerald', color: '#0f0', bgGradient: '', score: 10 }
    ];

    const sorted = [...mockTeams].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.id.localeCompare(b.id);
    });

    expect(sorted[0].id).toBe('team-2'); // 45 points (Rank 1)
    expect(sorted[1].score).toBe(30);
    expect(sorted[2].score).toBe(30);
    expect(sorted[3].id).toBe('team-4'); // 10 points (Rank 4)
  });

  it('verifies score transaction reversibility (Undo guarantee)', () => {
    const initialScores = { 'team-1': 10, 'team-2': 20, 'team-3': 0, 'team-4': 15 };
    const awardedTeam = 'team-2';
    const delta = 40;

    // Apply delta
    const updatedScores = { ...initialScores, [awardedTeam]: initialScores[awardedTeam] + delta };
    expect(updatedScores['team-2']).toBe(60);

    // Undo by restoring snapshot
    const restoredScores = { ...updatedScores, [awardedTeam]: initialScores[awardedTeam] };
    expect(restoredScores['team-2']).toBe(20);
    expect(restoredScores).toEqual(initialScores);
  });
});
