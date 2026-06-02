// Учебный контент PyQuest: курсы, уроки и задания.
// Структура повторяет таблицы courses / lessons / tasks из backend (schema.sql),
// поэтому при подключении реального API клиент не потребует изменений.

import { Course, Lesson, Task } from '../types';

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Основы Python',
    description: 'Переменные, типы данных, ввод-вывод и арифметика. С нуля.',
    image_url: 'python_basics',
    difficulty: 'easy',
    xp_reward: 0,
    emoji: '🐍',
    accent: '#3DD68C',
  },
  {
    id: 'c2',
    title: 'Условия и циклы',
    description: 'Ветвление if/elif/else и циклы for и while.',
    image_url: 'loops',
    difficulty: 'easy',
    xp_reward: 0,
    emoji: '🔁',
    accent: '#4B8BC4',
  },
  {
    id: 'c3',
    title: 'Функции',
    description: 'Объявление функций, параметры, возврат значений, область видимости.',
    image_url: 'functions',
    difficulty: 'medium',
    xp_reward: 0,
    emoji: '🧩',
    accent: '#C792EA',
  },
  {
    id: 'c4',
    title: 'Коллекции',
    description: 'Списки, словари, кортежи, множества и генераторы списков.',
    image_url: 'collections',
    difficulty: 'medium',
    xp_reward: 0,
    emoji: '📦',
    accent: '#FFB454',
  },
  {
    id: 'c5',
    title: 'Основы ООП',
    description: 'Классы, объекты, атрибуты, методы и конструктор __init__.',
    image_url: 'oop',
    difficulty: 'hard',
    xp_reward: 0,
    emoji: '🏛️',
    accent: '#FF7AB2',
  },
];

// ---- helpers для краткой записи ----
const t = (
  task: Omit<Task, 'lesson_id'> & { lesson_id?: string },
  lessonId: string,
): Task => ({ ...task, lesson_id: lessonId } as Task);

