import React, { useState, useEffect } from 'react';
import { Language, MarbleTheme } from '../../types';
import { I18N } from '../../data/i18n';
import { playAudioFeedback } from '../../lib/audio';

interface PegSolitaireGameProps {
  lang: Language;
  level: number;
  onFinish: (isWin: boolean) => void;
}

export const PegSolitaireGame: React.FC<PegSolitaireGameProps> = ({
  lang,
  level,
  onFinish
}) => {
  const t = I18N[lang];
  const [board, setBoard] = useState<number[][]>([]);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [initialPegCount, setInitialPegCount] = useState<number>(0);
  const [marbleTheme, setMarbleTheme] = useState<MarbleTheme>('amber');

  useEffect(() => {
    initBoard();
  }, [level]);

  const initBoard = () => {
    const pattern = [
      [-1, -1, 0, 0, 0, -1, -1],
      [-1, -1, 0, 0, 0, -1, -1],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [-1, -1, 0, 0, 0, -1, -1],
      [-1, -1, 0, 0, 0, -1, -1]
    ];

    const currentBoard = pattern.map(r => [...r]);

    // Generate puzzle working backwards according to level
    const targetJumps = 1 + level;
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    const midDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let i = 0; i < targetJumps; i++) {
      const possibleReverseMoves: any[] = [];
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (currentBoard[r][c] === 1) {
            for (let d = 0; d < dirs.length; d++) {
              const endR = r + dirs[d][0];
              const endC = c + dirs[d][1];
              const midR = r + midDirs[d][0];
              const midC = c + midDirs[d][1];
              if (
                endR >= 0 && endR < 7 && endC >= 0 && endC < 7 &&
                currentBoard[endR][endC] === 0 && currentBoard[midR][midC] === 0
              ) {
                possibleReverseMoves.push({ r, c, endR, endC, midR, midC });
              }
            }
          }
        }
      }

      if (possibleReverseMoves.length > 0) {
        const move = possibleReverseMoves[Math.floor(Math.random() * possibleReverseMoves.length)];
        currentBoard[move.r][move.c] = 0;
        currentBoard[move.midR][move.midC] = 1;
        currentBoard[move.endR][move.endC] = 1;
      } else {
        break;
      }
    }

    setBoard(currentBoard);
    setSelected(null);
    const count = currentBoard.flat().filter(v => v === 1).length;
    setInitialPegCount(count);
  };

  const getValidMoves = (r: number, c: number) => {
    const moves: { endR: number; endC: number; midR: number; midC: number }[] = [];
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    const midDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let i = 0; i < dirs.length; i++) {
      const endR = r + dirs[i][0];
      const endC = c + dirs[i][1];
      const midR = r + midDirs[i][0];
      const midC = c + midDirs[i][1];

      if (
        endR >= 0 && endR < 7 && endC >= 0 && endC < 7 &&
        midR >= 0 && midR < 7 && midC >= 0 && midC < 7
      ) {
        if (board[midR][midC] === 1 && board[endR][endC] === 0) {
          moves.push({ endR, endC, midR, midC });
        }
      }
    }
    return moves;
  };

  const makeMove = (endR: number, endC: number) => {
    if (!selected) return;
    const validMoves = getValidMoves(selected.r, selected.c);
    const move = validMoves.find(m => m.endR === endR && m.endC === endC);

    if (move) {
      playAudioFeedback('success');
      const newBoard = board.map(row => [...row]);
      newBoard[selected.r][selected.c] = 0;
      newBoard[move.midR][move.midC] = 0;
      newBoard[endR][endC] = 1;

      setBoard(newBoard);
      setSelected(null);

      const remainingPegs = newBoard.flat().filter(v => v === 1).length;

      if (remainingPegs === 1) {
        playAudioFeedback('victory');
        setTimeout(() => onFinish(true), 700);
      } else {
        // Check if any valid moves remain
        let hasMoves = false;
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 7; c++) {
            if (newBoard[r][c] === 1) {
              // check if it has valid moves
              const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
              const midDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
              for (let i = 0; i < dirs.length; i++) {
                const eR = r + dirs[i][0];
                const eC = c + dirs[i][1];
                const mR = r + midDirs[i][0];
                const mC = c + midDirs[i][1];
                if (
                  eR >= 0 && eR < 7 && eC >= 0 && eC < 7 &&
                  newBoard[mR][mC] === 1 && newBoard[eR][eC] === 0
                ) {
                  hasMoves = true;
                  break;
                }
              }
            }
            if (hasMoves) break;
          }
          if (hasMoves) break;
        }

        if (!hasMoves) {
          playAudioFeedback('error');
        }
      }
    }
  };

  const validMoves = selected ? getValidMoves(selected.r, selected.c) : [];
  const remainingPegs = board.flat().filter(v => v === 1).length;
  const eliminatedPegs = initialPegCount - remainingPegs;

  const marbleStyleClass = {
    amber: 'marble-amber',
    ruby: 'marble-ruby',
    emerald: 'marble-emerald',
    sapphire: 'marble-sapphire'
  }[marbleTheme];

  return (
    <div className="w-full flex flex-col items-center max-w-lg">
      {/* Theme selection header for friendly marble colors */}
      <div className="flex flex-wrap items-center justify-between w-full bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-4 gap-2">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          {lang === 'fr' ? 'Couleur des billes :' : 'Cor das bolas :'}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playAudioFeedback('click');
              setMarbleTheme('amber');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              marbleTheme === 'amber'
                ? 'bg-amber-500 text-white shadow-sm scale-105'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            🌟 {lang === 'fr' ? 'Ambre' : 'Âmbar'}
          </button>

          <button
            onClick={() => {
              playAudioFeedback('click');
              setMarbleTheme('ruby');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              marbleTheme === 'ruby'
                ? 'bg-rose-500 text-white shadow-sm scale-105'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            🌹 {lang === 'fr' ? 'Rubis' : 'Rubi'}
          </button>

          <button
            onClick={() => {
              playAudioFeedback('click');
              setMarbleTheme('emerald');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              marbleTheme === 'emerald'
                ? 'bg-emerald-600 text-white shadow-sm scale-105'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            💚 {lang === 'fr' ? 'Émeraude' : 'Esmeralda'}
          </button>

          <button
            onClick={() => {
              playAudioFeedback('click');
              setMarbleTheme('sapphire');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              marbleTheme === 'sapphire'
                ? 'bg-blue-600 text-white shadow-sm scale-105'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            💙 {lang === 'fr' ? 'Saphir' : 'Safira'}
          </button>
        </div>
      </div>

      {/* Tactile Wooden/Cream Board */}
      <div className="grid grid-cols-7 grid-rows-7 gap-1.5 md:gap-2.5 p-4 md:p-6 bg-gradient-to-b from-amber-100 to-amber-50 rounded-3xl border-4 border-amber-800/30 shadow-xl w-full max-w-[340px] md:max-w-[420px] aspect-square">
        {board.map((row, r) =>
          row.map((cell, c) => {
            if (cell === -1) {
              return <div key={`${r}-${c}`} className="w-full h-full"></div>;
            }

            const isPeg = cell === 1;
            const isSelected = selected?.r === r && selected?.c === c;
            const isValidTarget = validMoves.some(m => m.endR === r && m.endC === c);

            return (
              <div
                key={`${r}-${c}`}
                className="relative w-full h-full flex items-center justify-center p-0.5"
              >
                {isPeg ? (
                  <button
                    onClick={() => {
                      playAudioFeedback('click');
                      setSelected({ r, c });
                    }}
                    className={`absolute w-[85%] h-[85%] rounded-full cursor-pointer transition-all ${marbleStyleClass} ${
                      isSelected
                        ? 'ring-4 ring-amber-400 scale-110 shadow-2xl z-10'
                        : 'hover:scale-105'
                    }`}
                  ></button>
                ) : (
                  <button
                    onClick={() => {
                      if (isValidTarget) makeMove(r, c);
                    }}
                    disabled={!isValidTarget}
                    className={`absolute w-[80%] h-[80%] rounded-full flex items-center justify-center transition-all ${
                      isValidTarget
                        ? 'border-3 border-dashed border-emerald-500 bg-emerald-100/60 cursor-pointer animate-pulse scale-105'
                        : 'border-2 border-slate-300/80 bg-amber-900/10'
                    }`}
                  >
                    {isValidTarget && (
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Game Status Info */}
      <div className="mt-4 flex items-center justify-between w-full bg-white p-3 px-5 rounded-xl border border-slate-200 text-sm md:text-base font-bold text-slate-700 shadow-xs">
        <span>
          {remainingPegs} {lang === 'fr' ? 'billes restantes' : 'bolas restantes'}
        </span>
        <span className="text-amber-600">
          {eliminatedPegs} {lang === 'fr' ? 'supprimées' : 'eliminadas'}
        </span>
      </div>
    </div>
  );
};
