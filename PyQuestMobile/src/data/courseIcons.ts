// Иконки курсов — PNG-глифы (рендерятся везде, в т.ч. на эмуляторах),
// тинтуются акцентным цветом курса.
import { COURSE_BASICS, COURSE_LOOPS, COURSE_FUNCTIONS, COURSE_COLLECTIONS, COURSE_OOP } from './assets';

export const COURSE_ICON: Record<string, string> = {
  c1: COURSE_BASICS,
  c2: COURSE_LOOPS,
  c3: COURSE_FUNCTIONS,
  c4: COURSE_COLLECTIONS,
  c5: COURSE_OOP,
};
