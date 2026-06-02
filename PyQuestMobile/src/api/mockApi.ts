// Мок REST API PyQuest. Полностью повторяет контракт backend (routes/*.js):
//   /api/auth/(register|login|me)
//   /api/public/(courses|lessons|tasks)
//   /api/progress/lessons/:id(/start), /api/progress/tasks/:id/attempt
// Данные берутся из data/*, персистентность — через AsyncStorage.
// Сетевой слой клиента можно потом переключить на реальный сервер без правок UI.

import {
  AttemptResult,
  Course,
  Lesson,
  LessonProgress,
  Task,
  TraceEvent,
  User,
  CodeValidation,
  FillGapValidation,
  MultipleChoiceValidation,
} from '../types';
import { COURSES, LESSONS, TASKS, lessonsByCourse, tasksByLesson, findLesson } from '../data/courses';
import { getTrace } from '../data/traces';
import { FakeTimestamp } from './FakeTimestamp';
import { loadJSON, saveJSON, clearAll } from './storage';

// Имитация сетевой задержки, чтобы UI с загрузками выглядел реалистично.
function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function makeToken(userId: string): string {
  // Похож на JWT по форме (header.payload.signature), но это мок —
  // подписи нет, реальная проверка не выполняется (бэкенд замокан).
  const head = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  const body = encodeBase64(`{"sub":"${userId}"}`);
  return `${head}.${body}.mocksig`;
}

// base64 для ASCII-строки без зависимости от Buffer/atob (RN/Hermes-совместимо).
function encodeBase64(s: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c1 = s.charCodeAt(i++);
    const c2 = s.charCodeAt(i++);
    const c3 = s.charCodeAt(i++);
    const e1 = c1 >> 2;
    const e2 = ((c1 & 3) << 4) | (c2 >> 4);
    let e3 = ((c2 & 15) << 2) | (c3 >> 6);
    let e4 = c3 & 63;
    if (isNaN(c2)) { e3 = 64; e4 = 64; } else if (isNaN(c3)) { e4 = 64; }
    out += chars.charAt(e1) + chars.charAt(e2) +
      (e3 === 64 ? '=' : chars.charAt(e3)) + (e4 === 64 ? '=' : chars.charAt(e4));
  }
  return out;
}

// ---- хранилище пользователей (демо: локально) ----
interface StoredUser extends User {
  password: string;
}

const K_USERS = 'users';
const K_SESSION = 'session_email';
const K_PROGRESS = 'progress'; // { [lessonId]: LessonProgress }
const K_SOLVED = 'solved_task_ids';
const K_STREAK = 'streak'; // { count, lastDate }

// Стрик активности: серия дней подряд с решёнными заданиями.
export async function touchStreak(): Promise<number> {
  const today = new Date();
  const todayStr = today.toDateString();
  const yStr = new Date(today.getTime() - 86400000).toDateString();
  const cur = await loadJSON<{ count: number; lastDate: string }>(K_STREAK, { count: 0, lastDate: '' });
  let next = cur.count;
  if (cur.lastDate === todayStr) next = cur.count || 1;
  else if (cur.lastDate === yStr) next = cur.count + 1;
  else next = 1;
  await saveJSON(K_STREAK, { count: next, lastDate: todayStr });
  return next;
}

export async function getStreak(): Promise<number> {
  const cur = await loadJSON<{ count: number; lastDate: string }>(K_STREAK, { count: 0, lastDate: '' });
  return cur.count;
}

async function getUsers(): Promise<Record<string, StoredUser>> {
  return loadJSON<Record<string, StoredUser>>(K_USERS, {});
}
async function setUsers(users: Record<string, StoredUser>): Promise<void> {
  await saveJSON(K_USERS, users);
}

function publicUser(u: StoredUser): User {
  const { password, ...rest } = u;
  void password;
  return rest;
}

// ===================== AUTH =====================
export async function register(email: string, password: string, displayName: string): Promise<{ token: string; user: User }> {
  const norm = email.trim().toLowerCase();
  const users = await getUsers();
  if (users[norm]) {
    throw new Error('Этот email уже зарегистрирован');
  }
  const user: StoredUser = {
    id: `u_${Object.keys(users).length + 1}_${norm}`,
    email: norm,
    displayName: displayName.trim() || 'Студент',
    totalXp: 0,
    level: 1,
    password,
    settings: { language: 'ru', theme: 'dark' },
  };
  users[norm] = user;
  await setUsers(users);
  await saveJSON(K_SESSION, norm);
  return delay({ token: makeToken(user.id), user: publicUser(user) });
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const norm = email.trim().toLowerCase();
  const users = await getUsers();
  const found = users[norm];
  if (!found || found.password !== password) {
    throw new Error('Неверный email или пароль');
  }
  await saveJSON(K_SESSION, norm);
  return delay({ token: makeToken(found.id), user: publicUser(found) });
}