export const LESSONS: Lesson[] = [
  // ===================== КУРС 1: Основы =====================
  {
    id: 'l1', course_id: 'c1', order_index: 0, image_url: null,
    title: 'Переменные и типы данных',
    content: {
      description: 'Узнаём, как хранить данные в переменных и какие бывают типы.',
      shortDescription: 'Переменные, int, float, str, bool',
      difficulty: 'easy', estimatedTime: 8, xpReward: 150,
      tags: ['python', 'basics', 'variables'],
      theory: [
        { type: 'text', value: 'Переменная — это имя, связанное со значением. В Python тип определяется автоматически по значению.' },
        { type: 'code', value: 'name = "Алёна"   # str — строка\nage = 21          # int — целое\npi = 3.14         # float — дробное\nis_student = True # bool — логическое' },
        { type: 'note', value: 'Узнать тип значения можно функцией type(x). Имя переменной пишут латиницей, без пробелов.' },
      ],
    },
  },
  {
    id: 'l2', course_id: 'c1', order_index: 1, image_url: null,
    title: 'Ввод и вывод',
    content: {
      description: 'Печатаем результаты функцией print() и читаем данные через input().',
      shortDescription: 'print() и input()',
      difficulty: 'easy', estimatedTime: 8, xpReward: 150,
      tags: ['python', 'io'],
      theory: [
        { type: 'text', value: 'Функция print() выводит значения на экран. Можно передать несколько аргументов через запятую.' },
        { type: 'code', value: 'print("Привет,", "мир")   # Привет, мир\nprint("2 + 2 =", 2 + 2)     # 2 + 2 = 4' },
        { type: 'text', value: 'Функция input() читает строку от пользователя. Чтобы получить число, результат оборачивают в int() или float().' },
        { type: 'code', value: 'n = int(input("Введите число: "))\nprint(n * 2)' },
      ],
    },
  },
  {
    id: 'l3', course_id: 'c1', order_index: 2, image_url: null,
    title: 'Арифметика и операторы',
    content: {
      description: 'Складываем, делим, берём остаток и целую часть.',
      shortDescription: '+ - * / // % **',
      difficulty: 'easy', estimatedTime: 9, xpReward: 160,
      tags: ['python', 'math'],
      theory: [
        { type: 'text', value: 'Базовые операторы: + сложение, - вычитание, * умножение, / деление (всегда float).' },
        { type: 'code', value: '7 / 2    # 3.5  обычное деление\n7 // 2   # 3    целочисленное деление\n7 % 2    # 1    остаток от деления\n2 ** 10  # 1024 возведение в степень' },
        { type: 'note', value: 'Оператор // отбрасывает дробную часть, а % даёт остаток. Их часто используют вместе.' },
      ],
    },
  },

  // ===================== КУРС 2: Условия и циклы =====================
  {
    id: 'l4', course_id: 'c2', order_index: 0, image_url: null,
    title: 'Условный оператор if',
    content: {
      description: 'Принимаем решения с помощью if / elif / else.',
      shortDescription: 'if, elif, else',
      difficulty: 'easy', estimatedTime: 9, xpReward: 160,
      tags: ['python', 'conditions'],
      theory: [
        { type: 'text', value: 'Условие проверяет логическое выражение. Блок кода под if выполняется, только если условие истинно (True).' },
        { type: 'code', value: 'temp = 18\nif temp > 25:\n    print("Жарко")\nelif temp > 15:\n    print("Тепло")\nelse:\n    print("Холодно")' },
        { type: 'note', value: 'Отступ (4 пробела) обязателен — он показывает, какой код относится к условию.' },
      ],
    },
  },
  {
    id: 'l5', course_id: 'c2', order_index: 1, image_url: null,
    title: 'Цикл for и range',
    content: {
      description: 'Повторяем действия для каждого элемента последовательности.',
      shortDescription: 'for, range()',
      difficulty: 'easy', estimatedTime: 10, xpReward: 170,
      tags: ['python', 'loops'],
      theory: [
        { type: 'text', value: 'Цикл for перебирает элементы. range(n) даёт числа от 0 до n-1.' },
        { type: 'code', value: 'for i in range(5):\n    print(i)     # 0 1 2 3 4\n\ntotal = 0\nfor x in [10, 20, 30]:\n    total += x   # total = 60' },
        { type: 'note', value: 'range(1, 5) → 1,2,3,4. range(0, 10, 2) → 0,2,4,6,8 (шаг 2).' },
      ],
    },
  },
  {
    id: 'l6', course_id: 'c2', order_index: 2, image_url: null,
    title: 'Цикл while',
    content: {
      description: 'Повторяем, пока условие истинно.',
      shortDescription: 'while, break, continue',
      difficulty: 'medium', estimatedTime: 10, xpReward: 180,
      tags: ['python', 'loops'],
      theory: [
        { type: 'text', value: 'Цикл while выполняется, пока условие True. Важно менять переменную внутри, иначе цикл станет бесконечным.' },
        { type: 'code', value: 'n = 5\nwhile n > 0:\n    print(n)\n    n -= 1   # 5 4 3 2 1' },
        { type: 'note', value: 'break досрочно выходит из цикла, continue переходит к следующей итерации.' },
      ],
    },
  },

  // ===================== КУРС 3: Функции =====================
  {
    id: 'l7', course_id: 'c3', order_index: 0, image_url: null,
    title: 'Объявление функций',
    content: {
      description: 'Группируем код в переиспользуемые функции через def.',
      shortDescription: 'def, вызов функции',
      difficulty: 'medium', estimatedTime: 9, xpReward: 180,
      tags: ['python', 'functions'],
      theory: [
        { type: 'text', value: 'Функция объявляется ключевым словом def. Её код выполняется только при вызове по имени.' },
        { type: 'code', value: 'def hello():\n    print("Привет!")\n\nhello()   # Привет!' },
        { type: 'note', value: 'Имя функции — глагол или действие. После имени всегда круглые скобки.' },
      ],
    },
  },
  {
    id: 'l8', course_id: 'c3', order_index: 1, image_url: null,
    title: 'Параметры и возврат значений',
    content: {
      description: 'Передаём данные в функцию и получаем результат через return.',
      shortDescription: 'параметры, return',
      difficulty: 'medium', estimatedTime: 11, xpReward: 190,
      tags: ['python', 'functions'],
      theory: [
        { type: 'text', value: 'Параметры — это вход функции. return возвращает результат наружу и завершает функцию.' },
        { type: 'code', value: 'def add(a, b):\n    return a + b\n\nresult = add(2, 3)   # result = 5' },
        { type: 'note', value: 'Если return отсутствует, функция возвращает None. Можно задавать значения по умолчанию: def f(x=10).' },
      ],
    },
  },
  {
    id: 'l9', course_id: 'c3', order_index: 2, image_url: null,
    title: 'Область видимости',
    content: {
      description: 'Локальные и глобальные переменные.',
      shortDescription: 'local / global',
      difficulty: 'hard', estimatedTime: 10, xpReward: 200,
      tags: ['python', 'scope'],
      theory: [
        { type: 'text', value: 'Переменная, созданная внутри функции, локальна — снаружи её не видно.' },
        { type: 'code', value: 'def f():\n    x = 10   # локальная\n    return x\n\nf()\n# print(x) → ошибка: x не определена' },
        { type: 'note', value: 'Глобальные переменные видны везде, но менять их внутри функции стоит осторожно.' },
      ],
    },
  },

  // ===================== КУРС 4: Коллекции =====================
  {
    id: 'l10', course_id: 'c4', order_index: 0, image_url: null,
    title: 'Списки',
    content: {
      description: 'Хранение последовательности элементов в списке.',
      shortDescription: 'list, append, индексы',
      difficulty: 'medium', estimatedTime: 11, xpReward: 190,
      tags: ['python', 'list'],
      theory: [
        { type: 'text', value: 'Список — упорядоченная изменяемая коллекция. Индексация с нуля.' },
        { type: 'code', value: 'nums = [10, 20, 30]\nprint(nums[0])     # 10\nnums.append(40)    # [10, 20, 30, 40]\nprint(len(nums))   # 4' },
        { type: 'note', value: 'Отрицательный индекс отсчитывает с конца: nums[-1] — последний элемент.' },
      ],
    },
  },
  {
    id: 'l11', course_id: 'c4', order_index: 1, image_url: null,
    title: 'Словари',
    content: {
      description: 'Хранение пар «ключ — значение».',
      shortDescription: 'dict, ключи и значения',
      difficulty: 'medium', estimatedTime: 11, xpReward: 200,
      tags: ['python', 'dict'],
      theory: [
        { type: 'text', value: 'Словарь хранит данные в виде ключ: значение. Доступ — по ключу, а не по индексу.' },
        { type: 'code', value: 'user = {"name": "Алёна", "age": 21}\nprint(user["name"])   # Алёна\nuser["age"] = 22       # изменили\nuser["city"] = "Елабуга"  # добавили' },
        { type: 'note', value: 'Метод .get("key") безопасно вернёт None, если ключа нет (без ошибки).' },
      ],
    },
  },
  {
    id: 'l12', course_id: 'c4', order_index: 2, image_url: null,
    title: 'Кортежи и множества',
    content: {
      description: 'Неизменяемые кортежи и множества уникальных элементов.',
      shortDescription: 'tuple, set',
      difficulty: 'medium', estimatedTime: 9, xpReward: 190,
      tags: ['python', 'tuple', 'set'],
      theory: [
        { type: 'text', value: 'Кортеж (tuple) похож на список, но его нельзя менять. Множество (set) хранит только уникальные элементы.' },
        { type: 'code', value: 'point = (3, 4)      # кортеж\nunique = {1, 2, 2, 3}\nprint(unique)        # {1, 2, 3}' },
        { type: 'note', value: 'set автоматически убирает дубликаты — удобно для подсчёта уникальных значений.' },
      ],
    },
  },
  {
    id: 'l13', course_id: 'c4', order_index: 3, image_url: null,
    title: 'Генераторы списков',
    content: {
      description: 'Краткая запись создания списков.',
      shortDescription: 'list comprehension',
      difficulty: 'hard', estimatedTime: 10, xpReward: 210,
      tags: ['python', 'comprehension'],
      theory: [
        { type: 'text', value: 'Генератор списка позволяет создать список в одну строку.' },
        { type: 'code', value: 'squares = [x * x for x in range(5)]\n# [0, 1, 4, 9, 16]\n\nevens = [x for x in range(10) if x % 2 == 0]\n# [0, 2, 4, 6, 8]' },
        { type: 'note', value: 'Конструкция: [выражение for элемент in последовательность if условие].' },
      ],
    },
  },

  // ===================== КУРС 5: ООП =====================
  {
    id: 'l14', course_id: 'c5', order_index: 0, image_url: null,
    title: 'Классы и объекты',
    content: {
      description: 'Создаём собственные типы данных через классы.',
      shortDescription: 'class, объект',
      difficulty: 'hard', estimatedTime: 11, xpReward: 220,
      tags: ['python', 'oop'],
      theory: [
        { type: 'text', value: 'Класс — это «чертёж» для объектов. Объект — конкретный экземпляр класса.' },
        { type: 'code', value: 'class Dog:\n    def bark(self):\n        return "Гав!"\n\nrex = Dog()\nprint(rex.bark())   # Гав!' },
        { type: 'note', value: 'Имена классов пишут с большой буквы (PascalCase). self — ссылка на сам объект.' },
      ],
    },
  },
  {
    id: 'l15', course_id: 'c5', order_index: 1, image_url: null,
    title: 'Конструктор __init__',
    content: {
      description: 'Задаём начальные атрибуты объекта при создании.',
      shortDescription: '__init__, self, атрибуты',
      difficulty: 'hard', estimatedTime: 12, xpReward: 230,
      tags: ['python', 'oop'],
      theory: [
        { type: 'text', value: 'Метод __init__ вызывается автоматически при создании объекта и задаёт его атрибуты.' },
        { type: 'code', value: 'class Student:\n    def __init__(self, name, xp):\n        self.name = name\n        self.xp = xp\n\ns = Student("Алёна", 100)\nprint(s.name, s.xp)   # Алёна 100' },
        { type: 'note', value: 'self.attr = value сохраняет данные внутри объекта на всё время его жизни.' },
      ],
    },
  },
  {
    id: 'l16', course_id: 'c5', order_index: 2, image_url: null,
    title: 'Методы объекта',
    content: {
      description: 'Поведение объекта — функции внутри класса.',
      shortDescription: 'методы, обращение к self',
      difficulty: 'hard', estimatedTime: 12, xpReward: 240,
      tags: ['python', 'oop'],
      theory: [
        { type: 'text', value: 'Метод — это функция внутри класса. Через self он работает с атрибутами своего объекта.' },
        { type: 'code', value: 'class Counter:\n    def __init__(self):\n        self.count = 0\n    def inc(self):\n        self.count += 1\n\nc = Counter()\nc.inc()\nc.inc()\nprint(c.count)   # 2' },
        { type: 'note', value: 'Каждый объект хранит своё состояние независимо от других объектов того же класса.' },
      ],
    },
  },
];

