import { UserProgressData, LevelInfo, GameProgress } from '../types';
import { playAudioFeedback } from './audio';

const STORAGE_KEY = 'neuromax_progress_v3';

export const SaveSystem = {
  load(): UserProgressData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            games: parsed.games || {},
            xp: typeof parsed.xp === 'number' ? parsed.xp : 0
          };
        }
      }
    } catch (e) {
      console.error('Failed to load progress', e);
    }
    return { games: {}, xp: 0 };
  },

  save(data: UserProgressData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  },

  getGameProgress(data: UserProgressData, id: string): GameProgress {
    if (!data.games[id]) {
      data.games[id] = { level: 1, stars: 0 };
      this.save(data);
    }
    return data.games[id];
  },

  addWin(data: UserProgressData, id: string): { data: UserProgressData; stars: number; leveledUp: boolean; level: number } {
    if (!data.games[id]) {
      data.games[id] = { level: 1, stars: 0 };
    }
    const g = data.games[id];
    let leveledUp = false;

    if (g.level < 20) {
      g.stars++;
      if (g.stars >= 5) {
        g.level++;
        g.stars = 0;
        leveledUp = true;
      }
    } else {
      g.stars = 5;
    }

    const oldLvlInfo = this.getLevel(data.xp || 0);
    data.xp = (data.xp || 0) + 50;
    const newLvlInfo = this.getLevel(data.xp);

    if (newLvlInfo.lvl > oldLvlInfo.lvl) {
      playAudioFeedback('levelup');
    }

    this.save(data);
    return { data, stars: g.stars, leveledUp, level: g.level };
  },

  getLevel(xp: number): LevelInfo {
    if (xp < 200) return { lvl: 1, icon: '🥉', name: { fr: 'Novice', pt: 'Iniciante' }, min: 0, max: 200 };
    if (xp < 500) return { lvl: 2, icon: '🥈', name: { fr: 'Explorateur', pt: 'Explorador' }, min: 200, max: 500 };
    if (xp < 1000) return { lvl: 3, icon: '🥇', name: { fr: 'Expert', pt: 'Especialista' }, min: 500, max: 1000 };
    if (xp < 2000) return { lvl: 4, icon: '🏆', name: { fr: 'Maître', pt: 'Mestre' }, min: 1000, max: 2000 };
    return { lvl: 5, icon: '👑', name: { fr: 'Génie', pt: 'Génio' }, min: 2000, max: 2000 };
  }
};
