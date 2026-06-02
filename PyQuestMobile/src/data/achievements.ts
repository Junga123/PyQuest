import { Achievement } from '../types';

// Достижения. condition вычисляется на клиенте по прогрессу пользователя.
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Первые шаги', description: 'Решите первое задание', icon: '👶', xp_reward: 20, rarity: 'common', condition: { type: 'tasks', value: 1 } },
  { id: 'a2', title: 'Ученик', description: 'Наберите 200 XP', icon: '📘', xp_reward: 30, rarity: 'common', condition: { type: 'xp', value: 200 } },
  { id: 'a3', title: 'Знаток циклов', description: 'Пройдите 5 уроков', icon: '🔁', xp_reward: 50, rarity: 'rare', condition: { type: 'lessons', value: 5 } },
  { id: 'a4', title: 'Кодер', description: 'Решите 10 заданий', icon: '⌨️', xp_reward: 60, rarity: 'rare', condition: { type: 'tasks', value: 10 } },
  { id: 'a5', title: 'Уровень 3', description: 'Достигните 3 уровня (1000 XP)', icon: '⭐', xp_reward: 80, rarity: 'epic', condition: { type: 'xp', value: 1000 } },
  { id: 'a6', title: 'Питонист', description: 'Решите 25 заданий', icon: '🐍', xp_reward: 120, rarity: 'epic', condition: { type: 'tasks', value: 25 } },
  { id: 'a7', title: 'Марафонец', description: 'Пройдите 12 уроков', icon: '🏃', xp_reward: 150, rarity: 'epic', condition: { type: 'lessons', value: 12 } },
  { id: 'a8', title: 'Мастер Python', description: 'Наберите 3000 XP', icon: '👑', xp_reward: 300, rarity: 'legendary', condition: { type: 'xp', value: 3000 } },
];

export interface AchievementState extends Achievement {
  unlocked: boolean;
  progress: number; // 0..1
}

// Считает, какие достижения разблокированы по текущей статистике.
export function evaluateAchievements(stats: {
  totalXp: number;
  lessonsCompleted: number;
  tasksSolved: number;
}): AchievementState[] {
  return ACHIEVEMENTS.map((a) => {
    let current = 0;
    if (a.condition.type === 'xp') current = stats.totalXp;
    else if (a.condition.type === 'lessons') current = stats.lessonsCompleted;
    else if (a.condition.type === 'tasks') current = stats.tasksSolved;
    const progress = Math.max(0, Math.min(1, current / a.condition.value));
    return { ...a, unlocked: current >= a.condition.value, progress };
  });
}
