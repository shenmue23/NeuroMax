import React, { useState, useEffect } from 'react';
import { Language, PersonCharacter } from '../../types';
import { I18N, generateGenderMatchedPeople, getGenderMatchedDistractors } from '../../data/i18n';
import { playAudioFeedback } from '../../lib/audio';

interface NamesGameProps {
  lang: Language;
  level: number;
  onFinish: (isWin: boolean) => void;
}

export const NamesGame: React.FC<NamesGameProps> = ({ lang, level, onFinish }) => {
  const t = I18N[lang];
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [people, setPeople] = useState<PersonCharacter[]>([]);
  const [targetPerson, setTargetPerson] = useState<PersonCharacter | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timerProgress, setTimerProgress] = useState(100);

  useEffect(() => {
    startNewRound();
  }, [level, lang]);

  const startNewRound = () => {
    setPhase('study');
    setSelectedName(null);
    setIsCorrect(null);
    setTimerProgress(100);

    // Calculate number of people based on level (2 to 6 people)
    const count = Math.min(6, Math.max(2, 2 + Math.floor((level - 1) / 3)));
    
    // Strict gender matching: female faces get female names, male faces get male names
    const generatedPeople = generateGenderMatchedPeople(count, lang);
    setPeople(generatedPeople);

    // Timer duration reduces slightly with level
    const durationMs = Math.max(3500, 8000 - level * 250);
    const intervalMs = 50;
    const steps = durationMs / intervalMs;
    let currentStep = steps;

    const timer = setInterval(() => {
      currentStep--;
      setTimerProgress((currentStep / steps) * 100);
      if (currentStep <= 0) {
        clearInterval(timer);
        goToQuizPhase(generatedPeople);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  };

  const goToQuizPhase = (currentPeople: PersonCharacter[]) => {
    setPhase('quiz');
    const randomTarget = currentPeople[Math.floor(Math.random() * currentPeople.length)];
    setTargetPerson(randomTarget);

    // Get wrong choices that strictly match the target character's gender
    const distractors = getGenderMatchedDistractors(randomTarget, 4, lang);
    setChoices(distractors);
  };

  const handleAnswer = (chosenName: string) => {
    if (selectedName !== null || !targetPerson) return;
    setSelectedName(chosenName);

    const correct = chosenName === targetPerson.name;
    setIsCorrect(correct);

    if (correct) {
      playAudioFeedback('success');
      setTimeout(() => {
        onFinish(true);
      }, 900);
    } else {
      playAudioFeedback('error');
      setTimeout(() => {
        setSelectedName(null);
        setIsCorrect(null);
      }, 1200);
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      {/* Instruction */}
      <div className="text-center mb-6 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2">
        <h3 className="text-base md:text-lg font-bold text-slate-800">
          {phase === 'study' ? t.gameData.names.instPhase1 : t.gameData.names.instPhase2}
        </h3>
        {phase === 'study' && (
          <p className="text-xs text-indigo-600 font-semibold">
            {lang === 'fr'
              ? 'Chaque visage est associé à son prénom masculin ou féminin.'
              : 'Cada rosto está associado ao seu nome masculino ou feminino.'}
          </p>
        )}
      </div>

      {phase === 'study' ? (
        <div className="flex flex-col items-center w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[220px]">
          <div className="flex flex-wrap justify-center gap-6 mb-8 w-full">
            {people.map((p, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-50 rounded-full border-4 border-indigo-200 flex items-center justify-center text-4xl md:text-5xl shadow-inner">
                  {p.face}
                </div>
                <span className="font-black text-lg text-indigo-800 bg-indigo-100/80 px-3 py-1 rounded-full shadow-xs">
                  {p.name}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {p.gender === 'female' ? (lang === 'fr' ? 'Féminin' : 'Feminino') : (lang === 'fr' ? 'Masculin' : 'Masculino')}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-75"
              style={{ width: `${timerProgress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full gap-6">
          {targetPerson && (
            <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full">
              <div className="w-28 h-28 md:w-36 md:h-36 bg-amber-50 rounded-full border-4 border-amber-300 flex items-center justify-center text-6xl md:text-7xl shadow-md anim-pop">
                {targetPerson.face}
              </div>
              <span className="font-black text-2xl text-slate-400">???</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {choices.map((name, idx) => {
              const isSelected = selectedName === name;
              let btnClass = 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50';

              if (isSelected) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-100 text-emerald-800 border-emerald-400 font-black scale-102';
                } else {
                  btnClass = 'bg-rose-100 text-rose-800 border-rose-400 shake-subtle';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(name)}
                  disabled={selectedName !== null}
                  className={`tactile-btn w-full p-4 md:p-6 text-xl md:text-2xl font-bold transition-all shadow-sm ${btnClass}`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
