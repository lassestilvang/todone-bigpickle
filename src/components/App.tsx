import React from 'react';
import { useAppStore } from '../store/appStore';
import { LoginForm } from './auth/LoginForm';
import { MainLayout } from './layout/MainLayout';

export const App: React.FC = () => {
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <MainLayout />;
};