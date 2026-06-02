// Доменные типы PyQuest. Повторяют структуру таблиц backend (schema.sql)
// и JSON-контракт REST API, чтобы мобильный клиент был совместим с «настоящим»
// бэкендом без изменений сетевого слоя.

export type TaskType = 'multiple_choice' | 'fill_gap' | 'write_code' | 'debug_code';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface User {
  id: string;
  email: string;
  displayName: string;
  totalXp: number;
  level: number;
  settings?: Record<string, unknown>;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  difficulty: Difficulty;
  xp_reward: number;
  // удобные для UI агрегаты (вычисляются на клиенте)
  emoji?: string;
  accent?: string;
}

export interface LessonContent {
  description: string;
  shortDescription?: string;
  difficulty?: Difficulty;
  estimatedTime?: number;
  xpReward?: number;
  tags?: string[];
  // теоретический блок: массив абзацев/код-сниппетов
  theory?: TheoryBlock[];
}

export interface TheoryBlock {
  type: 'text' | 'code' | 'note';
  value: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  order_index: number;
  title: string;
  content: LessonContent;
  image_url: string | null;
}

// Validation повторяет jsonb-поле tasks.validation из backend
export interface MultipleChoiceValidation {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}
export interface FillGapValidation {
  expected: string;
  caseSensitive?: boolean;
  // шаблон кода с маркером ___ для отображения пропуска
  template?: string;
}
export interface CodeValidation {
  tests_code: string;
  starterCode?: string;
  // id заранее посчитанного trace в data/traces.ts (визуализация исполнения)
  traceId?: string;
}

export type Validation =
  | MultipleChoiceValidation
  | FillGapValidation
  | CodeValidation;

export interface Task {
  id: string;
  lesson_id: string;
  order_index: number;
  task_type: TaskType;
  title: string;
  prompt: string;
  hint: string | null;
  xp_reward: number;
  validation: Validation;
}

// Результат POST /api/progress/tasks/:taskId/attempt
export interface AttemptResult {
  ok: boolean;
  xpEarned: number;
  output: { stdout: string; stderr: string; success: boolean } | null;
  trace: TraceEvent[] | null;
}

// Формат события трассировки — точно как в PyQuestSandbox (app.py)
export interface TraceEvent {
  lineno: number;
  function: string;
  stack?: string[];
  locals: Record<string, string>;
  // дополнительно для наглядной визуализации (не ломает совместимость)
  stdout?: string;
  note?: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: ProgressStatus;
  started_at: string | null;
  completed_at: string | null;
  current_task_index: number;
  completed_task_ids: string[];
  xp_earned: number;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  xp_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  // условие разблокировки (вычисляется на клиенте)
  condition: { type: 'xp' | 'lessons' | 'tasks' | 'streak' | 'course'; value: number };
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalXp: number;
  level: number;
  isCurrentUser?: boolean;
}