// ===================== ЗАДАНИЯ =====================
// Для краткости заданы плоским списком и сгруппированы по lesson_id.
export const TASKS: Task[] = [
  // ---- l1: Переменные и типы ----
  t({ id: 't1', order_index: 0, task_type: 'multiple_choice', title: 'Тип значения', xp_reward: 50,
    prompt: 'Какой тип имеет значение 3.14 в Python?', hint: 'Дробное число.',
    validation: { question: 'Какой тип имеет значение 3.14?', options: ['int', 'float', 'str', 'bool'], correctAnswerIndex: 1 } }, 'l1'),
  t({ id: 't2', order_index: 1, task_type: 'fill_gap', title: 'Объявление переменной', xp_reward: 50,
    prompt: 'Заполните пропуск: присвойте строку "Алёна" переменной с именем name.', hint: 'имя = значение',
    validation: { expected: 'name', caseSensitive: true, template: '___ = "Алёна"' } }, 'l1'),
  t({ id: 't3', order_index: 2, task_type: 'write_code', title: 'Функция square', xp_reward: 120,
    prompt: 'Напишите функцию square(n), которая возвращает квадрат числа n.', hint: 'return n * n',
    validation: { tests_code: 'assert square(4) == 16\nassert square(0) == 0\nassert square(-3) == 9', starterCode: 'def square(n):\n    # ваш код\n    pass', traceId: 'square' } }, 'l1'),

  // ---- l2: Ввод и вывод ----
  t({ id: 't4', order_index: 0, task_type: 'multiple_choice', title: 'Что выведет print', xp_reward: 50,
    prompt: 'Что выведет print("2" + "2")?', hint: 'Это строки, а не числа.',
    validation: { question: 'Что выведет print("2" + "2")?', options: ['4', '22', 'ошибка', '"22"'], correctAnswerIndex: 1 } }, 'l2'),
  t({ id: 't5', order_index: 1, task_type: 'fill_gap', title: 'Вывод на экран', xp_reward: 50,
    prompt: 'Заполните пропуск, чтобы вывести слово Hello.', hint: 'Функция печати.',
    validation: { expected: 'print', caseSensitive: true, template: '___("Hello")' } }, 'l2'),
  t({ id: 't6', order_index: 2, task_type: 'write_code', title: 'Функция greet', xp_reward: 120,
    prompt: 'Напишите функцию greet(name), возвращающую строку "Привет, <name>!".', hint: 'Используйте f-строку: f"Привет, {name}!"',
    validation: { tests_code: 'assert greet("Аня") == "Привет, Аня!"\nassert greet("Боб") == "Привет, Боб!"', starterCode: 'def greet(name):\n    pass', traceId: 'greet' } }, 'l2'),

  // ---- l3: Арифметика ----
  t({ id: 't7', order_index: 0, task_type: 'multiple_choice', title: 'Целочисленное деление', xp_reward: 50,
    prompt: 'Чему равно 17 // 5 ?', hint: '// — деление без остатка.',
    validation: { question: 'Чему равно 17 // 5 ?', options: ['3.4', '3', '2', '4'], correctAnswerIndex: 1 } }, 'l3'),
  t({ id: 't8', order_index: 1, task_type: 'multiple_choice', title: 'Остаток', xp_reward: 50,
    prompt: 'Чему равно 17 % 5 ?', hint: '% — остаток от деления.',
    validation: { question: 'Чему равно 17 % 5 ?', options: ['2', '3', '0', '1'], correctAnswerIndex: 0 } }, 'l3'),
  t({ id: 't9', order_index: 2, task_type: 'debug_code', title: 'Почини среднее', xp_reward: 130,
    prompt: 'Функция должна возвращать среднее двух чисел, но содержит ошибку. Исправьте её.', hint: 'Не забудьте про скобки: (a + b) / 2',
    validation: { tests_code: 'assert average(2, 4) == 3\nassert average(10, 20) == 15', starterCode: 'def average(a, b):\n    return a + b / 2', traceId: 'average' } }, 'l3'),

  // ---- l4: if ----
  t({ id: 't10', order_index: 0, task_type: 'multiple_choice', title: 'Результат условия', xp_reward: 50,
    prompt: 'temp = 10. Что выведется по теории урока (>25 Жарко, >15 Тепло, иначе Холодно)?', hint: '10 не больше 15.',
    validation: { question: 'temp = 10 → что выведется?', options: ['Жарко', 'Тепло', 'Холодно', 'Ничего'], correctAnswerIndex: 2 } }, 'l4'),
  t({ id: 't11', order_index: 1, task_type: 'fill_gap', title: 'Ключевое слово', xp_reward: 50,
    prompt: 'Каким словом начинается проверка дополнительного условия (иначе-если)?', hint: 'else + if = ?',
    validation: { expected: 'elif', caseSensitive: true, template: 'if x > 0:\n    ...\n___ x == 0:\n    ...' } }, 'l4'),
  t({ id: 't12', order_index: 2, task_type: 'write_code', title: 'Чётность', xp_reward: 120,
    prompt: 'Напишите функцию is_even(n), возвращающую True, если n чётное, иначе False.', hint: 'Используйте n % 2 == 0',
    validation: { tests_code: 'assert is_even(4) == True\nassert is_even(7) == False\nassert is_even(0) == True', starterCode: 'def is_even(n):\n    pass', traceId: 'is_even' } }, 'l4'),

  // ---- l5: for ----
  t({ id: 't13', order_index: 0, task_type: 'multiple_choice', title: 'range', xp_reward: 50,
    prompt: 'Сколько раз выполнится цикл for i in range(5)?', hint: 'range(5) → 0..4.',
    validation: { question: 'Сколько итераций у range(5)?', options: ['4', '5', '6', 'бесконечно'], correctAnswerIndex: 1 } }, 'l5'),
  t({ id: 't14', order_index: 1, task_type: 'write_code', title: 'Сумма чисел', xp_reward: 130,
    prompt: 'Напишите функцию sum_to(n), возвращающую сумму чисел от 1 до n включительно.', hint: 'Заведите total = 0 и прибавляйте в цикле.',
    validation: { tests_code: 'assert sum_to(5) == 15\nassert sum_to(1) == 1\nassert sum_to(10) == 55', starterCode: 'def sum_to(n):\n    total = 0\n    # ваш код\n    return total', traceId: 'sum_to' } }, 'l5'),
  t({ id: 't15', order_index: 2, task_type: 'write_code', title: 'Факториал', xp_reward: 140,
    prompt: 'Напишите функцию factorial(n), возвращающую n! (произведение от 1 до n).', hint: 'result = 1, умножайте в цикле.',
    validation: { tests_code: 'assert factorial(5) == 120\nassert factorial(0) == 1\nassert factorial(3) == 6', starterCode: 'def factorial(n):\n    result = 1\n    return result', traceId: 'factorial' } }, 'l5'),

  // ---- l6: while ----
  t({ id: 't16', order_index: 0, task_type: 'multiple_choice', title: 'Бесконечный цикл', xp_reward: 50,
    prompt: 'Что произойдёт, если в while забыть менять переменную условия?', hint: 'Условие всегда True.',
    validation: { question: 'while без изменения условия — это...', options: ['ошибка синтаксиса', 'бесконечный цикл', 'один проход', 'ноль проходов'], correctAnswerIndex: 1 } }, 'l6'),
  t({ id: 't17', order_index: 1, task_type: 'write_code', title: 'Обратный отсчёт', xp_reward: 130,
    prompt: 'Напишите функцию countdown(n), возвращающую список [n, n-1, ..., 1] с помощью while.', hint: 'result = []; пока n > 0 добавляйте n и уменьшайте.',
    validation: { tests_code: 'assert countdown(3) == [3, 2, 1]\nassert countdown(1) == [1]\nassert countdown(0) == []', starterCode: 'def countdown(n):\n    result = []\n    while n > 0:\n        pass\n    return result', traceId: 'countdown' } }, 'l6'),

  // ---- l7: функции ----
  t({ id: 't18', order_index: 0, task_type: 'fill_gap', title: 'Объявление', xp_reward: 50,
    prompt: 'Каким ключевым словом объявляют функцию?', hint: 'Три буквы.',
    validation: { expected: 'def', caseSensitive: true, template: '___ hello():\n    print("Привет!")' } }, 'l7'),
  t({ id: 't19', order_index: 1, task_type: 'write_code', title: 'Площадь', xp_reward: 120,
    prompt: 'Напишите функцию area(w, h), возвращающую площадь прямоугольника.', hint: 'return w * h',
    validation: { tests_code: 'assert area(2, 3) == 6\nassert area(5, 5) == 25', starterCode: 'def area(w, h):\n    pass', traceId: 'area' } }, 'l7'),

  // ---- l8: параметры/return ----
  t({ id: 't20', order_index: 0, task_type: 'multiple_choice', title: 'Возврат по умолчанию', xp_reward: 50,
    prompt: 'Что вернёт функция без оператора return?', hint: 'Пустое значение.',
    validation: { question: 'Функция без return возвращает...', options: ['0', '""', 'None', 'ошибку'], correctAnswerIndex: 2 } }, 'l8'),
  t({ id: 't21', order_index: 1, task_type: 'write_code', title: 'Максимум из двух', xp_reward: 130,
    prompt: 'Напишите функцию my_max(a, b), возвращающую большее из двух чисел (без встроенного max).', hint: 'Сравните через if a > b.',
    validation: { tests_code: 'assert my_max(2, 5) == 5\nassert my_max(9, 1) == 9\nassert my_max(3, 3) == 3', starterCode: 'def my_max(a, b):\n    pass', traceId: 'my_max' } }, 'l8'),

  // ---- l9: scope ----
  t({ id: 't22', order_index: 0, task_type: 'multiple_choice', title: 'Локальная переменная', xp_reward: 60,
    prompt: 'Переменная, созданная внутри функции, доступна...', hint: 'Только в своей области.',
    validation: { question: 'Локальная переменная доступна...', options: ['везде', 'только внутри функции', 'только в других функциях', 'нигде'], correctAnswerIndex: 1 } }, 'l9'),
  t({ id: 't23', order_index: 1, task_type: 'debug_code', title: 'Почини счётчик', xp_reward: 140,
    prompt: 'Функция должна вернуть удвоенное значение, но возвращает None. Исправьте.', hint: 'Не хватает return.',
    validation: { tests_code: 'assert double(4) == 8\nassert double(0) == 0', starterCode: 'def double(x):\n    result = x * 2', traceId: 'double' } }, 'l9'),

  // ---- l10: списки ----
  t({ id: 't24', order_index: 0, task_type: 'multiple_choice', title: 'Индексация', xp_reward: 50,
    prompt: 'nums = [10, 20, 30]. Чему равно nums[1]?', hint: 'Индексация с нуля.',
    validation: { question: 'nums = [10,20,30]; nums[1] = ?', options: ['10', '20', '30', 'ошибка'], correctAnswerIndex: 1 } }, 'l10'),
  t({ id: 't25', order_index: 1, task_type: 'fill_gap', title: 'Добавление', xp_reward: 60,
    prompt: 'Каким методом добавляют элемент в конец списка?', hint: 'nums.____(40)',
    validation: { expected: 'append', caseSensitive: true, template: 'nums = [1, 2, 3]\nnums.___(4)' } }, 'l10'),
  t({ id: 't26', order_index: 2, task_type: 'write_code', title: 'Сумма списка', xp_reward: 130,
    prompt: 'Напишите функцию list_sum(nums), возвращающую сумму элементов списка (без sum).', hint: 'Перебирайте элементы в цикле.',
    validation: { tests_code: 'assert list_sum([1, 2, 3]) == 6\nassert list_sum([]) == 0\nassert list_sum([10]) == 10', starterCode: 'def list_sum(nums):\n    total = 0\n    return total', traceId: 'list_sum' } }, 'l10'),

  // ---- l11: словари ----
  t({ id: 't27', order_index: 0, task_type: 'multiple_choice', title: 'Доступ по ключу', xp_reward: 60,
    prompt: 'user = {"name": "Аня"}. Как получить значение "Аня"?', hint: 'По ключу в квадратных скобках.',
    validation: { question: 'Как получить значение по ключу name?', options: ['user(0)', 'user["name"]', 'user.name()', 'user{name}'], correctAnswerIndex: 1 } }, 'l11'),
  t({ id: 't28', order_index: 1, task_type: 'write_code', title: 'Подсчёт частот', xp_reward: 150,
    prompt: 'Напишите функцию count_chars(s), возвращающую словарь {символ: количество}.', hint: 'Если символа нет в словаре — начните с 0.',
    validation: { tests_code: 'assert count_chars("aab") == {"a": 2, "b": 1}\nassert count_chars("") == {}', starterCode: 'def count_chars(s):\n    result = {}\n    return result', traceId: 'count_chars' } }, 'l11'),

  // ---- l12: tuple/set ----
  t({ id: 't29', order_index: 0, task_type: 'multiple_choice', title: 'Уникальность', xp_reward: 60,
    prompt: 'Что выведет set([1, 2, 2, 3, 3, 3])?', hint: 'set убирает дубликаты.',
    validation: { question: 'set([1,2,2,3,3,3]) = ?', options: ['{1, 2, 3}', '{1, 2, 2, 3}', '[1, 2, 3]', '6'], correctAnswerIndex: 0 } }, 'l12'),
  t({ id: 't30', order_index: 1, task_type: 'write_code', title: 'Кол-во уникальных', xp_reward: 130,
    prompt: 'Напишите функцию count_unique(nums), возвращающую число уникальных элементов.', hint: 'Преобразуйте список в set и возьмите len.',
    validation: { tests_code: 'assert count_unique([1, 1, 2, 3]) == 3\nassert count_unique([5, 5, 5]) == 1\nassert count_unique([]) == 0', starterCode: 'def count_unique(nums):\n    pass', traceId: 'count_unique' } }, 'l12'),

  // ---- l13: comprehension ----
  t({ id: 't31', order_index: 0, task_type: 'multiple_choice', title: 'Генератор', xp_reward: 60,
    prompt: 'Что создаст [x * 2 for x in range(3)]?', hint: 'x = 0,1,2.',
    validation: { question: '[x*2 for x in range(3)] = ?', options: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', '[1, 2, 3]'], correctAnswerIndex: 0 } }, 'l13'),
  t({ id: 't32', order_index: 1, task_type: 'write_code', title: 'Только чётные', xp_reward: 140,
    prompt: 'Через генератор списка напишите функцию evens(n) — список чётных чисел от 0 до n-1.', hint: '[x for x in range(n) if x % 2 == 0]',
    validation: { tests_code: 'assert evens(6) == [0, 2, 4]\nassert evens(1) == [0]\nassert evens(0) == []', starterCode: 'def evens(n):\n    pass', traceId: 'evens' } }, 'l13'),

  // ---- l14: классы ----
  t({ id: 't33', order_index: 0, task_type: 'fill_gap', title: 'Объявление класса', xp_reward: 60,
    prompt: 'Каким ключевым словом объявляют класс?', hint: 'Пять букв.',
    validation: { expected: 'class', caseSensitive: true, template: '___ Dog:\n    def bark(self):\n        return "Гав!"' } }, 'l14'),
  t({ id: 't34', order_index: 1, task_type: 'multiple_choice', title: 'Создание объекта', xp_reward: 60,
    prompt: 'Как создать объект класса Dog?', hint: 'Имя класса со скобками.',
    validation: { question: 'Как создать объект Dog?', options: ['Dog', 'new Dog()', 'Dog()', 'create Dog'], correctAnswerIndex: 2 } }, 'l14'),

  // ---- l15: __init__ ----
  t({ id: 't35', order_index: 0, task_type: 'multiple_choice', title: 'Конструктор', xp_reward: 70,
    prompt: 'Какой метод вызывается автоматически при создании объекта?', hint: 'Два подчёркивания с двух сторон.',
    validation: { question: 'Метод при создании объекта — это...', options: ['__start__', '__init__', '__new__', 'create'], correctAnswerIndex: 1 } }, 'l15'),
  t({ id: 't36', order_index: 1, task_type: 'write_code', title: 'Класс Point', xp_reward: 160,
    prompt: 'Создайте класс Point с __init__(self, x, y) и методом dist(), возвращающим x*x + y*y.', hint: 'Сохраните self.x и self.y, затем верните сумму квадратов.',
    validation: { tests_code: 'p = Point(3, 4)\nassert p.x == 3\nassert p.dist() == 25', starterCode: 'class Point:\n    def __init__(self, x, y):\n        pass\n    def dist(self):\n        pass', traceId: 'point' } }, 'l15'),

  // ---- l16: методы ----
  t({ id: 't37', order_index: 0, task_type: 'multiple_choice', title: 'self', xp_reward: 70,
    prompt: 'Что обозначает self внутри метода?', hint: 'Текущий объект.',
    validation: { question: 'self — это...', options: ['класс', 'сам объект', 'модуль', 'функция'], correctAnswerIndex: 1 } }, 'l16'),
  t({ id: 't38', order_index: 1, task_type: 'write_code', title: 'Класс Counter', xp_reward: 170,
    prompt: 'Создайте класс Counter с count=0 в __init__ и методом inc(), увеличивающим count на 1.', hint: 'self.count += 1 внутри inc.',
    validation: { tests_code: 'c = Counter()\nc.inc()\nc.inc()\nc.inc()\nassert c.count == 3', starterCode: 'class Counter:\n    def __init__(self):\n        pass\n    def inc(self):\n        pass', traceId: 'counter' } }, 'l16'),
];

// Утилиты выборки (имитируют ответы REST-эндпоинтов)
export function lessonsByCourse(courseId: string): Lesson[] {
  return LESSONS.filter((l) => l.course_id === courseId).sort((a, b) => a.order_index - b.order_index);
}
export function tasksByLesson(lessonId: string): Task[] {
  return TASKS.filter((t2) => t2.lesson_id === lessonId).sort((a, b) => a.order_index - b.order_index);
}
export function findLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
export function findCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}
