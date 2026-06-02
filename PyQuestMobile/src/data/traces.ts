// Заранее посчитанные трассировки исполнения для экрана визуализации.
// Формат step повторяет события из PyQuestSandbox (app.py): lineno, locals и т.д.
// Для наглядности добавлены поля stdout (накопленный вывод) и note (пояснение шага).
//
// code — исходник «эталонного» решения (по нему идёт подсветка строк).
// steps[i].lineno — 1-я строка кода = 1.

import { TraceEvent } from '../types';

export interface TraceBundle {
  title: string;
  code: string;
  steps: TraceEvent[];
}

export const TRACES: Record<string, TraceBundle> = {
  square: {
    title: 'square(4)',
    code: 'def square(n):\n    return n * n\n\nprint(square(4))',
    steps: [
      { lineno: 4, function: '<module>', locals: {}, note: 'Вызываем square(4)' },
      { lineno: 1, function: 'square', locals: { n: '4' }, note: 'Аргумент n = 4' },
      { lineno: 2, function: 'square', locals: { n: '4' }, note: 'Вычисляем 4 * 4 = 16 и возвращаем' },
      { lineno: 4, function: '<module>', locals: {}, stdout: '16', note: 'print выводит 16' },
    ],
  },

  greet: {
    title: 'greet("Аня")',
    code: 'def greet(name):\n    return f"Привет, {name}!"\n\nprint(greet("Аня"))',
    steps: [
      { lineno: 4, function: '<module>', locals: {}, note: 'Вызываем greet("Аня")' },
      { lineno: 1, function: 'greet', locals: { name: "'Аня'" }, note: 'name = "Аня"' },
      { lineno: 2, function: 'greet', locals: { name: "'Аня'" }, note: 'Подставляем имя в f-строку' },
      { lineno: 4, function: '<module>', locals: {}, stdout: 'Привет, Аня!', note: 'Результат напечатан' },
    ],
  },

  average: {
    title: 'average(2, 4) — после починки',
    code: 'def average(a, b):\n    return (a + b) / 2\n\nprint(average(2, 4))',
    steps: [
      { lineno: 4, function: '<module>', locals: {}, note: 'Вызов average(2, 4)' },
      { lineno: 1, function: 'average', locals: { a: '2', b: '4' }, note: 'a = 2, b = 4' },
      { lineno: 2, function: 'average', locals: { a: '2', b: '4' }, note: '(2 + 4) / 2 = 3.0 — скобки важны!' },
      { lineno: 4, function: '<module>', locals: {}, stdout: '3.0', note: 'Без скобок было бы 2 + 4/2 = 4.0' },
    ],
  },

  is_even: {
    title: 'is_even(7)',
    code: 'def is_even(n):\n    return n % 2 == 0\n\nprint(is_even(7))',
    steps: [
      { lineno: 4, function: '<module>', locals: {}, note: 'Вызов is_even(7)' },
      { lineno: 1, function: 'is_even', locals: { n: '7' }, note: 'n = 7' },
      { lineno: 2, function: 'is_even', locals: { n: '7' }, note: '7 % 2 = 1, значит 1 == 0 → False' },
      { lineno: 4, function: '<module>', locals: {}, stdout: 'False', note: '7 — нечётное' },
    ],
  },

  sum_to: {
    title: 'sum_to(5)',
    code: 'def sum_to(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total\n\nprint(sum_to(5))',
    steps: [
      { lineno: 2, function: 'sum_to', locals: { n: '5' }, note: 'Заводим аккумулятор total = 0' },
      { lineno: 3, function: 'sum_to', locals: { n: '5', total: '0' }, note: 'i = 1' },
      { lineno: 4, function: 'sum_to', locals: { n: '5', total: '0', i: '1' }, note: 'total += 1' },
      { lineno: 3, function: 'sum_to', locals: { n: '5', total: '1', i: '1' }, note: 'i = 2' },
      { lineno: 4, function: 'sum_to', locals: { n: '5', total: '1', i: '2' }, note: 'total += 2' },
      { lineno: 3, function: 'sum_to', locals: { n: '5', total: '3', i: '2' }, note: 'i = 3' },
      { lineno: 4, function: 'sum_to', locals: { n: '5', total: '3', i: '3' }, note: 'total += 3' },
      { lineno: 3, function: 'sum_to', locals: { n: '5', total: '6', i: '3' }, note: 'i = 4' },
      { lineno: 4, function: 'sum_to', locals: { n: '5', total: '6', i: '4' }, note: 'total += 4' },
      { lineno: 3, function: 'sum_to', locals: { n: '5', total: '10', i: '4' }, note: 'i = 5' },
      { lineno: 4, function: 'sum_to', locals: { n: '5', total: '10', i: '5' }, note: 'total += 5' },
      { lineno: 5, function: 'sum_to', locals: { n: '5', total: '15', i: '5' }, note: 'Цикл окончен, возвращаем 15' },
      { lineno: 7, function: '<module>', locals: {}, stdout: '15', note: '1+2+3+4+5 = 15' },
    ],
  },

  factorial: {
    title: 'factorial(4)',
    code: 'def factorial(n):\n    result = 1\n    for i in range(1, n + 1):\n        result *= i\n    return result\n\nprint(factorial(4))',
    steps: [
      { lineno: 2, function: 'factorial', locals: { n: '4' }, note: 'result = 1' },
      { lineno: 4, function: 'factorial', locals: { n: '4', result: '1', i: '1' }, note: 'result *= 1 → 1' },
      { lineno: 4, function: 'factorial', locals: { n: '4', result: '1', i: '2' }, note: 'result *= 2 → 2' },
      { lineno: 4, function: 'factorial', locals: { n: '4', result: '2', i: '3' }, note: 'result *= 3 → 6' },
      { lineno: 4, function: 'factorial', locals: { n: '4', result: '6', i: '4' }, note: 'result *= 4 → 24' },
      { lineno: 5, function: 'factorial', locals: { n: '4', result: '24', i: '4' }, note: 'Возвращаем 24' },
      { lineno: 7, function: '<module>', locals: {}, stdout: '24', note: '4! = 24' },
    ],
  },

  countdown: {
    title: 'countdown(3)',
    code: 'def countdown(n):\n    result = []\n    while n > 0:\n        result.append(n)\n        n -= 1\n    return result\n\nprint(countdown(3))',
    steps: [
      { lineno: 2, function: 'countdown', locals: { n: '3' }, note: 'Пустой список result' },
      { lineno: 3, function: 'countdown', locals: { n: '3', result: '[]' }, note: '3 > 0 → входим' },
      { lineno: 4, function: 'countdown', locals: { n: '3', result: '[3]' }, note: 'Добавили 3' },
      { lineno: 5, function: 'countdown', locals: { n: '2', result: '[3]' }, note: 'n стало 2' },
      { lineno: 4, function: 'countdown', locals: { n: '2', result: '[3, 2]' }, note: 'Добавили 2' },
      { lineno: 5, function: 'countdown', locals: { n: '1', result: '[3, 2]' }, note: 'n стало 1' },
      { lineno: 4, function: 'countdown', locals: { n: '1', result: '[3, 2, 1]' }, note: 'Добавили 1' },
      { lineno: 5, function: 'countdown', locals: { n: '0', result: '[3, 2, 1]' }, note: 'n стало 0' },
      { lineno: 6, function: 'countdown', locals: { n: '0', result: '[3, 2, 1]' }, note: '0 > 0 ложно → выходим, возвращаем' },
      { lineno: 8, function: '<module>', locals: {}, stdout: '[3, 2, 1]', note: 'Готово' },
    ],
  },

  area: {
    title: 'area(2, 3)',
    code: 'def area(w, h):\n    return w * h\n\nprint(area(2, 3))',
    steps: [
      { lineno: 4, function: '<module>', locals: {}, note: 'Вызов area(2, 3)' },
      { lineno: 1, function: 'area', locals: { w: '2', h: '3' }, note: 'w = 2, h = 3' },
      { lineno: 2, function: 'area', locals: { w: '2', h: '3' }, note: '2 * 3 = 6' },
      { lineno: 4, function: '<module>', locals: {}, stdout: '6', note: 'Площадь = 6' },
    ],
  },

  my_max: {
    title: 'my_max(2, 5)',
    code: 'def my_max(a, b):\n    if a > b:\n        return a\n    return b\n\nprint(my_max(2, 5))',
    steps: [
      { lineno: 1, function: 'my_max', locals: { a: '2', b: '5' }, note: 'a = 2, b = 5' },
      { lineno: 2, function: 'my_max', locals: { a: '2', b: '5' }, note: '2 > 5 ложно → пропускаем return a' },
      { lineno: 4, function: 'my_max', locals: { a: '2', b: '5' }, note: 'Возвращаем b = 5' },
      { lineno: 6, function: '<module>', locals: {}, stdout: '5', note: 'Большее число — 5' },
    ],
  },

  double: {
    title: 'double(4) — после починки',
    code: 'def double(x):\n    result = x * 2\n    return result\n\nprint(double(4))',
    steps: [
      { lineno: 1, function: 'double', locals: { x: '4' }, note: 'x = 4' },
      { lineno: 2, function: 'double', locals: { x: '4', result: '8' }, note: 'result = 8' },
      { lineno: 3, function: 'double', locals: { x: '4', result: '8' }, note: 'Без этой строки было бы None!' },
      { lineno: 5, function: '<module>', locals: {}, stdout: '8', note: 'Теперь возвращается 8' },
    ],
  },

  list_sum: {
    title: 'list_sum([1, 2, 3])',
    code: 'def list_sum(nums):\n    total = 0\n    for x in nums:\n        total += x\n    return total\n\nprint(list_sum([1, 2, 3]))',
    steps: [
      { lineno: 2, function: 'list_sum', locals: { nums: '[1, 2, 3]' }, note: 'total = 0' },
      { lineno: 4, function: 'list_sum', locals: { nums: '[1, 2, 3]', total: '0', x: '1' }, note: 'total += 1' },
      { lineno: 4, function: 'list_sum', locals: { nums: '[1, 2, 3]', total: '1', x: '2' }, note: 'total += 2' },
      { lineno: 4, function: 'list_sum', locals: { nums: '[1, 2, 3]', total: '3', x: '3' }, note: 'total += 3' },
      { lineno: 5, function: 'list_sum', locals: { nums: '[1, 2, 3]', total: '6', x: '3' }, note: 'Возвращаем 6' },
      { lineno: 7, function: '<module>', locals: {}, stdout: '6', note: 'Сумма = 6' },
    ],
  },

  count_chars: {
    title: 'count_chars("aab")',
    code: 'def count_chars(s):\n    result = {}\n    for ch in s:\n        result[ch] = result.get(ch, 0) + 1\n    return result\n\nprint(count_chars("aab"))',
    steps: [
      { lineno: 2, function: 'count_chars', locals: { s: "'aab'" }, note: 'Пустой словарь' },
      { lineno: 4, function: 'count_chars', locals: { s: "'aab'", ch: "'a'", result: "{'a': 1}" }, note: "'a' встречен 1 раз" },
      { lineno: 4, function: 'count_chars', locals: { s: "'aab'", ch: "'a'", result: "{'a': 2}" }, note: "'a' уже 2" },
      { lineno: 4, function: 'count_chars', locals: { s: "'aab'", ch: "'b'", result: "{'a': 2, 'b': 1}" }, note: "'b' встречен" },
      { lineno: 5, function: 'count_chars', locals: { result: "{'a': 2, 'b': 1}" }, note: 'Возвращаем словарь' },
      { lineno: 7, function: '<module>', locals: {}, stdout: "{'a': 2, 'b': 1}", note: 'Частоты символов' },
    ],
  },

  count_unique: {
    title: 'count_unique([1, 1, 2, 3])',
    code: 'def count_unique(nums):\n    return len(set(nums))\n\nprint(count_unique([1, 1, 2, 3]))',
    steps: [
      { lineno: 1, function: 'count_unique', locals: { nums: '[1, 1, 2, 3]' }, note: 'Вход — список с дубликатами' },
      { lineno: 2, function: 'count_unique', locals: { nums: '[1, 1, 2, 3]' }, note: 'set → {1, 2, 3}, len → 3' },
      { lineno: 4, function: '<module>', locals: {}, stdout: '3', note: 'Уникальных значений — 3' },
    ],
  },

  evens: {
    title: 'evens(6)',
    code: 'def evens(n):\n    return [x for x in range(n) if x % 2 == 0]\n\nprint(evens(6))',
    steps: [
      { lineno: 1, function: 'evens', locals: { n: '6' }, note: 'n = 6, range = 0..5' },
      { lineno: 2, function: 'evens', locals: { n: '6' }, note: 'Оставляем x, где x % 2 == 0' },
      { lineno: 4, function: '<module>', locals: {}, stdout: '[0, 2, 4]', note: 'Чётные < 6' },
    ],
  },

  point: {
    title: 'Point(3, 4).dist()',
    code: 'class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def dist(self):\n        return self.x * self.x + self.y * self.y\n\np = Point(3, 4)\nprint(p.dist())',
    steps: [
      { lineno: 9, function: '<module>', locals: {}, note: 'Создаём объект Point(3, 4)' },
      { lineno: 3, function: '__init__', locals: { self: '<Point>', x: '3', y: '4' }, note: 'self.x = 3' },
      { lineno: 4, function: '__init__', locals: { self: '<Point>', x: '3', y: '4' }, note: 'self.y = 4' },
      { lineno: 10, function: '<module>', locals: { p: '<Point x=3 y=4>' }, note: 'Вызываем p.dist()' },
      { lineno: 6, function: 'dist', locals: { self: '<Point x=3 y=4>' }, note: '3*3 + 4*4 = 25' },
      { lineno: 10, function: '<module>', locals: { p: '<Point x=3 y=4>' }, stdout: '25', note: 'Квадрат расстояния = 25' },
    ],
  },

  counter: {
    title: 'Counter().inc() x3',
    code: 'class Counter:\n    def __init__(self):\n        self.count = 0\n    def inc(self):\n        self.count += 1\n\nc = Counter()\nc.inc()\nc.inc()\nc.inc()\nprint(c.count)',
    steps: [
      { lineno: 7, function: '<module>', locals: {}, note: 'Создаём Counter()' },
      { lineno: 3, function: '__init__', locals: { self: '<Counter count=0>' }, note: 'count = 0' },
      { lineno: 5, function: 'inc', locals: { self: '<Counter count=1>' }, note: '1-й inc → 1' },
      { lineno: 5, function: 'inc', locals: { self: '<Counter count=2>' }, note: '2-й inc → 2' },
      { lineno: 5, function: 'inc', locals: { self: '<Counter count=3>' }, note: '3-й inc → 3' },
      { lineno: 11, function: '<module>', locals: { c: '<Counter count=3>' }, stdout: '3', note: 'count = 3' },
    ],
  },
};

export function getTrace(traceId?: string): TraceBundle | null {
  if (!traceId) return null;
  return TRACES[traceId] ?? null;
}
