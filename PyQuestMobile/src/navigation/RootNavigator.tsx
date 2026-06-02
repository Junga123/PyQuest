import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { CoursesStackParamList, MainTabParamList, ProfileStackParamList } from './types';
import { Icon, IconName } from '../components/Icon';
import { t } from '../i18n';
import { useApp } from '../context/AppContext';

import { LoginScreen } from '../screens/LoginScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { CodeVisualizerScreen } from '../screens/CodeVisualizerScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';

const Stack = createNativeStackNavigator<CoursesStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const ProfileNav = createNativeStackNavigator<ProfileStackParamList>();
const AuthStack = createNativeStackNavigator();

const CoursesStack: React.FC = () => {
  const { colors } = useTheme();
  const screenOptions = {
    headerStyle: { backgroundColor: colors.glassStrong },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' as const },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: 'transparent' },
  };
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Courses" component={CoursesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={({ route }) => ({ title: route.params.title })} />
      <Stack.Screen name="Lesson" component={LessonScreen} options={({ route }) => ({ title: route.params.title })} />
      <Stack.Screen name="CodeVisualizer" component={CodeVisualizerScreen} options={{ title: 'Визуализация' }} />
    </Stack.Navigator>
  );
};

const ProfileStack: React.FC = () => {
  const { colors } = useTheme();
  const screenOptions = {
    headerStyle: { backgroundColor: colors.glassStrong },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' as const },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: 'transparent' },
  };
  return (
    <ProfileNav.Navigator screenOptions={screenOptions}>
      <ProfileNav.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileNav.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
    </ProfileNav.Navigator>
  );
};

const makeTabIcon = (name: IconName) => ({ color }: { color: string }) => <Icon name={name} size={24} color={color} />;

const MainTabs: React.FC = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.glassStrong,
          borderTopWidth: 1,
          borderTopColor: colors.glassBorder,
          height: 64,
          paddingBottom: 9,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.accentDark,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tab.Screen name="CoursesTab" component={CoursesStack} options={{ title: t('tab.courses'), tabBarIcon: makeTabIcon('book') }} />
      <Tab.Screen name="LeaderboardTab" component={LeaderboardScreen} options={{ title: t('tab.leaderboard'), tabBarIcon: makeTabIcon('chart') }} />
      <Tab.Screen name="AchievementsTab" component={AchievementsScreen} options={{ title: t('tab.achievements'), tabBarIcon: makeTabIcon('medal') }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: t('tab.profile'), tabBarIcon: makeTabIcon('person') }} />
    </Tab.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  const { user } = useApp();
  const { mode, colors } = useTheme();

  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: 'transparent',
      card: colors.glassStrong,
      text: colors.text,
      border: colors.glassBorder,
      primary: colors.accentDark,
      notification: colors.accent,
    },
  };

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
