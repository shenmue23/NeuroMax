import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { I18N } from '../../data/i18n';
import { playAudioFeedback } from '../../lib/audio';

interface GridGamesProps {
  lang: Language;
  type: 'oddone' | 'target' | 'orderNum' | 'orderAlpha';
  level: number;
  onFinish: (isWin: boolean) => void;
}

export const GridGames: React.FC<GridGamesProps> = ({ lang, type, level, onFinish }) => {
  const t = I18N[lang];
  const [items, setItems] = useState<any[]>([]);
  const [oddIndex, setOddIndex] = useState<number>(-1);
  const [targetChar, setTargetChar] = useState<string>('');
  const [targetCount, setTargetCount] = useState<number>(0);
  const [foundCount, setFoundCount] = useState<number>(0);
  const [sortedSequence, setSortedSequence] = useState<any[]>([]);
  const [currentOrderIdx, setCurrentOrderIdx] = useState<number>(0);
  const [disabledIndices, setDisabledIndices] = useState<number[]>([]);

  // Calculate adaptive columns count based on level
  const cols = level <= 3 ? 3 : level <= 7 ? 3 : level <= 12 ? 4 : 5;

  useEffect(() => {
    initGrid();
  }, [type, level]);

  const initGrid = () => {
    const size = cols * cols;
    setDisabledIndices([]);

    if (type === 'oddone') {
      const pairs = [
        ['O', 'Q'], ['b', 'd'], ['p', 'q'], ['8', 'B'], ['I', 'l'], ['6', '9'],
        ['M', 'W'], ['E', 'F'], ['C', 'G'], ['U', 'V'], ['c', 'e'], ['n', 'm'],
        ['S', '5'], ['Z', '2']
      ];
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const gridItems = Array(size).fill(pair[0]);
      const specialIdx = Math.floor(Math.random() * size);
      gridItems[specialIdx] = pair[1];

      setItems(gridItems);
      setOddIndex(specialIdx);
    } else if (type === 'target') {
      const pools = [
        { t: 'P', d: ['B', 'R', 'D'] },
        { t: 'C', d: ['G', 'O', 'Q'] },
        { t: '5', d: ['S', '2', '8'] },
        { t: 'X', d: ['Y', 'K', 'H'] }
      ];
      const p = pools[Math.floor(Math.random() * pools.length)];
      setTargetChar(p.t);

      const gridItems: string[] = [];
      let count = 0;
      for (let i = 0; i < size; i++) {
        if (Math.random() > 0.78) {
          gridItems.push(p.t);
          count++;
        } else {
          gridItems.push(p.d[Math.floor(Math.random() * p.d.length)]);
        }
      }
      if (count === 0) {
        gridItems[Math.floor(Math.random() * size)] = p.t;
        count = 1;
      }

      setItems(gridItems);
      setTargetCount(count);
      setFoundCount(0);
    } else if (type === 'orderNum') {
      // Lower starting number range for beginner levels
      const maxNum = level <= 2 ? 20 : level <= 4 ? 40 : level <= 7 ? 60 : 99;
      const gridItems: number[] = [];

      while (gridItems.length < size) {
        const r = Math.floor(Math.random() * maxNum) + 1;
        if (!gridItems.includes(r)) gridItems.push(r);
      }
      const sorted = [...gridItems].sort((a, b) => a - b);
      setItems(gridItems);
      setSortedSequence(sorted);
      setCurrentOrderIdx(0);
    } else if (type === 'orderAlpha') {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const count = Math.min(size, 26);
      const gridItems = [...alphabet].sort(() => Math.random() - 0.5).slice(0, count);
      const sorted = [...gridItems].sort((a, b) => a.localeCompare(b));

      setItems(gridItems);
      setSortedSequence(sorted);
      setCurrentOrderIdx(0);
    }
  };

  const handleClick = (val: any, idx: number) => {
    if (disabledIndices.includes(idx)) return;

    if (type === 'oddone') {
      if (idx === oddIndex) {
        playAudioFeedback('success');
        setDisabledIndices([...disabledIndices, idx]);
        setTimeout(() => onFinish(true), 600);
      } else {
        playAudioFeedback('error');
      }
    } else if (type === 'target') {
      if (val === targetChar) {
        playAudioFeedback('success');
        setDisabledIndices([...disabledIndices, idx]);
        const newFound = foundCount + 1;
        setFoundCount(newFound);
        if (newFound === targetCount) {
          setTimeout(() => onFinish(true), 600);
        }
      } else {
        playAudioFeedback('error');
      }
    } else if (type === 'orderNum' || type === 'orderAlpha') {
      if (val === sortedSequence[currentOrderIdx]) {
        playAudioFeedback('success');
        setDisabledIndices([...disabledIndices, idx]);
        const nextIdx = currentOrderIdx + 1;
        setCurrentOrderIdx(nextIdx);
        if (nextIdx === sortedSequence.length) {
          setTimeout(() => onFinish(true), 600);
        }
      } else {
        playAudioFeedback('error');
      }
    }
  };

  const textSize = cols >= 5 ? 'text-base sm:text-lg' : cols >= 4 ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl';

  return (
    <div className="w-full flex flex-col items-center gap-4 px-2">
      {type === 'target' && (
        <div className="bg-white p-3 px-6 rounded-xl border border-slate-200 shadow-xs font-black text-slate-800 text-lg text-center">
          {t.gameData.target.inst} [ <span className="text-rose-600 text-2xl">{targetChar}</span> ]
        </div>
      )}

      <div
        className="grid gap-2 w-full max-w-[320px] sm:max-w-md mx-auto p-2 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {items.map((val, idx) => {
          const isDisabled = disabledIndices.includes(idx);

          return (
            <button
              key={idx}
              onClick={() => handleClick(val, idx)}
              disabled={isDisabled}
              className={`tactile-btn aspect-square ${textSize} font-black flex items-center justify-center transition-all rounded-xl shadow-xs p-1 select-none ${
                isDisabled
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                  : 'bg-white hover:bg-indigo-50 text-slate-800'
              }`}
            >
              {val}
            </button>
          );
        })}
      </div>
    </div>
  );
};

