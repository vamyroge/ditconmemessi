import React from 'react';
import type { Difficulty } from '../types/game';

interface TileEnvironmentalVfxProps {
  difficulty: Difficulty;
}

export const TileEnvironmentalVfx: React.FC<TileEnvironmentalVfxProps> = ({ difficulty }) => {
  if (difficulty === 'NORMAL') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl select-none">
        {/* Soft cyan center illumination cone */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(56,189,248,0.4)_0%,rgba(6,182,212,0.15)_45%,transparent_75%)]" />

        {/* Ambient drifting smoke wisp 1 */}
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-400/25 via-sky-300/15 to-transparent blur-2xl animate-smoke-1" />

        {/* Ambient drifting smoke wisp 2 */}
        <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-gradient-to-bl from-blue-400/25 via-cyan-500/20 to-transparent blur-2xl animate-smoke-2" />

        {/* Floating mist cloud layer 3 */}
        <div className="absolute top-1/4 left-1/6 w-56 h-48 rounded-full bg-cyan-300/15 blur-xl animate-smoke-3" />

        {/* Subtle luminous blue dust motes */}
        <div className="absolute top-1/5 left-1/4 w-1.5 h-1.5 rounded-full bg-cyan-200/80 blur-[0.5px] shadow-[0_0_8px_#38bdf8] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-sky-200/70 blur-[0.5px] shadow-[0_0_10px_#0284c7] animate-pulse [animation-delay:1.5s]" />
      </div>
    );
  }

  if (difficulty === 'HARD') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl select-none">
        {/* Warm molten magma core glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(249,115,22,0.45)_0%,rgba(220,38,38,0.2)_55%,transparent_80%)]" />

        {/* SVG Molten Lava Veins / Cracks */}
        <svg
          viewBox="0 0 200 240"
          className="absolute inset-0 w-full h-full animate-lava-veins opacity-80"
          preserveAspectRatio="none"
        >
          {/* Main vertical branching crack */}
          <path
            d="M 30,0 Q 45,45 25,75 T 45,130 T 20,185 T 40,240"
            fill="none"
            stroke="#ff5722"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 25,75 Q 60,95 85,115 T 120,150"
            fill="none"
            stroke="#fb923c"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Right edge branching crack */}
          <path
            d="M 175,0 Q 155,50 178,95 T 160,165 T 185,240"
            fill="none"
            stroke="#ff4500"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 178,95 Q 140,110 115,130"
            fill="none"
            stroke="#f97316"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Bottom transverse fissure */}
          <path
            d="M 0,195 Q 60,185 100,205 T 200,195"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        {/* Rising glowing embers */}
        <div className="absolute bottom-6 left-1/5 w-1.5 h-1.5 rounded-full bg-amber-300 blur-[0.5px] shadow-[0_0_8px_#f59e0b] animate-ember-1" />
        <div className="absolute bottom-4 left-1/2 w-2 h-2 rounded-full bg-orange-400 blur-[0.5px] shadow-[0_0_10px_#ea580c] animate-ember-2" />
        <div className="absolute bottom-8 right-1/4 w-1.5 h-1.5 rounded-full bg-yellow-300 blur-[0.5px] shadow-[0_0_8px_#eab308] animate-ember-3" />
      </div>
    );
  }

  // EXTREME DIFFICULTY
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl select-none">
      {/* High-voltage electric center field */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(192,38,211,0.45)_0%,rgba(147,51,234,0.2)_50%,transparent_75%)] animate-electric-pulse" />

      {/* SVG Lightning Arcs - Layer 1 */}
      <svg
        viewBox="0 0 200 240"
        className="absolute inset-0 w-full h-full animate-lightning-1"
        preserveAspectRatio="none"
      >
        {/* Left perimeter lightning strike */}
        <polyline
          points="20,5 35,45 15,70 40,110 22,145 38,185 12,235"
          fill="none"
          stroke="#f0abfc"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Branching internal bolt */}
        <polyline
          points="40,110 75,125 65,150 110,170"
          fill="none"
          stroke="#e879f9"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* SVG Lightning Arcs - Layer 2 */}
      <svg
        viewBox="0 0 200 240"
        className="absolute inset-0 w-full h-full animate-lightning-2"
        preserveAspectRatio="none"
      >
        {/* Right perimeter lightning strike */}
        <polyline
          points="180,10 165,50 188,85 160,130 182,175 168,230"
          fill="none"
          stroke="#fae8ff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Top diagonal bolt */}
        <polyline
          points="80,5 105,30 95,55 135,75"
          fill="none"
          stroke="#d946ef"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Pulsing electrical spark nodes */}
      <div className="absolute top-1/4 right-1/3 w-2 h-2 rounded-full bg-fuchsia-300 blur-[0.5px] shadow-[0_0_12px_#c084fc] animate-pulse" />
      <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-purple-200 blur-[0.5px] shadow-[0_0_8px_#d946ef] animate-pulse [animation-delay:1.1s]" />
    </div>
  );
};
