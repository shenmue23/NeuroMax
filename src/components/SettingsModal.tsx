import React from 'react';
import { Language, UserProgressData } from '../types';
import { playAudioFeedback } from '../lib/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  progress: UserProgressData;
  onImportProgress: (data: UserProgressData) => void;
  onOpenInstall?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  progress,
  onImportProgress,
  onOpenInstall
}) => {
  if (!isOpen) return null;

  const handleExport = () => {
    playAudioFeedback('click');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(progress));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'neuromax_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onClose();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && imported.games) {
          playAudioFeedback('victory');
          onImportProgress(imported);
          alert(lang === 'fr' ? 'Progression restaurée avec succès !' : 'Progresso restaurado com sucesso!');
          onClose();
        }
      } catch (err) {
        alert(lang === 'fr' ? 'Fichier invalide.' : 'Ficheiro inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border-4 border-slate-900">
        <div className="text-center mb-6">
          <div className="text-4xl text-indigo-600 mb-2">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-800">
            {lang === 'fr' ? 'Sauvegarde' : 'Segurança'}
          </h3>
          <p className="text-sm text-slate-600 font-medium mt-1">
            {lang === 'fr'
              ? 'Conservez et restaurez vos progrès.'
              : 'Proteja e restaure o seu progresso.'}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {onOpenInstall && (
            <button
              onClick={() => {
                playAudioFeedback('click');
                onClose();
                onOpenInstall();
              }}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <i className="fa-solid fa-mobile-screen-button"></i>
              {lang === 'fr' ? 'Installer sur Mobile / Tablette' : 'Instalar no Celular / Tablet'}
            </button>
          )}

          <button
            onClick={handleExport}
            className="w-full bg-indigo-100 text-indigo-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-200 transition-colors"
          >
            <i className="fa-solid fa-download"></i>
            {lang === 'fr' ? 'Télécharger la sauvegarde' : 'Guardar Progresso'}
          </button>

          <label className="w-full bg-amber-100 text-amber-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-200 transition-colors">
            <i className="fa-solid fa-upload"></i>
            {lang === 'fr' ? 'Restaurer une sauvegarde' : 'Restaurar Progresso'}
            <input
              type="file"
              className="hidden"
              accept=".json"
              onChange={handleImport}
            />
          </label>
        </div>

        <button
          onClick={() => {
            playAudioFeedback('click');
            onClose();
          }}
          className="w-full mt-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
        >
          {lang === 'fr' ? 'Fermer' : 'Fechar'}
        </button>
      </div>
    </div>
  );
};
