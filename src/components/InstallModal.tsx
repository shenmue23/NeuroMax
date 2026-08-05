import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { playAudioFeedback } from '../lib/audio';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  deferredPrompt: any;
  onTriggerInstall: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  lang,
  deferredPrompt,
  onTriggerInstall,
}) => {
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    // Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setPlatform('ios');
    } else {
      setPlatform('android');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }
  }, []);

  if (!isOpen) return null;

  const isFr = lang === 'fr';

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-xl backdrop-blur-xs">
              <i className="fa-solid fa-[#fa-mobile-screen-button] fa-mobile-screen-button"></i>
            </div>
            <div>
              <h2 className="text-xl font-black leading-tight">
                {isFr ? 'Installer NeuroMax' : 'Instalar NeuroMax'}
              </h2>
              <p className="text-xs text-indigo-100 font-medium mt-0.5">
                {isFr ? 'Jouez sur votre smartphone même Hors Ligne' : 'Jogue no seu smartphone mesmo Offline'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playAudioFeedback('click');
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 hide-scrollbar">

          {/* Standalone status alert if already installed */}
          {isStandalone && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
              <i className="fa-solid fa-circle-check text-2xl text-emerald-600 shrink-0"></i>
              <div className="text-xs font-semibold">
                {isFr
                  ? 'L\'application est déjà installée sur votre appareil ! Vous pouvez y accéder directement depuis votre écran d\'accueil.'
                  : 'O aplicativo já está instalado no seu dispositivo! Você pode acessá-lo diretamente da tela inicial.'}
              </div>
            </div>
          )}

          {/* Platform Toggle Buttons */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                playAudioFeedback('click');
                setPlatform('android');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-sm transition-all ${
                platform === 'android'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-brands fa-android text-emerald-600 text-base"></i>
              <span>Android (Chrome)</span>
            </button>

            <button
              onClick={() => {
                playAudioFeedback('click');
                setPlatform('ios');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-sm transition-all ${
                platform === 'ios'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="fa-brands fa-apple text-slate-900 text-base"></i>
              <span>iPhone / iPad</span>
            </button>
          </div>

          {/* Direct Install Button if supported (Chrome Android / Desktop) */}
          {platform === 'android' && deferredPrompt && (
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-center space-y-3">
              <p className="text-xs font-bold text-indigo-900">
                {isFr
                  ? 'Votre navigateur permet une installation directe en 1 clic :'
                  : 'Seu navegador permite a instalação direta em 1 clique:'}
              </p>
              <button
                onClick={() => {
                  playAudioFeedback('click');
                  onTriggerInstall();
                }}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <i className="fa-solid fa-download"></i>
                <span>{isFr ? 'Installer Maintenant' : 'Instalar Agora'}</span>
              </button>
            </div>
          )}

          {/* Android Instructions */}
          {platform === 'android' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                {isFr ? 'Étapes d\'installation sur Android :' : 'Passos para instalar no Android:'}
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="text-xs text-slate-700 font-medium">
                    {isFr ? (
                      <>Ouvrez le site dans <strong>Google Chrome</strong> sur votre smartphone.</>
                    ) : (
                      <>Abra o site no <strong>Google Chrome</strong> no seu smartphone.</>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="text-xs text-slate-700 font-medium">
                    {isFr ? (
                      <>Appuyez sur les <strong>3 points <i className="fa-solid fa-ellipsis-vertical text-slate-800"></i></strong> en haut à droite de l'écran.</>
                    ) : (
                      <>Toque nos <strong>3 pontos <i className="fa-solid fa-ellipsis-vertical text-slate-800"></i></strong> no canto superior direito.</>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="text-xs text-slate-700 font-medium">
                    {isFr ? (
                      <>Appuyez sur <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong>.</>
                    ) : (
                      <>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* iOS Instructions */}
          {platform === 'ios' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                {isFr ? 'Étapes d\'installation sur iPhone / iPad :' : 'Passos para instalar no iPhone / iPad:'}
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="text-xs text-slate-700 font-medium">
                    {isFr ? (
                      <>Ouvrez impérativement ce site dans l'application <strong>Safari</strong> <i className="fa-regular fa-[#fa-compass] fa-compass text-indigo-600"></i>.</>
                    ) : (
                      <>Abra este site obrigatoriamente no aplicativo <strong>Safari</strong> <i className="fa-regular fa-compass text-indigo-600"></i>.</>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="text-xs text-slate-700 font-medium">
                    {isFr ? (
                      <>Appuyez sur le bouton <strong>Partager</strong> <i className="fa-solid fa-arrow-up-from-bracket text-indigo-600 text-sm mx-1"></i> au bas de l'écran.</>
                    ) : (
                      <>Toque no botão <strong>Compartilhar</strong> <i className="fa-solid fa-arrow-up-from-bracket text-indigo-600 text-sm mx-1"></i> na parte inferior da tela.</>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="text-xs text-slate-700 font-medium">
                    {isFr ? (
                      <>Faites défiler le menu et sélectionnez <strong>"Sur l'écran d'accueil"</strong> <i className="fa-regular fa-square-plus text-slate-800 text-sm mx-1"></i>.</>
                    ) : (
                      <>Role o menu e selecione <strong>"Adicionar à Tela de Início"</strong> <i className="fa-regular fa-square-plus text-slate-800 text-sm mx-1"></i>.</>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div className="text-xs text-slate-700 font-medium">
                    {isFr ? (
                      <>Appuyez sur <strong>"Ajouter"</strong> en haut à droite pour valider.</>
                    ) : (
                      <>Toque em <strong>"Adicionar"</strong> no canto superior direito.</>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advantages Section */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <i className="fa-solid fa-wifi-slash text-amber-600"></i>
              <span>{isFr ? 'Pourquoi installer l\'application ?' : 'Por que instalar o aplicativo?'}</span>
            </h4>
            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside font-medium">
              <li>
                {isFr
                  ? 'Fonctionnement 100% Hors-Ligne (pas besoin de connexion Internet).'
                  : 'Funcionamento 100% Offline (sem necessidade de internet).'}
              </li>
              <li>
                {isFr
                  ? 'Accès rapide depuis l\'écran d\'accueil comme un jeu natif.'
                  : 'Acesso rápido a partir da tela inicial como um jogo nativo.'}
              </li>
              <li>
                {isFr
                  ? 'Plein écran fluide et temps de chargement instantané.'
                  : 'Tela cheia fluida e tempo de carregamento instantâneo.'}
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 flex justify-end shrink-0">
          <button
            onClick={() => {
              playAudioFeedback('click');
              onClose();
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
          >
            {isFr ? 'Fermer' : 'Fechar'}
          </button>
        </div>

      </div>
    </div>
  );
};
