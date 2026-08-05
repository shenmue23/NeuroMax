import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { playAudioFeedback } from '../../lib/audio';

interface PairsGameProps {
  lang: Language;
  level: number;
  onFinish: (isWin: boolean) => void;
}

const ICONS = ['🚗', '🍎', '🌻', '🐶', '⚽', '🎸', '📱', '📚', '☕', '🚲', '🐢', '🍉', '🍕', '🔑', '🎨', '🚀', '⭐', '🎈', '🔔', '🎁'];

export const PairsGame: React.FC<PairsGameProps> = ({ level, onFinish }) => {
  const [cards, setCards] = useState<{ id: number; icon: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [locked, setLocked] = useState<boolean>(false);

  useEffect(() => {
    initCards();
  }, [level]);

  const initCards = () => {
    const cardCount = 8 + Math.min(3, Math.floor((level - 1) / 5)) * 4;
    const subset = [...ICONS].sort(() => Math.random() - 0.5).slice(0, cardCount / 2);
    const doubled = [...subset, ...subset].sort(() => Math.random() - 0.5);

    setCards(
      doubled.map((icon, idx) => ({
        id: idx,
        icon,
        flipped: false,
        matched: false
      }))
    );
    setFlippedIndices([]);
    setLocked(false);
  };

  const handleCardClick = (index: number) => {
    if (locked || cards[index].flipped || cards[index].matched) return;

    playAudioFeedback('click');
    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [first, second] = newFlipped;

      if (newCards[first].icon === newCards[second].icon) {
        playAudioFeedback('success');
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setFlippedIndices([]);
        setLocked(false);

        if (newCards.every(c => c.matched)) {
          setTimeout(() => onFinish(true), 700);
        }
      } else {
        setTimeout(() => {
          playAudioFeedback('error');
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setFlippedIndices([]);
          setLocked(false);
        }, 1000);
      }
    }
  };

  const colsClass =
    cards.length <= 8 ? 'grid-cols-4' : cards.length <= 12 ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-5';

  return (
    <div className={`grid ${colsClass} gap-2 md:gap-3 w-full max-w-md md:max-w-xl mx-auto`}>
      {cards.map((card, idx) => (
        <div
          key={card.id}
          onClick={() => handleCardClick(idx)}
          className={`card-container aspect-square w-full tactile-card shadow-none border-none ${
            card.flipped || card.matched ? 'flipped' : ''
          } ${card.matched ? 'card-matched' : ''}`}
        >
          <div className="card-inner w-full h-full">
            <div className="card-front">
              <i className="fa-solid fa-question text-xl md:text-3xl text-slate-400"></i>
            </div>
            <div className="card-back text-3xl md:text-4xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
