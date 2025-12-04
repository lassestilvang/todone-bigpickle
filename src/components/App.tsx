import React from 'react';
import { useAppStore } from '../store/appStore';
import { ErrorBoundary } from './ErrorBoundary';
import { MainLayout } from './layout/MainLayout';

export const App: React.FC = () => {
  // Bypass authentication entirely for testing
  const store = useAppStore();
  
  // Auto-authenticate for testing
  React.useEffect(() => {
    if (!store.isAuthenticated) {
      store.setUser({
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        settings: {
          theme: "system",
          language: "en",
          dateFormat: "MM/DD/YYYY",
          timeFormat: "12h",
          startOfWeek: "sunday",
          notifications: {
            taskReminders: true,
            comments: true,
            assignments: true,
            dailySummary: false,
            overdueTasks: true,
            goalAchievements: true,
          },
        },
        preferences: {
          defaultProject: "",
          defaultPriority: "p4",
          autoAddTime: false,
          showCompleted: false,
          collapseSections: false,
        },
        karma: {
          points: 0,
          level: "beginner",
          currentLevelPoints: 0,
          nextLevelPoints: 1000,
          weeklyTrend: [],
          dailyGoal: 5,
          weeklyGoal: 25,
          dailyStreak: 0,
          weeklyStreak: 0,
          longestStreak: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [store]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Main app error:', error, errorInfo);
      }}
    >
      <MainLayout />
    </ErrorBoundary>
  );
};