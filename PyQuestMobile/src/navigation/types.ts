import { Task } from '../types';

export type CoursesStackParamList = {
  Courses: undefined;
  CourseDetail: { courseId: string; title: string };
  Lesson: { lessonId: string; title: string };
  CodeVisualizer: { traceId?: string; title?: string; task?: Task };
};

export type MainTabParamList = {
  CoursesTab: undefined;
  LeaderboardTab: undefined;
  AchievementsTab: undefined;
  ProfileTab: undefined;
};
