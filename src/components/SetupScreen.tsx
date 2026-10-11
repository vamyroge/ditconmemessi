import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle2, AlertCircle, Play, Shuffle, Image as ImageIcon, Crosshair } from 'lucide-react';
import type { CharacterItem, Difficulty, Team } from '../types/game';
import { DEMO_CHARACTERS } from '../data/demoCharacters';
import { sound } from '../services/soundService';

interface SetupScreenProps {
  initialCharacters: CharacterItem[];
  initialTeams: Team[];
  onStartGame: (characters: CharacterItem[], teams: Team[]) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  initialCharacters,
  initialTeams,
  onStartGame
}) => {
  const [characters, setCharacters] = useState<CharacterItem[]>(() => {
    return initialCharacters.length === 9 ? initialCharacters : DEMO_CHARACTERS;
  });

  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [tuningFaceIndex, setTuningFaceIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle batch file upload
  const handleBatchUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    sound.playClick();
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('Please select valid image files (PNG, JPG, WebP).');
      return;
    }

    const filesToProcess = imageFiles.slice(0, 9);

    filesToProcess.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setCharacters((prev) => {
          const next = [...prev];
          if (next[index]) {
            next[index] = {
              ...next[index],
              imageSrc: dataUrl,
              // If name was blank or default, auto-suggest from filename without extension
              name: next[index].name || file.name.replace(/\.[^/.]+$/, '')
            };
          }
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Auto-distribute exactly 3 Normal, 3 Hard, 3 Extreme
  const handleAutoDistribute = () => {
    sound.playClick();
    const difficulties: Difficulty[] = [
      'NORMAL', 'NORMAL', 'NORMAL',
      'HARD', 'HARD', 'HARD',
      'EXTREME', 'EXTREME', 'EXTREME'
    ];
    // Shuffle
    const shuffled = [...difficulties].sort(() => Math.random() - 0.5);

    setCharacters(prev =>
      prev.map((char, idx) => ({
        ...char,
        difficulty: shuffled[idx]
      }))
    );
  };

  // Load demo preset
  const handleLoadDemo = () => {
    sound.playClick();
    setCharacters(DEMO_CHARACTERS);
  };

  // Validation checks
  const normalCount = characters.filter(c => c.difficulty === 'NORMAL').length;
  const hardCount = characters.filter(c => c.difficulty === 'HARD').length;
  const extremeCount = characters.filter(c => c.difficulty === 'EXTREME').length;

  const errors: string[] = [];
  if (characters.some(c => !c.name.trim())) {
    errors.push('All 9 characters must have a name.');
  }
  if (characters.some(c => !c.imageSrc)) {
    errors.push('All 9 characters must have an image.');
  }
  if (teams.some(t => !t.name.trim())) {
    errors.push('All 4 teams must have a name.');
  }
  if (normalCount !== 3 || hardCount !== 3 || extremeCount !== 3) {
    errors.push(`Difficulty distribution must be exactly: 3 Normal, 3 Hard, 3 Extreme (Currently: ${normalCount} Normal - ${hardCount} Hard - ${extremeCount} Extreme).`);
  }

  const isValid = errors.length === 0;

  const handleStart = () => {
    if (!isValid) return;
    sound.playClick();
    onStartGame(characters, teams);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto select-none max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              GAME SETUP — WHo is this??
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
              PREPARE 9 CHARACTERS
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Upload 9 character images, enter names and hints before projecting onto the classroom screen.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadDemo}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Load Demo Preset (9 Characters)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 cursor-pointer transition"
          >
            <Upload className="w-4 h-4" />
            <span>Batch Upload Images</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleBatchUpload(e.target.files)}
          />
        </div>
      </div>

      {/* 4 Teams Setup Section */}
      <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <h3 className="text-sm font-black uppercase text-slate-300 tracking-wider mb-3 flex items-center gap-2">
          <span>4 COMPETING TEAMS</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {teams.map((team, idx) => (
            <div key={team.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/80 border border-slate-700">
              <span
                className="w-4 h-4 rounded-full shrink-0 shadow"
                style={{ backgroundColor: team.color }}
              />
              <input
                type="text"
                value={team.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setTeams(prev => prev.map((t, i) => i === idx ? { ...t, name: val } : t));
                }}
                placeholder={`Team ${idx + 1}`}
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Distribution Toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-4 text-xs font-black">
          <span className="text-slate-400">Required difficulty ratio:</span>
          <span className={`px-2 py-0.5 rounded-md border ${normalCount === 3 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
            NORMAL: {normalCount}/3
          </span>
          <span className={`px-2 py-0.5 rounded-md border ${hardCount === 3 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
            HARD: {hardCount}/3
          </span>
          <span className={`px-2 py-0.5 rounded-md border ${extremeCount === 3 ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
            EXTREME: {extremeCount}/3
          </span>
        </div>

        <button
          onClick={handleAutoDistribute}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5 text-amber-400" />
          <span>Auto-Distribute 3-3-3 Randomly</span>
        </button>
      </div>

      {/* 9 Characters Metadata Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-2xl mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-black uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3 w-12 text-center">Tile</th>
                <th className="p-3 w-20">Image</th>
                <th className="p-3 w-48">Character Name</th>
                <th className="p-3 w-36">Difficulty</th>
                <th className="p-3">5 Hints (Hard to Easy)</th>
                <th className="p-3 w-20 text-center">Face Shield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {characters.map((char, index) => {
                const isExtreme = char.difficulty === 'EXTREME';

                return (
                  <tr key={char.id} className="hover:bg-slate-800/30 transition">
                    {/* Index */}
                    <td className="p-3 text-center font-black text-slate-500">
                      #{index + 1}
                    </td>

                    {/* Image Thumbnail & Upload */}
                    <td className="p-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center group">
                        {char.imageSrc ? (
                          <img
                            src={char.imageSrc}
                            alt={char.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-600" />
                        )}

                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white cursor-pointer transition">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                const r = new FileReader();
                                r.onload = (ev) => {
                                  const url = ev.target?.result as string;
                                  setCharacters(prev => prev.map((c, i) => i === index ? { ...c, imageSrc: url } : c));
                                };
                                r.readAsDataURL(f);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </td>

                    {/* Character Name */}
                    <td className="p-3">
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCharacters(prev => prev.map((c, i) => i === index ? { ...c, name: val } : c));
                        }}
                        placeholder="Enter character name..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </td>

                    {/* Difficulty Selector */}
                    <td className="p-3">
                      <select
                        value={char.difficulty}
                        onChange={(e) => {
                          const val = e.target.value as Difficulty;
                          setCharacters(prev => prev.map((c, i) => i === index ? { ...c, difficulty: val } : c));
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-xs font-black border bg-slate-950 focus:outline-none cursor-pointer ${
                          char.difficulty === 'NORMAL'
                            ? 'text-cyan-400 border-cyan-500/40'
                            : char.difficulty === 'HARD'
                            ? 'text-amber-400 border-amber-500/40'
                            : 'text-purple-400 border-purple-500/40'
                        }`}
                      >
                        <option value="NORMAL">Normal (1.0x)</option>
                        <option value="HARD">Hard (1.5x)</option>
                        <option value="EXTREME">Extreme (2.0x)</option>
                      </select>
                    </td>

                    {/* 5 Hints Inputs */}
                    <td className="p-3">
                      <div className="space-y-1.5">
                        {char.hints.map((hint, hintIdx) => (
                          <div key={hintIdx} className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500 w-4">
                              H{hintIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={hint}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCharacters(prev =>
                                  prev.map((c, i) => {
                                    if (i !== index) return c;
                                    const nextHints = [...c.hints] as [string, string, string, string, string];
                                    nextHints[hintIdx] = val;
                                    return { ...c, hints: nextHints };
                                  })
                                );
                              }}
                              placeholder={`Hint ${hintIdx + 1}...`}
                              className="w-full px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-600"
                            />
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Face Tuner Button (Active for Extreme) */}
                    <td className="p-3 text-center">
                      {isExtreme ? (
                        <button
                          onClick={() => setTuningFaceIndex(index)}
                          title="Adjust face shield coordinates for Extreme mode"
                          className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 cursor-pointer transition"
                        >
                          <Crosshair className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Errors & Start Button */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          {errors.length > 0 ? (
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors[0]}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>All game data is 100% complete and valid! Ready to present.</span>
            </div>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={!isValid}
          className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-black transition-all cursor-pointer shadow-xl ${
            isValid
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 active:scale-95 glow-cyan'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START GAME</span>
        </button>
      </div>

      {/* Face Focal Reticle Tuner Modal */}
      {tuningFaceIndex !== null && characters[tuningFaceIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-purple-500/60 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <Crosshair className="w-5 h-5 text-purple-400" />
              <span>Adjust Face Center: {characters[tuningFaceIndex].name}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Click directly on the face to reposition the privacy shield area.
            </p>

            <div
              className="relative max-h-80 aspect-[3/4] mx-auto rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 cursor-crosshair flex items-center justify-center"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                setCharacters(prev =>
                  prev.map((c, i) =>
                    i === tuningFaceIndex
                      ? { ...c, faceFocus: { x, y, radius: c.faceFocus?.radius ?? 25 } }
                      : c
                  )
                );
              }}
            >
              <img
                src={characters[tuningFaceIndex].imageSrc}
                alt=""
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Reticle */}
              <div
                className="absolute rounded-full border-2 border-purple-400 bg-purple-500/30 pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${characters[tuningFaceIndex].faceFocus?.x ?? 50}%`,
                  top: `${characters[tuningFaceIndex].faceFocus?.y ?? 30}%`,
                  width: `${(characters[tuningFaceIndex].faceFocus?.radius ?? 25) * 2}%`,
                  height: `${(characters[tuningFaceIndex].faceFocus?.radius ?? 25) * 2}%`
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white shadow" />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setTuningFaceIndex(null)}
                className="px-5 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-500 text-white shadow-lg cursor-pointer transition"
              >
                Done & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
