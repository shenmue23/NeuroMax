import React, { useState, useEffect } from 'react';
import { Language, UnoCard, UnoColor, UnoValue } from '../../types';
import { I18N } from '../../data/i18n';
import { playAudioFeedback } from '../../lib/audio';

interface UnoGameProps {
  lang: Language;
  level: number;
  onFinish: (isWin: boolean) => void;
}

export const UnoGame: React.FC<UnoGameProps> = ({ lang, level, onFinish }) => {
  const t = I18N[lang];

  const COLORS: UnoColor[] = ['red', 'blue', 'green', 'yellow'];
  const VALUES: UnoValue[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', '+2'];

  const [playerHand, setPlayerHand] = useState<UnoCard[]>([]);
  const [botHand, setBotHand] = useState<UnoCard[]>([]);
  const [discardPile, setDiscardPile] = useState<UnoCard[]>([]);
  const [drawPile, setDrawPile] = useState<UnoCard[]>([]);
  const [currentColor, setCurrentColor] = useState<UnoColor>('red');
  const [currentValue, setCurrentValue] = useState<UnoValue>('1');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [pendingWildCardIndex, setPendingWildCardIndex] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);

  useEffect(() => {
    setupNewGame();
  }, [level]);

  const setupNewGame = () => {
    let deck: UnoCard[] = [];
    COLORS.forEach(c => {
      VALUES.forEach(v => {
        deck.push({ color: c, value: v, id: Math.random().toString() });
        if (v !== '0') deck.push({ color: c, value: v, id: Math.random().toString() });
      });
    });

    // Add Wild cards
    for (let i = 0; i < 4; i++) {
      deck.push({ color: 'wild', value: 'wild', id: Math.random().toString() });
      deck.push({ color: 'wild', value: '+4', id: Math.random().toString() });
    }

    // Shuffle
    deck = deck.sort(() => Math.random() - 0.5);

    const initialPlayer: UnoCard[] = [];
    const initialBot: UnoCard[] = [];
    const handSize = Math.min(7, Math.max(3, 2 + Math.floor(level / 2)));

    for (let i = 0; i < handSize; i++) {
      initialPlayer.push(deck.pop()!);
      initialBot.push(deck.pop()!);
    }

    let topDiscard = deck.pop()!;
    while (topDiscard.color === 'wild') {
      deck.unshift(topDiscard);
      topDiscard = deck.pop()!;
    }

    setDrawPile(deck);
    setPlayerHand(initialPlayer);
    setBotHand(initialBot);
    setDiscardPile([topDiscard]);
    setCurrentColor(topDiscard.color);
    setCurrentValue(topDiscard.value);
    setGameOver(false);
    setShowColorPicker(false);
    setPendingWildCardIndex(null);
    setStatusText(t.unoPlayerTurn);
  };

  const getCardDisplay = (card: UnoCard) => {
    if (card.value === 'wild') {
      return {
        title: 'JOKER 🎨',
        subtitle: lang === 'fr' ? 'Changer Couleur' : 'Mudar Cor'
      };
    }
    if (card.value === '+4') {
      return {
        title: 'JOKER +4 ⚡',
        subtitle: lang === 'fr' ? '+4 & Couleur' : '+4 & Cor'
      };
    }
    if (card.value === 'skip') {
      return {
        title: 'PASSER 🚫',
        subtitle: lang === 'fr' ? 'Sauter tour' : 'Passar vez'
      };
    }
    if (card.value === 'reverse') {
      return {
        title: 'INVERSER 🔄',
        subtitle: lang === 'fr' ? 'Changer sens' : 'Mudar sentido'
      };
    }
    if (card.value === '+2') {
      return {
        title: '+2 CARTE 🎴',
        subtitle: lang === 'fr' ? 'Piocher +2' : 'Comprar +2'
      };
    }
    return {
      title: card.value,
      subtitle: ''
    };
  };

  const getColorName = (c: UnoColor) => {
    switch (c) {
      case 'red': return lang === 'fr' ? 'Rouge 🔴' : 'Vermelho 🔴';
      case 'blue': return lang === 'fr' ? 'Bleu 🔵' : 'Azul 🔵';
      case 'green': return lang === 'fr' ? 'Vert 🟢' : 'Verde 🟢';
      case 'yellow': return lang === 'fr' ? 'Jaune 🟡' : 'Amarelo 🟡';
      default: return lang === 'fr' ? 'Multicolore 🌈' : 'Multicor 🌈';
    }
  };

  const isPlayable = (card: UnoCard) => {
    return card.color === 'wild' || card.color === currentColor || card.value === currentValue;
  };

  const playCard = (index: number) => {
    if (gameOver || showColorPicker) return;
    const card = playerHand[index];

    if (!isPlayable(card)) {
      playAudioFeedback('error');
      return;
    }

    if (card.color === 'wild') {
      // Show explicit color picker dialog
      setPendingWildCardIndex(index);
      setShowColorPicker(true);
      return;
    }

    executePlayCard(index, card.color);
  };

  const handleColorChoice = (chosenColor: UnoColor) => {
    if (pendingWildCardIndex === null) return;
    setShowColorPicker(false);
    executePlayCard(pendingWildCardIndex, chosenColor);
    setPendingWildCardIndex(null);
  };

  const executePlayCard = (index: number, chosenColor: UnoColor) => {
    playAudioFeedback('success');
    const newHand = [...playerHand];
    const [card] = newHand.splice(index, 1);

    const newDiscard = [...discardPile, card];
    setPlayerHand(newHand);
    setDiscardPile(newDiscard);
    setCurrentColor(chosenColor);
    setCurrentValue(card.value);

    if (newHand.length === 0) {
      setGameOver(true);
      setStatusText(lang === 'fr' ? 'Victoire ! Vous avez vidé votre main !' : 'Vitória ! Esvaziou a sua mão !');
      playAudioFeedback('victory');
      setTimeout(() => onFinish(true), 800);
      return;
    }

    setStatusText(t.unoBotTurn);
    setTimeout(() => botTurn(newDiscard, drawPile, botHand, chosenColor, card.value), 1000);
  };

  const drawCard = () => {
    if (gameOver || showColorPicker) return;
    playAudioFeedback('click');

    let currentDraw = [...drawPile];
    let currentDiscard = [...discardPile];

    if (currentDraw.length === 0) {
      const top = currentDiscard.pop()!;
      currentDraw = currentDiscard.sort(() => Math.random() - 0.5);
      currentDiscard = [top];
    }

    const newCard = currentDraw.pop()!;
    const newPlayerHand = [...playerHand, newCard];

    setDrawPile(currentDraw);
    setDiscardPile(currentDiscard);
    setPlayerHand(newPlayerHand);

    // Turn moves to bot after drawing
    setStatusText(t.unoBotTurn);
    setTimeout(() => botTurn(currentDiscard, currentDraw, botHand, currentColor, currentValue), 1000);
  };

  const botTurn = (
    currentDiscard: UnoCard[],
    currentDraw: UnoCard[],
    currentBotHand: UnoCard[],
    cColor: UnoColor,
    cValue: UnoValue
  ) => {
    let localBotHand = [...currentBotHand];
    let localDraw = [...currentDraw];
    let localDiscard = [...currentDiscard];

    const playableIndex = localBotHand.findIndex(
      c => c.color === 'wild' || c.color === cColor || c.value === cValue
    );

    if (playableIndex !== -1) {
      const [card] = localBotHand.splice(playableIndex, 1);
      localDiscard.push(card);

      const nextColor = card.color === 'wild' ? COLORS[Math.floor(Math.random() * 4)] : card.color;
      setCurrentColor(nextColor);
      setCurrentValue(card.value);
      setDiscardPile(localDiscard);
      setBotHand(localBotHand);

      if (localBotHand.length === 0) {
        setGameOver(true);
        setStatusText(lang === 'fr' ? "L'ordinateur a gagné !" : "O computador ganhou !");
        setTimeout(() => onFinish(false), 800);
        return;
      }
    } else {
      if (localDraw.length === 0) {
        const top = localDiscard.pop()!;
        localDraw = localDiscard.sort(() => Math.random() - 0.5);
        localDiscard = [top];
      }
      const drawn = localDraw.pop()!;
      localBotHand.push(drawn);

      setDrawPile(localDraw);
      setDiscardPile(localDiscard);
      setBotHand(localBotHand);
    }

    setStatusText(t.unoPlayerTurn);
  };

  const topDiscardCard = discardPile[discardPile.length - 1];
  const topDisplay = topDiscardCard ? getCardDisplay(topDiscardCard) : { title: '', subtitle: '' };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-4 relative">
      {/* Bot Hand Counter */}
      <div className="flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200 w-full shadow-sm">
        <span className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          {lang === 'fr' ? 'Adversaire (Robot)' : 'Oponente (Robô)'}
        </span>
        <div className="flex flex-wrap justify-center -space-x-3 mb-1">
          {botHand.map((_, i) => (
            <div
              key={i}
              className="w-8 h-12 bg-slate-800 rounded-md border-2 border-slate-700 shadow-sm flex items-center justify-center text-white font-bold text-xs"
            >
              UNO
            </div>
          ))}
        </div>
        <span className="text-sm font-bold text-slate-600">
          {botHand.length} {lang === 'fr' ? 'cartes restantes' : 'cartas restantes'}
        </span>
      </div>

      {/* Play Area: Draw Deck & Discard Pile */}
      <div className="flex gap-6 md:gap-12 bg-slate-100 p-4 md:p-6 rounded-2xl border border-slate-200 w-full justify-center items-center shadow-inner">
        {/* Draw Pile */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            {t.pioche}
          </span>
          <div
            onClick={drawCard}
            className="w-20 h-28 md:w-24 md:h-34 bg-slate-900 rounded-xl border-3 border-indigo-400 flex flex-col items-center justify-center shadow-md cursor-pointer hover:-translate-y-1.5 transition-all group"
          >
            <div className="w-14 h-20 md:w-16 md:h-24 border-2 border-rose-500 rounded-full flex items-center justify-center bg-slate-950 text-white font-black text-base md:text-xl rotate-[-20deg] group-hover:scale-105 transition-transform">
              UNO
            </div>
          </div>
        </div>

        {/* Current Color Indicator */}
        <div className="flex flex-col items-center justify-center px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">
            {lang === 'fr' ? 'Couleur active :' : 'Cor ativa :'}
          </span>
          <span className="text-sm font-black text-slate-800">
            {getColorName(currentColor)}
          </span>
        </div>

        {/* Discard Pile */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            {t.defausse}
          </span>
          {topDiscardCard && (
            <div
              className={`uno-card w-20 h-28 md:w-24 md:h-34 uno-card-${topDiscardCard.color}`}
            >
              <span className="text-base md:text-xl font-black text-center px-1 leading-tight">
                {topDisplay.title}
              </span>
              {topDisplay.subtitle && (
                <span className="text-[9px] md:text-[11px] opacity-90 uppercase font-bold mt-1 text-center px-1">
                  {topDisplay.subtitle}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status & Help Bar */}
      <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl w-full text-center">
        <p className="text-sm md:text-base font-bold text-indigo-800">
          {statusText}
        </p>
      </div>

      {/* Player Hand */}
      <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-slate-200 w-full shadow-sm">
        <span className="text-xs font-semibold text-indigo-500 mb-3 uppercase tracking-wider">
          {lang === 'fr' ? 'Vos cartes (Cliquez pour jouer)' : 'Suas cartas (Toque para jogar)'}
        </span>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 w-full">
          {playerHand.map((card, i) => {
            const display = getCardDisplay(card);
            const playable = isPlayable(card);

            return (
              <div
                key={card.id || i}
                onClick={() => playCard(i)}
                className={`uno-card w-18 h-26 md:w-22 md:h-32 uno-card-${card.color} ${
                  !playable 
                    ? 'opacity-60 cursor-not-allowed scale-95' 
                    : 'playable cursor-pointer !border-[4px] !border-slate-900 shadow-xl -translate-y-2'
                }`}
              >
                <span className="text-xs md:text-sm font-black text-center px-1 leading-tight">
                  {display.title}
                </span>
                {display.subtitle && (
                  <span className="text-[8px] md:text-[10px] opacity-90 uppercase font-bold mt-1 text-center px-1">
                    {display.subtitle}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Selection Dialog Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border-4 border-slate-900 text-center">
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              {lang === 'fr' ? 'Choisissez la couleur 🎨' : 'Escolha a cor 🎨'}
            </h3>
            <p className="text-sm text-slate-600 mb-6 font-medium">
              {lang === 'fr'
                ? 'Quelle couleur souhaitez-vous demander ?'
                : 'Qual cor deseja solicitar ?'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleColorChoice('red')}
                className="tactile-btn p-4 bg-red-500 text-white text-lg font-bold hover:bg-red-600 rounded-xl flex items-center justify-center gap-2"
              >
                🔴 {lang === 'fr' ? 'Rouge' : 'Vermelho'}
              </button>
              <button
                onClick={() => handleColorChoice('blue')}
                className="tactile-btn p-4 bg-blue-500 text-white text-lg font-bold hover:bg-blue-600 rounded-xl flex items-center justify-center gap-2"
              >
                🔵 {lang === 'fr' ? 'Bleu' : 'Azul'}
              </button>
              <button
                onClick={() => handleColorChoice('green')}
                className="tactile-btn p-4 bg-emerald-500 text-white text-lg font-bold hover:bg-emerald-600 rounded-xl flex items-center justify-center gap-2"
              >
                🟢 {lang === 'fr' ? 'Vert' : 'Verde'}
              </button>
              <button
                onClick={() => handleColorChoice('yellow')}
                className="tactile-btn p-4 bg-amber-500 text-white text-lg font-bold hover:bg-amber-600 rounded-xl flex items-center justify-center gap-2"
              >
                🟡 {lang === 'fr' ? 'Jaune' : 'Amarelo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