// Быстрый демо-вход (для защиты ВКР) — гостевой аккаунт.
export async function loginDemo(): Promise<{ token: string; user: User }> {
  const norm = 'demo@pyquest.app';
  const users = await getUsers();
  if (!users[norm]) {
    users[norm] = {
      id: 'u_demo', email: norm, displayName: 'Гость', totalXp: 0, level: 1,
      password: 'demo', settings: { language: 'ru', theme: 'dark' },
    };
    await setUsers(users);
  }
  await saveJSON(K_SESSION, norm);
  return delay({ token: makeToken('u_demo'), user: publicUser(users[norm]) }, 120);
}

export async function getSession(): Promise<User | null> {
  const email = await loadJSON<string | null>(K_SESSION, null);
  if (!email) return null;
  const users = await getUsers();
  return users[email] ? publicUser(users[email]) : null;
}

export async function logout(): Promise<void> {
  await saveJSON(K_SESSION, null);
}

async function patchCurrentUser(patch: Partial<StoredUser>): Promise<User | null> {
  const email = await loadJSON<string | null>(K_SESSION, null);
  if (!email) return null;
  const users = await getUsers();
  if (!users[email]) return null;
  users[email] = { ...users[email], ...patch };
  await setUsers(users);
  return publicUser(users[email]);
}

// ===================== PUBLIC (контент) =====================
export async function getCourses(): Promise<Course[]> {
  return delay([...COURSES]);
}
export async function getLessons(courseId?: string): Promise<Lesson[]> {
  return delay(courseId ? lessonsByCourse(courseId) : [...LESSONS]);
}
export async function getLesson(id: string): Promise<Lesson | null> {
  return delay(findLesson(id) ?? null);
}
export async function getTasks(lessonId: string): Promise<Task[]> {
  return delay(tasksByLesson(lessonId));
}

// ===================== PROGRESS =====================
export async function getAllProgress(): Promise<Record<string, LessonProgress>> {
  return loadJSON<Record<string, LessonProgress>>(K_PROGRESS, {});
}
export async function getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
  const all = await getAllProgress();
  return all[lessonId] ?? null;
}

export async function startLesson(lessonId: string): Promise<LessonProgress> {
  const all = await getAllProgress();
  const existing = all[lessonId];
  if (existing && existing.status !== 'not_started') return delay(existing, 120);
  const prog: LessonProgress = {
    id: `lp_${lessonId}`,
    user_id: 'current',
    lesson_id: lessonId,
    status: 'in_progress',
    started_at: FakeTimestamp.now().toJSON() as any,
    completed_at: null,
    current_task_index: 0,
    completed_task_ids: [],
    xp_earned: 0,
    updated_at: FakeTimestamp.now().toJSON() as any,
  };
  all[lessonId] = prog;
  await saveJSON(K_PROGRESS, all);
  return delay(prog, 120);
}

async function getSolvedSet(): Promise<string[]> {
  return loadJSON<string[]>(K_SOLVED, []);
}

// Лёгкая проверка кода (без реальной песочницы): убеждаемся, что объявлены
// нужные идентификаторы из tests_code и присутствует return / self.
function checkCode(code: string, v: CodeValidation): boolean {
  const src = (code || '').trim();
  if (src.length < 5) return false;

  // имена, которые тестируются (то, что вызывается со скобкой в tests_code)
  const called = new Set<string>();
  const re = /([A-Za-z_]\w*)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(v.tests_code)) !== null) {
    if (!['assert', 'print', 'len', 'range', 'set', 'int', 'str', 'float'].includes(m[1])) {
      called.add(m[1]);
    }
  }
  // объект.метод(): добавим имена методов
  const methodRe = /\.\s*([A-Za-z_]\w*)\s*\(/g;
  while ((m = methodRe.exec(v.tests_code)) !== null) called.add(m[1]);

  const definesFn = (name: string) =>
    new RegExp(`def\\s+${name}\\b`).test(src);
  const definesClass = (name: string) =>
    new RegExp(`class\\s+${name}\\b`).test(src);

  let defined = 0;
  called.forEach((name) => {
    const isClass = /^[A-Z]/.test(name);
    if (isClass ? definesClass(name) : (definesFn(name) || definesFn(name))) defined++;
    else if (!isClass && definesFn(name)) defined++;
  });

  // классовые задания: достаточно объявить class + методы через def
  const hasDef = /def\s+\w+/.test(src);
  const hasReturnOrSelf = /\breturn\b/.test(src) || /self\./.test(src) || /class\s+\w+/.test(src);

  // нужно объявить хотя бы один из тестируемых идентификаторов
  return defined > 0 && hasDef && hasReturnOrSelf;
}

