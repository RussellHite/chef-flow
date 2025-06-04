import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { RecipeProvider } from './contexts/RecipeContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <RecipeProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </RecipeProvider>
    </SafeAreaProvider>
  );
}