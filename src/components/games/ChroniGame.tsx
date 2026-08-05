import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { I18N, ChroniEvent } from '../../data/i18n';
import { playAudioFeedback } from '../../lib/audio';

interface ChroniGameProps {
  lang: Language;
  level: number;
  onFinish: (isWin: boolean) => void;
}

const recentTargetEvents: string[] = [];

export const ChroniGame: React.FC<ChroniGameProps> = ({ lang, level, onFinish }) => {
  const t = I18N[lang];
  const [refEvent, setRefEvent] = useState<ChroniEvent | null>(null);
  const [targetEvent, setTargetEvent] = useState<ChroniEvent | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null); // true = After, false = Before
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    initRound();
  }, [level, lang]);

  const initRound = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);

    const events = [...t.data.chroni].sort((a, b) => a.y - b.y);

    let idx1: number, idx2: number;
    if (level < 10) {
      // Find events that haven't been asked recently
      let availableTargets = events.filter(e => !recentTargetEvents.includes(e.e));
      if (availableTargets.length < 2) {
        recentTargetEvents.length = 0; // reset
        availableTargets = events;
      }
      
      const targetEv = availableTargets[Math.floor(Math.random() * availableTargets.length)];
      idx2 = events.findIndex(e => e.e === targetEv.e);
      
      do {
        idx1 = Math.floor(Math.random() * events.length);
      } while (idx1 === idx2);
    } else {
      idx1 = Math.floor(Math.random() * (events.length - 3));
      idx2 = idx1 + Math.floor(Math.random() * 2) + 1;
      
      // Keep it simple for high level proximity check, but still avoid recent if possible
      if (recentTargetEvents.includes(events[idx2].e)) {
         if (idx2 + 2 < events.length) idx2 += 1;
      }
    }

    let e1 = events[idx1];
    let e2 = events[idx2];

    if (Math.random() > 0.5) {
      const temp = e1;
      e1 = e2;
      e2 = temp;
    }

    recentTargetEvents.push(e2.e);
    if (recentTargetEvents.length > 10) recentTargetEvents.shift();

    setRefEvent(e1);
    setTargetEvent(e2);
  };

  const handleAnswer = (isAfterChoice: boolean) => {
    if (selectedAnswer !== null || !refEvent || !targetEvent) return;
    setSelectedAnswer(isAfterChoice);

    const actualIsAfter = targetEvent.y > refEvent.y;
    const correct = isAfterChoice === actualIsAfter;
    setIsCorrect(correct);

    if (correct) {
      playAudioFeedback('success');
      setTimeout(() => onFinish(true), 700);
    } else {
      playAudioFeedback('error');
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 1000);
    }
  };

  if (!refEvent || !targetEvent) return null;

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8 w-full text-center flex flex-col items-center gap-3">
        <span className="text-indigo-600 text-2xl md:text-3xl font-black">
          {targetEvent.e}
        </span>
        <span className="text-slate-500 text-base md:text-lg font-semibold">
          {t.strRelation}
        </span>
        <span className="text-rose-600 text-2xl md:text-3xl font-black">
          {refEvent.e} ({refEvent.y})
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <button
          onClick={() => handleAnswer(false)}
          disabled={selectedAnswer !== null}
          className={`tactile-btn w-full p-6 text-2xl font-black transition-all ${
            selectedAnswer === false
              ? isCorrect
                ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-black'
                : 'bg-rose-100 text-rose-800 border-rose-400 shake-subtle'
              : 'bg-white text-slate-800 hover:bg-slate-50'
          }`}
        >
          {t.chroniBefore}
        </button>

        <button
          onClick={() => handleAnswer(true)}
          disabled={selectedAnswer !== null}
          className={`tactile-btn w-full p-6 text-2xl font-black transition-all ${
            selectedAnswer === true
              ? isCorrect
                ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-black'
                : 'bg-rose-100 text-rose-800 border-rose-400 shake-subtle'
              : 'bg-white text-slate-800 hover:bg-slate-50'
          }`}
        >
          {t.chroniAfter}
        </button>
      </div>
    </div>
  );
};