export async function attemptTask(
  taskId: string,
  body: { answer?: number | string; code?: string; step_through?: boolean },
): Promise<AttemptResult> {
  const task = TASKS.find((t) => t.id === taskId);
  if (!task) throw new Error('Задание не найдено');

  let isCorrect = false;
  let output: AttemptResult['output'] = null;
  let trace: TraceEvent[] | null = null;

  if (task.task_type === 'multiple_choice') {
    const v = task.validation as MultipleChoiceValidation;
    isCorrect = typeof body.answer === 'number' && body.answer === v.correctAnswerIndex;
  } else if (task.task_type === 'fill_gap') {
    const v = task.validation as FillGapValidation;
    const given = typeof body.answer === 'string' ? body.answer : '';
    if (v.caseSensitive) isCorrect = given.trim() === v.expected.trim();
    else isCorrect = given.trim().toLowerCase() === v.expected.trim().toLowerCase();
  } else {
    // write_code / debug_code
    const v = task.validation as CodeValidation;
    isCorrect = checkCode(body.code || '', v);
    const bundle = getTrace(v.traceId);
    if (isCorrect && bundle) {
      trace = body.step_through ? bundle.steps : null;
      const lastStdout = [...bundle.steps].reverse().find((s) => s.stdout)?.stdout || '';
      output = { stdout: lastStdout, stderr: '', success: true };
    } else if (!isCorrect) {
      output = {
        stdout: '',
        stderr: 'Тесты не пройдены. Проверьте имя функции, return и логику.',
        success: false,
      };
    }
  }

  const xpEarned = isCorrect ? task.xp_reward : 0;

  // Обновляем прогресс урока и XP пользователя при успехе
  if (isCorrect) {
    const all = await getAllProgress();
    const prog = all[task.lesson_id] ?? (await startLesson(task.lesson_id));
    const completed = new Set(prog.completed_task_ids);
    const firstTime = !completed.has(taskId);
    completed.add(taskId);

    const totalTasks = tasksByLesson(task.lesson_id).length;
    const status = completed.size >= totalTasks ? 'completed' : 'in_progress';

    const updated: LessonProgress = {
      ...prog,
      status,
      current_task_index: Math.min(prog.current_task_index + (firstTime ? 1 : 0), totalTasks),
      completed_task_ids: Array.from(completed),
      xp_earned: prog.xp_earned + (firstTime ? xpEarned : 0),
      completed_at: status === 'completed' ? (FakeTimestamp.now().toJSON() as any) : prog.completed_at,
      updated_at: FakeTimestamp.now().toJSON() as any,
    };
    all[task.lesson_id] = updated;
    await saveJSON(K_PROGRESS, all);

    if (firstTime) {
      // глобальный набор решённых заданий (для статистики/достижений)
      const solved = new Set(await getSolvedSet());
      solved.add(taskId);
      await saveJSON(K_SOLVED, Array.from(solved));
      await touchStreak();

      const session = await getSession();
      if (session) {
        const newXp = session.totalXp + xpEarned;
        await patchCurrentUser({ totalXp: newXp, level: Math.floor(newXp / 500) + 1 });
      }
    }
  }

  return delay({ ok: isCorrect, xpEarned, output, trace }, 260);
}

// ===================== СТАТИСТИКА =====================
export interface UserStats {
  totalXp: number;
  level: number;
  lessonsCompleted: number;
  tasksSolved: number;
  coursesStarted: number;
  streak: number;
}

export async function getStats(): Promise<UserStats> {
  const user = await getSession();
  const all = await getAllProgress();
  const solved = await getSolvedSet();
  const streak = await getStreak();
  const lessonsCompleted = Object.values(all).filter((p) => p.status === 'completed').length;
  const startedCourseIds = new Set(
    Object.keys(all)
      .map((lid) => findLesson(lid)?.course_id)
      .filter(Boolean) as string[],
  );
  return {
    totalXp: user?.totalXp ?? 0,
    level: user?.level ?? 1,
    lessonsCompleted,
    tasksSolved: solved.length,
    coursesStarted: startedCourseIds.size,
    streak,
  };
}

export async function resetProgress(): Promise<void> {
  await clearAll();
}
