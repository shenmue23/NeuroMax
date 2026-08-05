import React, { useState, useEffect } from 'react';
import { GameData, Language, UserProgressData } from './types';
import { SaveSystem } from './lib/saveSystem';
import { I18N } from './data/i18n';
import { playAudioFeedback } from './lib/audio';

import { Header } from './components/Header';
import { Dashboard, GAMES_LIST } from './components/Dashboard';
import { SettingsModal } from './components/SettingsModal';
import { EndScreenModal } from './components/EndScreenModal';

import { PegSolitaireGame } from './components/games/PegSolitaireGame';
import { UnoGame } from './components/games/UnoGame';
import { NamesGame } from './components/games/NamesGame';
import { PairsGame } from './components/games/PairsGame';
import { SequenceGame } from './components/games/SequenceGame';
import { WordSearchGame } from './components/games/WordSearchGame';
import { SudokuGame } from './components/games/SudokuGame';
import { CheckersGame } from './components/games/CheckersGame';
import { GridGames } from './components/games/GridGames';
import { PathGame } from './components/games/PathGame';
import { QuizGames } from './components/games/QuizGames';
import { ChroniGame } from './components/games/ChroniGame';

export default function App() {
  const [lang, setLang] = useState<Language>('pt');
  const [progress, setProgress] = useState<UserProgressData>({ games: {}, xp: 0 });
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [endModal, setEndModal] = useState<{
    isOpen: boolean;
    isWin: boolean;
    leveledUp: boolean;
    stars: number;
  }>({
    isOpen: false,
    isWin: true,
    leveledUp: false,
    stars: 0
  });

  const [replayCount, setReplayCount] = useState<number>(0);

  useEffect(() => {
    const loaded = SaveSystem.load();
    setProgress(loaded);
  }, []);

  const handleSelectGame = (game: GameData) => {
    setSelectedGame(game);
    setEndModal({ isOpen: false, isWin: true, leveledUp: false, stars: 0 });
  };

  const handleGoHome = () => {
    setSelectedGame(null);
    setEndModal({ isOpen: false, isWin: true, leveledUp: false, stars: 0 });
  };

  const handleFinishGame = (isWin: boolean) => {
    if (!selectedGame) return;

    if (isWin) {
      const result = SaveSystem.addWin({ ...progress }, selectedGame.id);
      setProgress({ ...result.data });
      setEndModal({
        isOpen: true,
        isWin: true,
        leveledUp: result.leveledUp,
        stars: result.stars
      });
    } else {
      const gameProg = SaveSystem.getGameProgress(progress, selectedGame.id);
      setEndModal({
        isOpen: true,
        isWin: false,
        leveledUp: false,
        stars: gameProg.stars
      });
    }
  };

  const handleReplayGame = () => {
    setEndModal({ isOpen: false, isWin: true, leveledUp: false, stars: 0 });
    setReplayCount(prev => prev + 1);
  };

  const t = I18N[lang];
  const currentGameProg = selectedGame ? SaveSystem.getGameProgress(progress, selectedGame.id) : null;
  const gameInfo = selectedGame ? (t.gameData as any)[selectedGame.id] || { title: selectedGame.id, inst: '' } : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <Header
        lang={lang}
        setLang={setLang}
        progress={progress}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGoHome={handleGoHome}
        isInGame={selectedGame !== null}
      />

      <main className="flex-grow overflow-y-auto relative w-full hide-scrollbar">
        {!selectedGame ? (
          <Dashboard
            lang={lang}
            progress={progress}
            onSelectGame={handleSelectGame}
          />
        ) : (
          <div className="w-full h-full flex flex-col bg-slate-50">
            {/* Top Game Navigation Bar */}
            <div className="border-b border-slate-200 p-3 md:p-4 flex flex-row justify-between items-center bg-white shadow-xs z-10 gap-2 shrink-0">
              <button
                onClick={() => {
                  playAudioFeedback('click');
                  handleGoHome();
                }}
                className="tactile-btn text-slate-700 font-bold text-sm md:text-base px-3 py-2 md:px-4 md:py-2 hover:bg-slate-50 flex items-center gap-2"
              >
                <i className="fa-solid fa-chevron-left"></i>
                <span className="hidden sm:inline">{t.btnBack}</span>
              </button>

              <h2 className="text-lg md:text-xl font-black text-slate-800 text-center truncate flex-1 px-2">
                {gameInfo?.title}
              </h2>

              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-slate-200">
                <span className="text-xs md:text-sm font-bold text-slate-500 uppercase">
                  {t.lvlPrefix}
                </span>
                <span className="text-base md:text-lg font-black text-indigo-700 leading-none">
                  {currentGameProg?.level || 1}
                </span>
              </div>
            </div>

            {/* Game Main Body Container */}
            <div className="flex-grow flex flex-col items-center justify-start p-3 md:p-6 overflow-y-auto relative w-full hide-scrollbar pb-24">
              {/* Stars & Instructions Header */}
              <div className="text-center mb-4 md:mb-6 w-full max-w-2xl bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center gap-3">
                <div className="flex gap-1 text-sm md:text-lg">
                  {[0, 1, 2, 3, 4].map(idx => (
                    <i
                      key={idx}
                      className={`fa-solid fa-star ${
                        idx < (currentGameProg?.stars || 0)
                          ? 'text-yellow-500'
                          : 'text-slate-200'
                      }`}
                    ></i>
                  ))}
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <h3 className="text-sm md:text-base font-bold text-slate-700 leading-snug flex-1 text-left">
                  {gameInfo?.inst || gameInfo?.desc}
                </h3>
              </div>

              {/* Game Router */}
              <div key={`game-${selectedGame.id}-${currentGameProg?.level || 1}-${replayCount}`} className="w-full flex justify-center items-center">
                {selectedGame.id === 'peg' && (
                  <PegSolitaireGame
                    lang={lang}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}

                {selectedGame.id === 'uno' && (
                  <UnoGame
                    lang={lang}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}

                {selectedGame.id === 'names' && (
                  <NamesGame
                    lang={lang}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}

                {selectedGame.id === 'pairs' && (
                  <PairsGame
                    lang={lang}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}

                {selectedGame.id === 'sequence' && (
                  <SequenceGame
                    lang={lang}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}

                {selectedGame.id === 'wordsearch' && (
                  <WordSearchGame
                    lang={lang}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}

                {selectedGame.id === 'sudoku' && (
                  <SudokuGame
                    lang={lang}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}

                {selectedGame.id === 'checkers' && (
                  <CheckersGame
                    lang={lang}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}

                {['oddone', 'target', 'orderNum', 'orderAlpha'].includes(selectedGame.id) && (
                  <GridGames
                    lang={lang}
                    type={selectedGame.id as any}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}

                {selectedGame.id === 'path' && (
                  <PathGame
                    lang={lang}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}

                {['recall', 'missing', 'stroop', 'math', 'series', 'greater', 'capitals', 'opposites', 'proverbs'].includes(selectedGame.id) && (
                  <QuizGames
                    lang={lang}
                    type={selectedGame.engine === 'quiz' && selectedGame.params?.type ? selectedGame.params.type : selectedGame.id}
                    params={selectedGame.params}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}

                {selectedGame.id === 'chroni' && (
                  <ChroniGame
                    lang={lang}
                    level={currentGameProg?.level || 1}
                    onFinish={handleFinishGame}
                  />
                )}
              </div>

              {/* End Screen Modal overlay inside game view */}
              <EndScreenModal
                isOpen={endModal.isOpen}
                isWin={endModal.isWin}
                leveledUp={endModal.leveledUp}
                stars={endModal.stars}
                lang={lang}
                onReplay={handleReplayGame}
                onGoHome={handleGoHome}
              />
            </div>
          </div>
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        progress={progress}
        onImportProgress={(newProg) => setProgress(newProg)}
      />
    </div>
  );
}
