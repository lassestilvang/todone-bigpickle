import React from 'react';
import { useAppStore } from '../store/appStore';
import { LoginForm } from './auth/LoginForm';
import { MainLayout } from './layout/MainLayout';
import { ErrorBoundary } from './ErrorBoundary';

export const App: React.FC = () => {
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Login error:', error, errorInfo);
        }}
      >
        <LoginForm />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Main app error:', error, errorInfo);
        // Could send error reporting service here
      }}
    >
      <MainLayout />
    </ErrorBoundary>
  );
};