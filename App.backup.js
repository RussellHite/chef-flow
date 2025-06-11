import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { RecipeProvider } from './contexts/RecipeContext';
import { CookingProvider } from './contexts/CookingContext';
import NotificationService from './services/NotificationService';

export default function App() {
  useEffect(() => {
    // Initialize notification service with delay to ensure app is ready
    const timer = setTimeout(() => {
      NotificationService.initialize().catch(error => {
        console.error('Failed to initialize notifications:', error);
      });
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      NotificationService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <RecipeProvider>
        <CookingProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </CookingProvider>
      </RecipeProvider>
    </SafeAreaProvider>
  );
}