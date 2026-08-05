import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { I18N } from '../../data/i18n';
import { playAudioFeedback } from '../../lib/audio';

interface PathGameProps {
  lang: Language;
  level: number;
  onFinish: (isWin: boolean) => void;
}

export const PathGame: React.FC<PathGameProps> = ({ lang, level, onFinish }) => {
  const t = I18N[lang];
  const [gridSize, setGridSize] = useState<number>(5);
  const [path, setPath] = useState<{ r: number; c: number }[]>([]);
  const [userPath, setUserPath] = useState<{ r: number; c: number }[]>([]);
  const [phase, setPhase] = useState<'watch' | 'play'>('watch');

  useEffect(() => {
    initPath();
  }, [level]);

  const initPath = () => {
    const dim = level < 6 ? 5 : level < 12 ? 6 : 7;
    setGridSize(dim);

    const length = 3 + Math.floor((level - 1) / 3);
    const generatedPath: { r: number; c: number }[] = [];

    const startR = Math.floor(Math.random() * dim);
    const startC = Math.floor(Math.random() * dim);
    generatedPath.push({ r: startR, c: startC });

    let current = { r: startR, c: startC };
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (generatedPath.length < length) {
      const validDirs = dirs.filter(d => {
        const nr = current.r + d[0];
        const nc = current.c + d[1];
        return (
          nr >= 0 && nr < dim && nc >= 0 && nc < dim &&
          !generatedPath.some(p => p.r === nr && p.c === nc)
        );
      });

      if (validDirs.length === 0) {
        // Reset and try again
        generatedPath.length = 0;
        generatedPath.push({ r: startR, c: startC });
        current = { r: startR, c: startC };
        continue;
      }

      const choosenDir = validDirs[Math.floor(Math.random() * validDirs.length)];
      current = { r: current.r + choosenDir[0], c: current.c + choosenDir[1] };
      generatedPath.push(current);
    }

    setPath(generatedPath);
    setUserPath([]);
    setPhase('watch');

    const waitTime = Math.max(2000, 5000 - level * 200);
    const timer = setTimeout(() => {
      setPhase('play');
    }, waitTime);

    return () => clearTimeout(timer);
  };

  const handleCellClick = (r: number, c: number) => {
    if (phase !== 'play') return;
    playAudioFeedback('click');

    const isCorrect =
      path.some(p => p.r === r && p.c === c) &&
      !userPath.some(p => p.r === r && p.c === c);

    if (isCorrect) {
      const nextUserPath = [...userPath, { r, c }];
      setUserPath(nextUserPath);

      if (nextUserPath.length === path.length) {
        playAudioFeedback('victory');
        setTimeout(() => onFinish(true), 600);
      } else {
        playAudioFeedback('success');
      }
    } else {
      playAudioFeedback('error');
      setUserPath([]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="text-center bg-white p-3 px-6 rounded-xl border border-slate-200 shadow-xs font-bold text-slate-700">
        {phase === 'watch' ? t.gameData.path.instWatch : t.gameData.path.instPlay}
      </div>

      <div
        className="grid gap-1.5 md:gap-2 w-full max-w-[320px] md:max-w-md mx-auto"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: gridSize }).map((_, r) =>
          Array.from({ length: gridSize }).map((__, c) => {
            const isPathCell = path.some(p => p.r === r && p.c === c);
            const isUserCell = userPath.some(p => p.r === r && p.c === c);
            const isStart = path.length > 0 && path[0].r === r && path[0].c === c;
            const isEnd = path.length > 0 && path[path.length - 1].r === r && path[path.length - 1].c === c;

            let cellClass = 'bg-white border-slate-200 hover:border-orange-300';
            let content = null;

            if (phase === 'watch' && isPathCell) {
              cellClass = 'bg-amber-500 border-amber-600 text-white font-black';
              if (isStart) content = '1';
              else if (isEnd) content = '⭐';
              else content = '•';
            } else if (phase === 'play') {
              if (isUserCell) {
                cellClass = 'bg-amber-500 border-amber-600 text-white font-black scale-102';
                content = '•';
              }
            }

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all text-xl font-black ${cellClass}`}
              >
                {content}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
