import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { RecipeProvider } from './contexts/RecipeContext';
import NotificationService from './services/NotificationService';

export default function App() {
  useEffect(() => {
    // Initialize notification service
    NotificationService.initialize();
    
    return () => {
      NotificationService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <RecipeProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </RecipeProvider>
    </SafeAreaProvider>
  );
}