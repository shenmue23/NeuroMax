import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { I18N } from '../../data/i18n';
import { playAudioFeedback } from '../../lib/audio';

interface SequenceGameProps {
  lang: Language;
  level: number;
  onFinish: (isWin: boolean) => void;
}

export const SequenceGame: React.FC<SequenceGameProps> = ({ lang, level, onFinish }) => {
  const t = I18N[lang];
  const [seq, setSeq] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [litPad, setLitPad] = useState<number | null>(null);
  const [isTurn, setIsTurn] = useState<boolean>(false);
  const [instruction, setInstruction] = useState<string>(t.gameData.sequence.instWatch);

  useEffect(() => {
    initSequence();
  }, [level]);

  const initSequence = () => {
    const startLen = 2 + Math.floor((level - 1) / 3);
    const newSeq: number[] = [];
    for (let i = 0; i < startLen; i++) {
      newSeq.push(Math.floor(Math.random() * 4));
    }
    setSeq(newSeq);
    setPlayerSeq([]);
    setIsTurn(false);
    playSequence(newSeq);
  };

  const playSequence = async (sequenceToPlay: number[]) => {
    setInstruction(t.gameData.sequence.instWatch);
    setIsTurn(false);
    const speed = Math.max(200, 800 - level * 25);

    for (let i = 0; i < sequenceToPlay.length; i++) {
      await new Promise(r => setTimeout(r, speed / 2));
      setLitPad(sequenceToPlay[i]);
      playAudioFeedback('click');
      await new Promise(r => setTimeout(r, speed));
      setLitPad(null);
    }

    setIsTurn(true);
    setInstruction(t.gameData.sequence.instPlay);
  };

  const handlePadClick = (id: number) => {
    if (!isTurn) return;

    setLitPad(id);
    playAudioFeedback('click');
    setTimeout(() => setLitPad(null), 200);

    const nextPlayerSeq = [...playerSeq, id];
    setPlayerSeq(nextPlayerSeq);

    const currentIndex = nextPlayerSeq.length - 1;
    if (nextPlayerSeq[currentIndex] !== seq[currentIndex]) {
      playAudioFeedback('error');
      setIsTurn(false);
      setTimeout(() => {
        initSequence();
      }, 1200);
      return;
    }

    if (nextPlayerSeq.length === seq.length) {
      playAudioFeedback('success');
      setIsTurn(false);
      setTimeout(() => onFinish(true), 700);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="text-center bg-white p-3 px-6 rounded-xl border border-slate-200 shadow-xs font-bold text-slate-700">
        {instruction}
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 w-full max-w-[280px] md:max-w-[320px] aspect-square p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div
          onClick={() => handlePadClick(0)}
          className={`simon-pad bg-rose-500 rounded-xl ${litPad === 0 ? 'lit' : ''}`}
        ></div>
        <div
          onClick={() => handlePadClick(1)}
          className={`simon-pad bg-sky-500 rounded-xl ${litPad === 1 ? 'lit' : ''}`}
        ></div>
        <div
          onClick={() => handlePadClick(2)}
          className={`simon-pad bg-amber-400 rounded-xl ${litPad === 2 ? 'lit' : ''}`}
        ></div>
        <div
          onClick={() => handlePadClick(3)}
          className={`simon-pad bg-emerald-500 rounded-xl ${litPad === 3 ? 'lit' : ''}`}
        ></div>
      </div>
    </div>
  );
};
