import React, { useEffect } from 'react';
import { Language } from '../types';
import { I18N } from '../data/i18n';
import { playAudioFeedback } from '../lib/audio';

interface EndScreenModalProps {
  isOpen: boolean;
  isWin: boolean;
  leveledUp: boolean;
  stars: number;
  lang: Language;
  onReplay: () => void;
  onGoHome: () => void;
}

export const EndScreenModal: React.FC<EndScreenModalProps> = ({
  isOpen,
  isWin,
  leveledUp,
  stars,
  lang,
  onReplay,
  onGoHome
}) => {
  const t = I18N[lang];

  useEffect(() => {
    if (isOpen) {
      if (isWin) {
        if (leveledUp) {
          setTimeout(() => playAudioFeedback('levelup'), 300);
        } else {
          setTimeout(() => playAudioFeedback('victory'), 200);
        }
      } else {
        setTimeout(() => playAudioFeedback('error'), 100);
      }
    }
  }, [isOpen, isWin, leveledUp]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full my-auto flex flex-col items-center text-center shadow-2xl border-2 border-slate-200 animate-fade-in relative">
        <div className="text-6xl sm:text-7xl mb-3 drop-shadow-sm anim-pop">
          {isWin ? (leveledUp ? '🎉' : '⭐') : '💡'}
        </div>

        <h2
          className={`text-2xl sm:text-3xl font-black mb-2 text-center leading-tight ${
            isWin ? 'text-slate-900' : 'text-slate-800'
          }`}
        >
          {isWin ? (leveledUp ? t.lvlUpTitle : t.endTitle) : t.loseTitle}
        </h2>

        <p className="text-base sm:text-lg text-slate-600 mb-5 text-center font-medium leading-relaxed">
          {isWin ? (leveledUp ? t.lvlUpDesc : t.endDesc) : t.loseDesc}
        </p>

        {isWin && (
          <div className="flex justify-center gap-1.5 text-3xl sm:text-4xl mb-6 bg-amber-50/80 p-3 px-5 rounded-2xl border border-amber-200 w-full">
            {[1, 2, 3, 4, 5].map((sIndex) => {
              const isFilled = sIndex <= stars;
              return (
                <i
                  key={sIndex}
                  className={`fa-solid fa-star ${
                    isFilled ? 'text-yellow-500 anim-pop' : 'text-slate-200'
                  }`}
                ></i>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              playAudioFeedback('click');
              onReplay();
            }}
            className="tactile-btn w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg border-emerald-700 shadow-md transition-all rounded-2xl flex items-center justify-center gap-2"
          >
            <span>{isWin ? t.btnReplay : 'RÉESSAYER'}</span>
            <i className="fa-solid fa-arrow-right text-base"></i>
          </button>

          <button
            onClick={() => {
              playAudioFeedback('click');
              onGoHome();
            }}
            className="tactile-btn w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm sm:text-base border-slate-300 transition-all rounded-2xl"
          >
            {t.btnMenu}
          </button>
        </div>
      </div>
    </div>
  );
};

