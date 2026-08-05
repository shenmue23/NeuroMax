import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../../types';
import { I18N } from '../../data/i18n';
import { playAudioFeedback } from '../../lib/audio';

interface QuizGamesProps {
  lang: Language;
  type: string;
  params?: any;
  level: number;
  onFinish: (isWin: boolean) => void;
}

const recentDictKeys: Record<string, string[]> = {};
let recentWords: string[] = [];
let recentSymbols: string[] = [];

export const QuizGames: React.FC<QuizGamesProps> = ({ lang, type, params, level, onFinish }) => {
  const t = I18N[lang];
  const [questionText, setQuestionText] = useState<React.ReactNode>('');
  const [questionStyle, setQuestionStyle] = useState<React.CSSProperties>({});
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // For Recall/Missing memory games
  const [memoryPhase, setMemoryPhase] = useState<'study' | 'quiz'>('quiz');
  const [memoryTimer, setMemoryTimer] = useState<number>(100);
  const memoryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initRound();
    return () => {
      if (memoryIntervalRef.current) {
        clearInterval(memoryIntervalRef.current);
      }
    };
  }, [type, params, level, lang]);

  const initRound = () => {
    if (memoryIntervalRef.current) {
      clearInterval(memoryIntervalRef.current);
      memoryIntervalRef.current = null;
    }
    setSelectedChoice(null);
    setIsCorrect(null);
    setQuestionStyle({});
    setMemoryPhase('quiz');

    const choicesCount = Math.min(6, Math.max(2, Math.floor((level - 1) / 4) + 2));

    if (type === 'dict') {
      const key = params?.key || type;
      const dictData = (t.data as any)[key] || [];

      if (!recentDictKeys[key]) recentDictKeys[key] = [];
      let available = dictData.filter((item: any) => !recentDictKeys[key].includes(item.q));

      if (available.length === 0 && dictData.length > 0) {
        recentDictKeys[key] = [];
        available = dictData;
      }

      const item = available[Math.floor(Math.random() * available.length)];
      if (item) {
        recentDictKeys[key].push(item.q);
        setQuestionText(item.q);
        setCorrectAnswer(item.a);
        const wrong = [...item.w].sort(() => Math.random() - 0.5).slice(0, choicesCount - 1);
        setChoices([item.a, ...wrong].sort(() => Math.random() - 0.5));
      }
    } else if (type === 'math') {
      let a: number, b: number, ans: number;
      let qStr = '';

      if (level <= 5) {
        a = Math.floor(Math.random() * (5 + level)) + 1;
        b = Math.floor(Math.random() * (5 + level)) + 1;
        ans = a + b;
        qStr = `${a} + ${b} = ?`;
      } else if (level <= 10) {
        a = Math.floor(Math.random() * (10 + level * 2)) + 10;
        b = Math.floor(Math.random() * (a - 1)) + 1;
        ans = a - b;
        qStr = `${a} - ${b} = ?`;
      } else if (level <= 15) {
        a = Math.floor(Math.random() * (3 + Math.floor(level / 2))) + 2;
        b = Math.floor(Math.random() * 8) + 2;
        ans = a * b;
        qStr = `${a} × ${b} = ?`;
      } else {
        a = Math.floor(Math.random() * 40) + 10;
        b = Math.floor(Math.random() * 20) + 10;
        const c = Math.floor(Math.random() * 15) + 1;
        ans = a + b - c;
        qStr = `${a} + ${b} - ${c} = ?`;
      }

      setQuestionText(qStr);
      setCorrectAnswer(ans.toString());

      const answerChoices = [ans.toString()];
      while (answerChoices.length < choicesCount) {
        const wrong = ans + (Math.floor(Math.random() * 20) - 10);
        if (wrong > 0 && !answerChoices.includes(wrong.toString())) {
          answerChoices.push(wrong.toString());
        }
      }
      setChoices(answerChoices.sort(() => Math.random() - 0.5));
    } else if (type === 'series') {
      const step = Math.floor(Math.random() * (2 + Math.floor(level / 2))) + 2;
      const start = Math.floor(Math.random() * (5 + level)) + 2;
      const target = start + step * 3;

      setQuestionText(`${start}, ${start + step}, ${start + step * 2}, ?`);
      setCorrectAnswer(target.toString());

      const answerChoices = [
        target.toString(),
        (target + 1).toString(),
        (target + step).toString(),
        (target - step).toString()
      ].slice(0, choicesCount);

      setChoices(answerChoices.sort(() => Math.random() - 0.5));
    } else if (type === 'greater') {
      const max = 10 + level * 3;
      const a1 = Math.floor(Math.random() * max) + 5;
      const a2 = Math.floor(Math.random() * max) + 5;
      let b1 = Math.floor(Math.random() * max) + 5;
      const b2 = Math.floor(Math.random() * max) + 5;

      if (a1 + a2 === b1 + b2) b1 += 1;

      const txtA = `${a1} + ${a2}`;
      const txtB = `${b1} + ${b2}`;

      setQuestionText(
        <div className="flex flex-col items-center gap-1">
          <span className="text-indigo-600 text-3xl font-black">{txtA}</span>
          <span className="text-slate-400 text-sm uppercase">VS</span>
          <span className="text-rose-600 text-3xl font-black">{txtB}</span>
        </div>
      );

      const winner = a1 + a2 > b1 + b2 ? txtA : txtB;
      setCorrectAnswer(winner);
      setChoices([txtA, txtB].sort(() => Math.random() - 0.5));
    } else if (type === 'stroop') {
      const colorNames = t.data.colors;
      const hexList = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#0F172A'];

      const textIdx = Math.floor(Math.random() * colorNames.length);
      let colorIdx = Math.floor(Math.random() * hexList.length);
      while (colorIdx === textIdx) {
        colorIdx = Math.floor(Math.random() * hexList.length);
      }

      setQuestionText(colorNames[textIdx]);
      setQuestionStyle({ color: hexList[colorIdx] });
      setCorrectAnswer(colorNames[colorIdx]);

      const shuffledColors = [...colorNames].sort(() => Math.random() - 0.5).slice(0, choicesCount);
      if (!shuffledColors.includes(colorNames[colorIdx])) {
        shuffledColors[0] = colorNames[colorIdx];
      }
      setChoices(shuffledColors.sort(() => Math.random() - 0.5));
    } else if (type === 'recall' || type === 'missing') {
      setupMemoryRound();
    }
  };

  const setupMemoryRound = () => {
    setMemoryPhase('study');
    const symbols = ['🚗', '🍎', '🌻', '🐶', '⚽', '🎸', '📱', '📚', '☕', '🚲', '🐢', '🍉', '🍕', '🔑', '🎨', '🚀', '⭐', '🎈'];
    const count = Math.min(6, Math.max(3, 3 + Math.floor((level - 1) / 4)));

    if (type === 'recall') {
      let pool = t.data.wordsPool.filter(w => !recentWords.includes(w));
      if (pool.length < count) {
        recentWords = [];
        pool = t.data.wordsPool;
      }
      
      const chosenWords = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
      recentWords.push(...chosenWords);
      if (recentWords.length > 20) recentWords = recentWords.slice(recentWords.length - 20);

      setQuestionText(
        <div className="flex flex-wrap justify-center gap-2 text-xl md:text-3xl text-indigo-700 font-bold">
          {chosenWords.map((w, i) => (
            <span key={i} className="bg-indigo-50 px-3 py-1 rounded-lg">
              {w}
            </span>
          ))}
        </div>
      );

      const durationMs = Math.max(3000, 8000 - level * 250);
      let step = 100;
      memoryIntervalRef.current = setInterval(() => {
        step -= 2;
        setMemoryTimer(step);
        if (step <= 0) {
          if (memoryIntervalRef.current) clearInterval(memoryIntervalRef.current);
          setMemoryPhase('quiz');

          const isPresent = Math.random() > 0.5;
          const targetWord = isPresent
            ? chosenWords[Math.floor(Math.random() * chosenWords.length)]
            : t.data.wordsPool.find(w => !chosenWords.includes(w)) || 'Soleil';

          setQuestionText(<span className="text-3xl md:text-5xl text-rose-600 font-black">{targetWord}</span>);
          setCorrectAnswer(isPresent ? t.data.yesNo[0] : t.data.yesNo[1]);
          setChoices(t.data.yesNo);
        }
      }, durationMs / 50);
    } else {
      let pool = symbols.filter(s => !recentSymbols.includes(s));
      if (pool.length < count) {
        recentSymbols = [];
        pool = symbols;
      }
      
      const chosenSymbols = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
      recentSymbols.push(...chosenSymbols);
      if (recentSymbols.length > 15) recentSymbols = recentSymbols.slice(recentSymbols.length - 15);

      setQuestionText(
        <div className="flex flex-wrap gap-3 text-5xl md:text-6xl justify-center">
          {chosenSymbols.join(' ')}
        </div>
      );

      const durationMs = Math.max(3000, 8000 - level * 250);
      let step = 100;
      memoryIntervalRef.current = setInterval(() => {
        step -= 2;
        setMemoryTimer(step);
        if (step <= 0) {
          if (memoryIntervalRef.current) clearInterval(memoryIntervalRef.current);
          setMemoryPhase('quiz');

          const missing = chosenSymbols.pop()!;
          setQuestionText(
            <div className="flex flex-wrap gap-3 text-5xl md:text-6xl justify-center">
              {chosenSymbols.join(' ')}
            </div>
          );

          setCorrectAnswer(missing);
          const answerChoices = [
            missing,
            ...symbols.filter(s => !chosenSymbols.includes(s) && s !== missing).sort(() => Math.random() - 0.5).slice(0, 3)
          ];
          setChoices(answerChoices.sort(() => Math.random() - 0.5));
        }
      }, durationMs / 50);
    }
  };

  const handleChoiceClick = (choice: string) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(choice);

    const correct = choice === correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      playAudioFeedback('success');
      setTimeout(() => onFinish(true), 600);
    } else {
      playAudioFeedback('error');
      setTimeout(() => {
        setSelectedChoice(null);
        setIsCorrect(null);
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8 w-full text-center min-h-[140px] flex items-center justify-center flex-col gap-2">
        <span
          className="text-3xl md:text-4xl font-black text-slate-800 leading-tight"
          style={questionStyle}
        >
          {questionText}
        </span>

        {memoryPhase === 'study' && (
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-100"
              style={{ width: `${memoryTimer}%` }}
            ></div>
          </div>
        )}
      </div>

      {memoryPhase === 'quiz' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {choices.map((choice, idx) => {
            const isSelected = selectedChoice === choice;
            let btnClass = 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200';

            if (isSelected) {
              if (isCorrect) {
                btnClass = 'bg-emerald-100 text-emerald-800 border-emerald-400 font-black';
              } else {
                btnClass = 'bg-rose-100 text-rose-800 border-rose-400 shake-subtle';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleChoiceClick(choice)}
                disabled={selectedChoice !== null}
                className={`tactile-btn w-full p-4 md:p-6 text-xl md:text-2xl font-bold transition-all ${btnClass}`}
              >
                {choice}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
