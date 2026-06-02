import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/theme';
import { CoursesStackParamList, MainTabParamList } from './types';
import { useApp } from '../context/AppContext';

import { LoginScreen } from '../screens/LoginScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { CodeVisualizerScreen } from '../screens/CodeVisualizerScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';

const Stack = createNativeStackNavigator<CoursesStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const AuthStack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
    notification: colors.accent,
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.bgElevated },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' as const },
  contentStyle: { backgroundColor: colors.bg },
};

const CoursesStack: React.FC = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Courses" component={CoursesScreen} options={{ title: 'PyQuest' }} />
    <Stack.Screen
      name="CourseDetail"
      component={CourseDetailScreen}
      options={({ route }) => ({ title: route.params.title })}
    />
    <Stack.Screen
      name="Lesson"
      component={LessonScreen}
      options={({ route }) => ({ title: route.params.title })}
    />
    <Stack.Screen
      name="CodeVisualizer"
      component={CodeVisualizerScreen}
      options={{ title: 'Визуализация' }}
    />
  </Stack.Navigator>
);

const tabIcon = (emoji: string) => ({ focused }: { focused: boolean }) =>
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.bgElevated, borderTopColor: colors.border, height: 60, paddingBottom: 6, paddingTop: 6 },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textDim,
      tabBarLabelStyle: { fontSize: 11 },
    }}>
    <Tab.Screen name="CoursesTab" component={CoursesStack} options={{ title: 'Курсы', tabBarIcon: tabIcon('📚') }} />
    <Tab.Screen name="LeaderboardTab" component={LeaderboardScreen} options={{ title: 'Рейтинг', tabBarIcon: tabIcon('🏆') }} />
    <Tab.Screen name="AchievementsTab" component={AchievementsScreen} options={{ title: 'Награды', tabBarIcon: tabIcon('🎖') }} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Профиль', tabBarIcon: tabIcon('👤') }} />
  </Tab.Navigator>
);

export const RootNavigator: React.FC = () => {
  const { user } = useApp();
  return (
    <NavigationContainer theme={navTheme}>
      {user ? (
        <MainTabs />
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};
