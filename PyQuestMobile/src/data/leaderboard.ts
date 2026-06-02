import { LeaderboardEntry } from '../types';

// Фейковые пользователи для рейтинга (имитация GET /api/leaderboard).
// Текущий пользователь вставляется в список динамически по его XP.
const FAKE_USERS: { displayName: string; totalXp: number }[] = [
  { displayName: 'Лилия Л.', totalXp: 4120 },
  { displayName: 'Шамиль В.', totalXp: 3580 },
  { displayName: 'Айбулат Н.', totalXp: 3010 },
  { displayName: 'Аббас А.', totalXp: 2470 },
  { displayName: 'Иван Л.', totalXp: 1990 },
  { displayName: 'Екатерина Ж.', totalXp: 1640 },
  { displayName: 'Никита Р.', totalXp: 1280 },
  { displayName: 'Алина Г.', totalXp: 960 },
  { displayName: 'Павел Т.', totalXp: 720 },
  { displayName: 'София М.', totalXp: 540 },
  { displayName: 'Роман Д.', totalXp: 330 },
  { displayName: 'Виктория Н.', totalXp: 180 },
];

import { levelFromXp } from '../theme/theme';

export function buildLeaderboard(current: { displayName: string; totalXp: number }): LeaderboardEntry[] {
  const all = [
    ...FAKE_USERS.map((u) => ({ ...u, isCurrentUser: false })),
    { displayName: current.displayName, totalXp: current.totalXp, isCurrentUser: true },
  ];
  all.sort((a, b) => b.totalXp - a.totalXp);
  return all.map((u, i) => ({
    rank: i + 1,
    displayName: u.displayName,
    totalXp: u.totalXp,
    level: levelFromXp(u.totalXp),
    isCurrentUser: u.isCurrentUser,
  }));
}
