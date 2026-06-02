// Простейший каркас локализации (i18n). Сейчас один язык — русский,
// но архитектура позволяет добавить другие локали без правок компонентов:
// достаточно дополнить STRINGS и переключать CURRENT_LOCALE.

export type Locale = 'ru' | 'en';

const STRINGS: Record<Locale, Record<string, string>> = {
  ru: {
    'tab.courses': 'Курсы',
    'tab.leaderboard': 'Рейтинг',
    'tab.achievements': 'Награды',
    'tab.profile': 'Профиль',
    'common.next': 'Далее',
    'common.check': 'Проверить',
    'common.hint': 'Подсказка',
    'common.solution': 'Решение',
    'common.continue': 'Продолжить',
    'settings.title': 'Настройки',
    'settings.theme': 'Тема оформления',
    'settings.dark': 'Тёмная',
    'settings.light': 'Светлая',
    'settings.language': 'Язык',
    'settings.about': 'О приложении',
  },
  en: {
    'tab.courses': 'Courses',
    'tab.leaderboard': 'Leaderboard',
    'tab.achievements': 'Awards',
    'tab.profile': 'Profile',
    'common.next': 'Next',
    'common.check': 'Check',
    'common.hint': 'Hint',
    'common.solution': 'Solution',
    'common.continue': 'Continue',
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
    'settings.language': 'Language',
    'settings.about': 'About',
  },
};

let CURRENT_LOCALE: Locale = 'ru';

export function setLocale(l: Locale) {
  CURRENT_LOCALE = l;
}
export function t(key: string): string {
  return STRINGS[CURRENT_LOCALE]?.[key] ?? STRINGS.ru[key] ?? key;
}
