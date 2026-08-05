import React, { useState } from 'react';
import { Language } from '../types';
import { NeuromaxLogo } from './Logo';
import { playAudioFeedback } from '../lib/audio';

interface PresentationPageProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenInstall: () => void;
  onStartPlaying: () => void;
  onClose?: () => void;
}

export const PresentationPage: React.FC<PresentationPageProps> = ({
  lang,
  setLang,
  onOpenInstall,
  onStartPlaying,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const isFr = lang === 'fr';

  const targetUrl = "https://shenmue23.github.io/NeuroMax/";

  const handleShare = async () => {
    playAudioFeedback('click');
    const shareData = {
      title: 'NeuroMax',
      text: isFr ? 'NeuroMax - Entraînement Cognitif Personnalisé' : 'NeuroMax - Treino Cognitivo Personalizado',
      url: targetUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user canceled or unsupported
      }
    } else {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 flex flex-col items-center justify-start font-sans print:bg-white print:p-0 print:m-0">
      {/* POSTER CANVAS (Styled like the document attached) */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border-4 border-indigo-900/10 p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none print:p-4">
        
        {/* Decorative Top Arch / Brain Corner Elements */}
        <div className="absolute top-2 left-2 text-indigo-200 text-xl pointer-events-none opacity-40">
          <i className="fa-solid fa-brain"></i>
        </div>
        <div className="absolute top-2 right-2 text-indigo-200 text-xl pointer-events-none opacity-40">
          <i className="fa-solid fa-brain"></i>
        </div>

        {/* 1. HEADER SECTION */}
        <div className="text-center mb-6 space-y-2">
          <div className="flex justify-center items-center gap-3 mb-2">
            <NeuromaxLogo size={64} className="shadow-lg border-2 border-indigo-400/30" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-indigo-950 tracking-tight uppercase leading-none drop-shadow-xs">
            NEUROMAX
          </h1>

          <div className="inline-block bg-indigo-100 border border-indigo-300/80 px-4 py-1 rounded-full text-indigo-900 font-extrabold text-sm sm:text-base tracking-wide uppercase shadow-2xs">
            {isFr ? 'Entraînement Cognitif Personnalisé' : 'Treino Cognitivo Personalizado'}
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-600 tracking-wider uppercase mt-1">
            {isFr ? '✨ Gardez l\'esprit actif et amusez-vous ! ✨' : '✨ Mantenha a mente ativa e divirta-se! ✨'}
          </p>
        </div>

        {/* 2. CENTRAL ILLUSTRATION REPRESENTATION */}
        <div className="bg-gradient-to-b from-indigo-50 to-slate-50 border-2 border-indigo-100 rounded-2xl p-5 mb-6 text-center relative overflow-hidden shadow-inner">
          {/* Floating Cognition Icons */}
          <div className="flex justify-center items-center gap-4 text-indigo-400 text-lg mb-3">
            <i className="fa-solid fa-puzzle-piece text-amber-500"></i>
            <i className="fa-regular fa-clock text-indigo-600"></i>
            <i className="fa-solid fa-bullseye text-rose-500"></i>
            <i className="fa-solid fa-book-open text-emerald-600"></i>
            <i className="fa-solid fa-earth-americas text-sky-600"></i>
            <i className="fa-solid fa-star text-yellow-500"></i>
          </div>

          {/* Central Logo & Cognitive Showcase (Replacing faces banner) */}
          <div className="max-w-md mx-auto bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center mb-2">
              <NeuromaxLogo size={56} className="shadow-md border border-indigo-200" />
            </div>
            <span className="text-xs font-black text-indigo-950 uppercase tracking-wide">
              NeuroMax • {isFr ? 'Stimulation Cognitive' : 'Estimulação Cognitiva'}
            </span>
          </div>

          <p className="text-xs text-slate-600 font-semibold mt-3 italic">
            {isFr
              ? 'Conçu spécialement pour la mémoire, la concentration et la prévention cognitive chez les seniors.'
              : 'Desenvolvido especialmente para memória, concentração e prevenção cognitiva em séniores.'}
          </p>
        </div>

        {/* 3. CORE FEATURES LIST */}
        <div className="space-y-3 mb-6">
          {/* Feature 1 */}
          <div className="flex items-start gap-3.5 p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center text-lg shrink-0 shadow-sm mt-0.5">
              🧠
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight uppercase">
                {isFr ? 'Mémoire & Concentration' : 'Memória & Foco'}
              </h3>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                {isFr
                  ? 'Améliorez votre capacité de mémorisation et d\'attention au quotidien.'
                  : 'Melhore a sua capacidade de memorização e concentração.'}
              </p>
              <div className="text-[11px] font-bold text-rose-700 mt-1">
                {isFr ? '(Paires • Mots • Séquences • Relier • Et plus)' : '(Pares • Palavras • Sequência • Mais)'}
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-3.5 p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shrink-0 shadow-sm mt-0.5">
              🧩
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight uppercase">
                {isFr ? 'Logique & Raisonnement' : 'Lógica & Raciocínio'}
              </h3>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                {isFr
                  ? 'Développez votre pensée stratégique, le calcul mental et la résolution de problèmes.'
                  : 'Desenvolva o seu pensamento estratégico e matemático.'}
              </p>
              <div className="text-[11px] font-bold text-amber-800 mt-1">
                {isFr ? '(Sudoku • Calcul • Solitaire • Uno • Dames)' : '(Sudoku • Matemática • Solitário • Uno • Damas)'}
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-3.5 p-3.5 bg-sky-50/60 border border-sky-200/80 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center text-lg shrink-0 shadow-sm mt-0.5">
              📖
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight uppercase">
                {isFr ? 'Vocabulaire & Culture' : 'Vocabulário & Conhecimento'}
              </h3>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                {isFr
                  ? 'Enrichissez votre maîtrise de la langue, proverbes et culture générale.'
                  : 'Expanda o seu domínio do idioma e cultura geral.'}
              </p>
              <div className="text-[11px] font-bold text-sky-800 mt-1">
                {isFr ? '(Capitales • Proverbes • Mots Fléchés • Contraires)' : '(Capitais • Provérbios • Opostos • Sopa de Letras)'}
              </div>
            </div>
          </div>

          {/* Feature 4 & 5 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm shrink-0 shadow-2xs">
                📊
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase">
                  {isFr ? 'Niveau Adaptatif' : 'Nível Adaptativo'}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  {isFr ? 'Difficulté progressive selon vos succès.' : 'Ajusta-se automaticamente à sua evolução.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm shrink-0 shadow-2xs">
                🏆
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase">
                  {isFr ? 'Suivi & Trophées' : 'Acompanhamento'}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  {isFr ? 'Gagnez de l\'XP et débloquez des étoiles.' : 'Ganhe XP e troféus enquanto treina.'}
                </p>
              </div>
            </div>
          </div>
        </div>



        {/* Action Button: Mandatory Install App (Hidden when printing) */}
        <div className="mb-4 print:hidden">
          <button
            onClick={() => {
              playAudioFeedback('click');
              onOpenInstall();
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer border-2 border-emerald-300"
          >
            <i className="fa-solid fa-download text-xl"></i>
            <span>{isFr ? '📲 Installer l\'application NeuroMax' : '📲 Instalar a aplicação NeuroMax'}</span>
          </button>
        </div>

        {/* 5. BOTTOM RIBBON BANNER */}
        <div className="bg-indigo-950 text-indigo-200 p-2.5 rounded-xl text-center text-[10px] sm:text-xs font-black tracking-wider uppercase border border-indigo-800">
          {isFr
            ? 'FACILE À UTILISER • COMPATIBLE TOUS ÉCRANS • ACCÈS GRATUIT SANS PUBLICITÉ'
            : 'FÁCIL DE USAR • FUNCIONA EM QUALQUER DISPOSITIVO • EXPERIMENTE GRATUITAMENTE!'}
        </div>

      </div>
    </div>
  );
};
