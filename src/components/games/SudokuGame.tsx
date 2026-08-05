import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { playAudioFeedback } from '../../lib/audio';

interface SudokuGameProps {
  lang: Language;
  level: number;
  onFinish: (isWin: boolean) => void;
}

export const SudokuGame: React.FC<SudokuGameProps> = ({ level, onFinish }) => {
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [userBoard, setUserBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);

  useEffect(() => {
    generateGrid();
  }, [level]);

  const generateGrid = () => {
    const base = [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ];

    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        base[r][c] = nums[base[r][c] - 1];
      }
    }

    const sol = base.map(row => [...row]);
    const cellsToRemove = Math.min(55, 12 + level * 2);

    const puzzle = base.map(row => [...row]);
    const positions = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);

    for (let i = 0; i < cellsToRemove; i++) {
      const pos = positions[i];
      puzzle[Math.floor(pos / 9)][pos % 9] = 0;
    }

    setSolution(sol);
    setUserBoard(puzzle);
    setInitialBoard(puzzle.map(row => [...row]));
    setSelectedCell(null);
  };

  const handleInputNumber = (num: number) => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    playAudioFeedback('click');
    const newBoard = userBoard.map(row => [...row]);
    newBoard[r][c] = num;
    setUserBoard(newBoard);

    // Check if full and solved
    const isFull = !newBoard.some(row => row.some(val => val === 0));
    if (isFull) {
      let isCorrect = true;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (newBoard[i][j] !== solution[i][j]) {
            isCorrect = false;
          }
        }
      }

      if (isCorrect) {
        playAudioFeedback('victory');
        setTimeout(() => onFinish(true), 600);
      } else {
        playAudioFeedback('error');
      }
    }
  };

  const handleClearCell = () => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    if (initialBoard[r][c] !== 0) return;

    playAudioFeedback('click');
    const newBoard = userBoard.map(row => [...row]);
    newBoard[r][c] = 0;
    setUserBoard(newBoard);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="grid grid-cols-9 bg-white border-3 border-slate-800 w-full max-w-[340px] md:max-w-md aspect-square shadow-sm">
        {userBoard.map((row, r) =>
          row.map((val, c) => {
            const isInitial = initialBoard[r][c] !== 0;
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;

            let cellClasses = 'sudoku-cell aspect-square text-lg md:text-2xl font-bold ';
            if (c % 3 === 2 && c !== 8) cellClasses += 'sudoku-border-r ';
            if (r % 3 === 2 && r !== 8) cellClasses += 'sudoku-border-b ';
            if (isSelected) cellClasses += 'selected ';
            if (isInitial) cellClasses += 'initial ';
            else if (val !== 0) cellClasses += 'player ';

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => {
                  playAudioFeedback('click');
                  setSelectedCell({ r, c });
                }}
                className={cellClasses}
              >
                {val || ''}
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 w-full max-w-[340px] md:max-w-md mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleInputNumber(num)}
            className="tactile-btn aspect-square bg-white text-xl md:text-2xl font-black text-indigo-700 hover:bg-indigo-50"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClearCell}
          className="tactile-btn col-span-5 sm:col-span-9 w-full py-2.5 bg-slate-100 text-slate-700 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200"
        >
          <i className="fa-solid fa-eraser"></i> Effacer
        </button>
      </div>
    </div>
  );
};
