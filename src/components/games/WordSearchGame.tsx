import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { I18N } from '../../data/i18n';
import { playAudioFeedback } from '../../lib/audio';

interface WordSearchGameProps {
  lang: Language;
  level: number;
  onFinish: (isWin: boolean) => void;
}

interface WordItem {
  w: string;
  found: boolean;
  cells: number[];
}

export const WordSearchGame: React.FC<WordSearchGameProps> = ({ lang, level, onFinish }) => {
  const t = I18N[lang];
  const [grid, setGrid] = useState<string[]>([]);
  const [words, setWords] = useState<WordItem[]>([]);
  const [size, setSize] = useState<number>(6);
  const [selectingIndex, setSelectingIndex] = useState<number | null>(null);

  useEffect(() => {
    initGame();
  }, [level, lang]);

  const initGame = () => {
    const gridDim = level < 7 ? 6 : level < 14 ? 8 : 10;
    setSize(gridDim);

    const wordCount = level < 5 ? 3 : level < 10 ? 4 : level < 15 ? 5 : 6;
    const pool = [...t.data.wordsPool]
      .sort(() => Math.random() - 0.5)
      .filter(w => w.length <= gridDim)
      .map(w => w.toUpperCase());

    const chosenWords = pool.slice(0, wordCount).map(w => ({
      w,
      found: false,
      cells: [] as number[]
    }));

    const newGrid = Array(gridDim * gridDim).fill('');

    chosenWords.forEach(wordObj => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const isHoriz = Math.random() > 0.5;
        const r = Math.floor(Math.random() * (gridDim - (isHoriz ? 0 : wordObj.w.length)));
        const c = Math.floor(Math.random() * (gridDim - (isHoriz ? wordObj.w.length : 0)));

        let valid = true;
        for (let i = 0; i < wordObj.w.length; i++) {
          const idx = isHoriz ? r * gridDim + c + i : (r + i) * gridDim + c;
          if (newGrid[idx] !== '' && newGrid[idx] !== wordObj.w[i]) {
            valid = false;
          }
        }

        if (valid) {
          for (let i = 0; i < wordObj.w.length; i++) {
            const idx = isHoriz ? r * gridDim + c + i : (r + i) * gridDim + c;
            newGrid[idx] = wordObj.w[i];
            wordObj.cells.push(idx);
          }
          placed = true;
        }
        attempts++;
      }
    });

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < newGrid.length; i++) {
      if (newGrid[i] === '') {
        newGrid[i] = alphabet[Math.floor(Math.random() * 26)];
      }
    }

    setGrid(newGrid);
    setWords(chosenWords);
    setSelectingIndex(null);
  };

  const handleCellClick = (index: number) => {
    const isAlreadyFoundCell = words.some(w => w.found && w.cells.includes(index));
    if (isAlreadyFoundCell) return;

    playAudioFeedback('click');

    if (selectingIndex === null) {
      setSelectingIndex(index);
    } else {
      checkSelection(selectingIndex, index);
      setSelectingIndex(null);
    }
  };

  const checkSelection = (start: number, end: number) => {
    const matchedIndex = words.findIndex(
      w =>
        !w.found &&
        ((w.cells[0] === start && w.cells[w.cells.length - 1] === end) ||
          (w.cells[0] === end && w.cells[w.cells.length - 1] === start))
    );

    if (matchedIndex !== -1) {
      playAudioFeedback('success');
      const updatedWords = [...words];
      updatedWords[matchedIndex].found = true;
      setWords(updatedWords);

      if (updatedWords.every(w => w.found)) {
        setTimeout(() => onFinish(true), 700);
      }
    } else {
      playAudioFeedback('error');
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center items-center gap-2 w-full bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <span className="font-bold text-slate-500 mr-2 text-sm">{t.wsFound}</span>
        {words.map((w, idx) => (
          <span
            key={idx}
            className={`px-2.5 py-1 rounded-md text-sm md:text-base font-black transition-all ${
              w.found ? 'line-through bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
            }`}
          >
            {w.w}
          </span>
        ))}
      </div>

      <div
        className="grid bg-slate-200 p-2 rounded-xl border border-slate-300 w-full max-w-[340px] md:max-w-md aspect-square gap-1 shadow-sm"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {grid.map((char, idx) => {
          const isFoundCell = words.some(w => w.found && w.cells.includes(idx));
          const isSelected = selectingIndex === idx;

          let cellClass = 'bg-white text-slate-700 hover:bg-indigo-50';
          if (isFoundCell) cellClass = 'bg-emerald-500 text-white font-black opacity-90';
          else if (isSelected) cellClass = 'bg-indigo-600 text-white font-black scale-105 z-10';

          return (
            <div
              key={idx}
              onClick={() => handleCellClick(idx)}
              className={`ws-cell text-lg md:text-2xl font-black rounded-lg flex items-center justify-center cursor-pointer select-none transition-all ${cellClass}`}
            >
              {char}
            </div>
          );
        })}
      </div>
    </div>
  );
};
