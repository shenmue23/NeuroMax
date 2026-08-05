export type Language = 'fr' | 'pt';

export type Category = 'all' | 'memory' | 'attention' | 'logic' | 'language' | 'history';

export interface GameData {
  id: string;
  cat: Category;
  icon: string;
  color: string;
  engine: string;
  params?: any;
}

export interface GameProgress {
  level: number;
  stars: number;
}

export interface UserProgressData {
  games: Record<string, GameProgress>;
  xp: number;
}

export interface LevelInfo {
  lvl: number;
  icon: string;
  name: Record<Language, string>;
  min: number;
  max: number;
}

export interface PersonCharacter {
  face: string;
  name: string;
  gender: 'female' | 'male';
}

export type UnoColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type UnoValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | '+2' | 'wild' | '+4';

export interface UnoCard {
  color: UnoColor;
  value: UnoValue;
  id?: string;
}

export type MarbleTheme = 'amber' | 'ruby' | 'emerald' | 'sapphire';
