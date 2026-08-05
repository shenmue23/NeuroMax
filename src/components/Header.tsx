import React from 'react';
import { Language, UserProgressData } from '../types';
import { SaveSystem } from '../lib/saveSystem';
import { playAudioFeedback } from '../lib/audio';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  progress: UserProgressData;
  onOpenSettings: () => void;
  onOpenInstall: () => void;
  onGoHome: () => void;
  isInGame: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  progress,
  onOpenSettings,
  onOpenInstall,
  onGoHome,
  isInGame
}) => {
  const levelInfo = SaveSystem.getLevel(progress.xp);

  let percent = 100;
  if (levelInfo.lvl < 5) {
    percent = Math.min(
      100,
      Math.max(0, ((progress.xp - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100)
    );
  }

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex flex-row justify-between items-center z-20 shrink-0 gap-3 shadow-sm">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => {
          if (isInGame) {
            playAudioFeedback('click');
            onGoHome();
          }
        }}
      >
        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl md:text-2xl shadow-sm hover:bg-indigo-700 transition-colors">
          <i className="fa-solid fa-brain"></i>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-none tracking-tight">
            NeuroMax
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-semibold mt-0.5">
            {lang === 'fr' ? 'Entraînement Cognitif' : 'Treino Cognitivo'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shadow-sm flex-1 max-w-[200px] sm:max-w-[250px]">
        <div className="text-2xl md:text-3xl drop-shadow-sm">{levelInfo.icon}</div>
        <div className="flex flex-col flex-1 w-full">
          <div className="flex justify-between items-end mb-0.5">
            <span className="text-xs font-bold text-amber-800 leading-none">
              {levelInfo.name[lang]}
            </span>
            <span className="text-[10px] font-bold text-amber-600 leading-none">
              {progress.xp} XP
            </span>
          </div>
          <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shrink-0">
        <button
          onClick={() => {
            playAudioFeedback('click');
            setLang('fr');
          }}
          className={`px-2 py-1.5 md:px-3 rounded-lg text-xs md:text-sm font-bold transition-all ${
            lang === 'fr'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          FR
        </button>
        <button
          onClick={() => {
            playAudioFeedback('click');
            setLang('pt');
          }}
          className={`px-2 py-1.5 md:px-3 rounded-lg text-xs md:text-sm font-bold transition-all ${
            lang === 'pt'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          PT
        </button>
        <button
          onClick={() => {
            playAudioFeedback('click');
            onOpenInstall();
          }}
          className="px-2 py-1.5 md:px-3 rounded-lg text-xs md:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-1.5 shadow-2xs"
          title={lang === 'fr' ? "Installer l'app (Android / iPhone)" : "Instalar App (Android / iPhone)"}
        >
          <i className="fa-solid fa-mobile-screen-button"></i>
          <span className="hidden sm:inline">{lang === 'fr' ? 'Installer App' : 'Instalar App'}</span>
        </button>
        <button
          onClick={() => {
            playAudioFeedback('click');
            onOpenSettings();
          }}
          className="px-2 py-1.5 md:px-3 rounded-lg text-xs md:text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all"
          title="Paramètres / Definições"
        >
          <i className="fa-solid fa-gear"></i>
        </button>
      </div>
    </header>
  );
};
