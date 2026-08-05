import React, { useState } from 'react';
import { Category, GameData, Language, UserProgressData } from '../types';
import { I18N } from '../data/i18n';
import { SaveSystem } from '../lib/saveSystem';
import { playAudioFeedback } from '../lib/audio';

export const GAMES_LIST: GameData[] = [
  { id: 'pairs', cat: 'memory', icon: 'fa-clone', color: 'text-indigo-500', engine: 'grid', params: { type: 'pairs' } },
  { id: 'sequence', cat: 'memory', icon: 'fa-traffic-light', color: 'text-rose-500', engine: 'sequence' },
  { id: 'recall', cat: 'memory', icon: 'fa-list-check', color: 'text-teal-500', engine: 'quiz', params: { type: 'recall' } },
  { id: 'missing', cat: 'memory', icon: 'fa-ghost', color: 'text-purple-500', engine: 'quiz', params: { type: 'missing' } },
  { id: 'names', cat: 'memory', icon: 'fa-users', color: 'text-pink-500', engine: 'names' },
  { id: 'path', cat: 'memory', icon: 'fa-route', color: 'text-sky-500', engine: 'path' },

  { id: 'oddone', cat: 'attention', icon: 'fa-magnifying-glass', color: 'text-amber-500', engine: 'grid', params: { type: 'oddone' } },
  { id: 'target', cat: 'attention', icon: 'fa-crosshairs', color: 'text-red-500', engine: 'grid', params: { type: 'target' } },
  { id: 'stroop', cat: 'attention', icon: 'fa-palette', color: 'text-fuchsia-500', engine: 'quiz', params: { type: 'stroop' } },
  { id: 'orderNum', cat: 'attention', icon: 'fa-arrow-down-1-9', color: 'text-blue-500', engine: 'grid', params: { type: 'orderNum' } },
  { id: 'orderAlpha', cat: 'attention', icon: 'fa-arrow-down-a-z', color: 'text-emerald-500', engine: 'grid', params: { type: 'orderAlpha' } },

  { id: 'math', cat: 'logic', icon: 'fa-calculator', color: 'text-cyan-500', engine: 'quiz', params: { type: 'math' } },
  { id: 'series', cat: 'logic', icon: 'fa-ellipsis', color: 'text-orange-500', engine: 'quiz', params: { type: 'series' } },
  { id: 'greater', cat: 'logic', icon: 'fa-scale-unbalanced', color: 'text-lime-500', engine: 'quiz', params: { type: 'greater' } },
  { id: 'sudoku', cat: 'logic', icon: 'fa-table', color: 'text-slate-600', engine: 'sudoku' },
  { id: 'peg', cat: 'logic', icon: 'fa-circle-dot', color: 'text-amber-600', engine: 'peg' },
  { id: 'uno', cat: 'logic', icon: 'fa-layer-group', color: 'text-rose-600', engine: 'uno' },
  { id: 'checkers', cat: 'logic', icon: 'fa-chess-board', color: 'text-stone-700', engine: 'checkers' },

  { id: 'capitals', cat: 'language', icon: 'fa-earth-europe', color: 'text-blue-600', engine: 'quiz', params: { type: 'dict', key: 'capitals' } },
  { id: 'opposites', cat: 'language', icon: 'fa-arrows-left-right', color: 'text-slate-600', engine: 'quiz', params: { type: 'dict', key: 'opposites' } },
  { id: 'proverbs', cat: 'language', icon: 'fa-comment-dots', color: 'text-rose-500', engine: 'quiz', params: { type: 'dict', key: 'proverbs' } },
  { id: 'wordsearch', cat: 'language', icon: 'fa-border-all', color: 'text-emerald-600', engine: 'wordsearch' },

  { id: 'chroni', cat: 'history', icon: 'fa-timeline', color: 'text-orange-700', engine: 'chroni' }
];

interface DashboardProps {
  lang: Language;
  progress: UserProgressData;
  onSelectGame: (game: GameData) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, progress, onSelectGame }) => {
  const [currentCategory, setCurrentCategory] = useState<Category>('all');
  const t = I18N[lang];

  const categories: Category[] = ['all', 'memory', 'attention', 'logic', 'language', 'history'];

  const filteredGames = currentCategory === 'all'
    ? GAMES_LIST
    : GAMES_LIST.filter(g => g.cat === currentCategory);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in pb-24">
      <div className="mb-6 bg-indigo-50/50 p-5 md:p-6 rounded-2xl border border-indigo-100">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-1">
          {t.dashTitle}
        </h2>
        <p className="text-slate-600 text-sm md:text-base font-medium">
          {t.dashDesc}
        </p>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              playAudioFeedback('click');
              setCurrentCategory(cat);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
              currentCategory === cat
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.categories[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGames.map(game => {
          const gameProg = SaveSystem.getGameProgress(progress, game.id);
          const gameInfo = (t.gameData as any)[game.id] || { title: game.id, desc: '' };

          return (
            <div
              key={game.id}
              onClick={() => {
                playAudioFeedback('click');
                onSelectGame(game);
              }}
              className="tactile-card p-4 flex gap-4 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 items-center relative overflow-hidden transition-all group"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl md:text-2xl shadow-sm ${game.color} group-hover:scale-105 transition-transform`}>
                <i className={`fa-solid ${game.icon}`}></i>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-base md:text-lg font-bold text-slate-800 truncate">
                  {gameInfo.title}
                </h3>
                <p className="text-xs text-slate-500 truncate mb-1">
                  {gameInfo.desc}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">
                    {t.lvlPrefix} {gameProg.level}
                  </span>
                  <div className="text-[10px] md:text-xs flex gap-0.5">
                    {[0, 1, 2, 3, 4].map(idx => (
                      <i
                        key={idx}
                        className={`fa-solid fa-star ${
                          idx < gameProg.stars ? 'text-yellow-500' : 'text-slate-200'
                        }`}
                      ></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
