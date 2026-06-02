// Темы оформления PyQuest. Две палитры (тёмная/светлая) вокруг фирменных цветов
// Python: синий #3776AB и жёлтый #FFD43B.
// Поверхности кода (редактор/визуализатор) остаются тёмными в обеих темах —
// это привычно для разработчиков и не требует перенастройки подсветки синтаксиса.

export interface Palette {
  bg: string;
  bgElevated: string;
  card: string;
  cardAlt: string;
  border: string;

  primary: string;
  primaryLight: string;
  accent: string;
  accentText: string; // цвет текста на жёлтой кнопке
  accentDark: string;

  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  warning: string;

  text: string;
  textMuted: string;
  textDim: string;

  // glassmorphism: полупрозрачные «стеклянные» поверхности + блик
  glass: string;
  glassStrong: string;
  glassBorder: string;
  glassHi: string;

  // code-поверхности (всегда тёмные)
  codeBg: string;
  codeBgAlt: string;

  // подсветка синтаксиса (на тёмном фоне)
  synKeyword: string;
  synString: string;
  synNumber: string;
  synComment: string;
  synFunc: string;
  synBuiltin: string;

  highlightLine: string;
}

const syntax = {
  codeBg: '#0A1120',
  codeBgAlt: '#0F1A30',
  synKeyword: '#FF7AB2',
  synString: '#9EE493',
  synNumber: '#FFD43B',
  synComment: '#6B7DA3',
  synFunc: '#7FB3FF',
  synBuiltin: '#C792EA',
  highlightLine: 'rgba(255,212,59,0.18)',
};

export const darkColors: Palette = {
  bg: '#0F1729',
  bgElevated: '#16213E',
  card: '#1B2540',
  cardAlt: '#222F52',
  border: '#2A3A63',

  primary: '#3776AB',
  primaryLight: '#4B8BC4',
  accent: '#FFD43B',
  accentText: '#1A1300',
  accentDark: '#E0B200',

  success: '#3DD68C',
  successBg: '#13352A',
  danger: '#FF6B6B',
  dangerBg: '#3A1D24',
  warning: '#FFB454',

  text: '#EAF0FB',
  textMuted: '#9AACCB',
  textDim: '#6B7DA3',

  glass: 'rgba(31,42,71,0.55)',
  glassStrong: 'rgba(13,19,37,0.82)',
  glassBorder: 'rgba(255,255,255,0.18)',
  glassHi: 'rgba(255,255,255,0.40)',

  ...syntax,
};

export const lightColors: Palette = {
  bg: '#F2F5FB',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#EAEFF8',
  border: '#D8E0EE',

  primary: '#2F6CA0',
  primaryLight: '#2C6291',
  accent: '#F2B705',
  accentText: '#1A1300',
  accentDark: '#C99400',

  success: '#1E9E63',
  successBg: '#DDF4E8',
  danger: '#D6453F',
  dangerBg: '#FBE3E2',
  warning: '#C77A1C',

  text: '#142036',
  textMuted: '#566179',
  textDim: '#8A97AD',

  glass: 'rgba(255,255,255,0.66)',
  glassStrong: 'rgba(255,255,255,0.85)',
  glassBorder: 'rgba(255,255,255,0.9)',
  glassHi: 'rgba(255,255,255,1)',

  ...syntax,
};

export type ThemeMode = 'dark' | 'light';

// Back-compat: статическая палитра по умолчанию (тёмная).
export const colors = darkColors;

export const rarityColors: Record<string, string> = {
  common: '#8A97AD',
  rare: '#4B8BC4',
  epic: '#C792EA',
  legendary: '#E0B200',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24 };
export const font = { mono: 'monospace' };

// Прогрессия: 1 уровень = 500 XP.
export const XP_PER_LEVEL = 500;
export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}
export function xpIntoLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}
export function xpForNextLevel(): number {
  return XP_PER_LEVEL;
}
