// Единая тема оформления PyQuest. Палитра построена вокруг фирменных цветов
// Python: синий #3776AB и жёлтый #FFD43B, на тёмном фоне «редактора кода».

export const colors = {
  bg: '#0F1729',
  bgElevated: '#16213E',
  card: '#1B2540',
  cardAlt: '#222F52',
  border: '#2A3A63',

  primary: '#3776AB', // python blue
  primaryLight: '#4B8BC4',
  accent: '#FFD43B', // python yellow
  accentDark: '#E0B200',

  success: '#3DD68C',
  successBg: '#13352A',
  danger: '#FF6B6B',
  dangerBg: '#3A1D24',
  warning: '#FFB454',

  text: '#EAF0FB',
  textMuted: '#9AACCB',
  textDim: '#6B7DA3',

  // подсветка синтаксиса (используется и в WebView-визуализаторе)
  synKeyword: '#FF7AB2',
  synString: '#9EE493',
  synNumber: '#FFD43B',
  synComment: '#6B7DA3',
  synFunc: '#7FB3FF',
  synBuiltin: '#C792EA',

  highlightLine: 'rgba(255,212,59,0.18)',
};

export const rarityColors: Record<string, string> = {
  common: '#9AACCB',
  rare: '#4B8BC4',
  epic: '#C792EA',
  legendary: '#FFD43B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const font = {
  mono: 'monospace',
};

// Сколько XP нужно для уровня. Простая прогрессия: 1 уровень = 500 XP.
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
