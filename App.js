import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import AppNavigator from './navigation/AppNavigator';
import { RecipeProvider } from './contexts/RecipeContext';
import { CookingProvider } from './contexts/CookingContext';
import NotificationService from './services/NotificationService';
import ErrorBoundary from './components/ErrorBoundary';
import { debugLog, errorLog, logAssetLoad } from './utils/devTools';

export default function App() {
  useEffect(() => {
    // Log app startup in development
    debugLog('App starting up');

    // Preload assets
    const preloadAssets = async () => {
      try {
        const assetPromises = [
          Asset.loadAsync([
            require('./assets/icon.png'),
            require('./assets/splash-icon.png'),
            require('./assets/adaptive-icon.png'),
          ])
        ];
        
        await Promise.all(assetPromises);
        debugLog('Assets preloaded successfully');
        logAssetLoad('App icons', true);
      } catch (error) {
        errorLog(error, 'Asset preloading');
        logAssetLoad('App icons', false, error);
      }
    };

    preloadAssets();

    // Initialize notification service with delay to ensure app is ready
    const timer = setTimeout(() => {
      debugLog('Initializing notification service');
      NotificationService.initialize().catch(error => {
        errorLog(error, 'Notification initialization');
      });
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      NotificationService.cleanup();
      debugLog('App cleanup completed');
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <RecipeProvider>
          <CookingProvider>
            <AppNavigator />
            <StatusBar style="light" />
          </CookingProvider>
        </RecipeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}