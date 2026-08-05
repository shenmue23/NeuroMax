import React from 'react';
import { Language, UserProgressData } from '../types';
import { SaveSystem } from '../lib/saveSystem';
import { playAudioFeedback } from '../lib/audio';
import { NeuromaxLogo } from './Logo';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  progress: UserProgressData;
  onOpenSettings: () => void;
  onOpenInstall: () => void;
  onOpenPresentation?: () => void;
  onOpenGames?: () => void;
  onGoHome: () => void;
  currentView?: 'presentation' | 'dashboard' | 'game';
  isInGame: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  progress,
  onOpenSettings,
  onOpenInstall,
  onOpenPresentation,
  onOpenGames,
  onGoHome,
  currentView = 'presentation',
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
        className="flex items-center gap-2 cursor-pointer shrink-0"
        onClick={() => {
          if (isInGame) {
            playAudioFeedback('click');
            onGoHome();
          }
        }}
        title={lang === 'fr' ? "NeuroMax - Accueil" : "NeuroMax - Início"}
      >
        <NeuromaxLogo size={40} className="hover:scale-105 transition-transform shrink-0" />
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
          className={`px-2 py-1.5 md:px-3 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
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
          className={`px-2 py-1.5 md:px-3 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
            lang === 'pt'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          PT
        </button>
      </div>
    </header>
  );
};
