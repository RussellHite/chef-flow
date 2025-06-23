/**
 * useCookingIndicator Hook
 * 
 * Custom hook for managing cooking indicator state, visibility, and interactions
 * Provides optimized data for the sticky cooking progress indicator
 * 
 * GitHub Issue #7: Sticky Cooking Progress Indicator
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppState, Dimensions } from 'react-native';
import { useCookingSession } from './useCookingSession';
import { formatTimerDisplay } from '../utils/cookingSessionUtils';

// Configuration for indicator behavior
const INDICATOR_CONFIG = {
  UPDATE_INTERVAL: 1000, // Timer update frequency (ms)
  HIDE_DELAY: 2000, // Delay before hiding after session ends (ms)
  MIN_DISPLAY_TIME: 3000, // Minimum time to show indicator (ms)
  TEXT_TRUNCATION: {
    SMALL_SCREEN: 20, // Characters for screens < 375px
    NORMAL_SCREEN: 25, // Characters for screens >= 375px
  }
};

/**
 * Custom hook for cooking indicator management
 * @param {Object} options - Configuration options
 * @returns {Object} - Indicator state and methods
 */
export function useCookingIndicator(options = {}) {
  const {
    autoHide = true,
    persistOnBackground = true,
    enableAnimations = true,
    customUpdateInterval = INDICATOR_CONFIG.UPDATE_INTERVAL
  } = options;

  // Get cooking session data
  const cookingSession = useCookingSession();
  const {
    isActive,
    recipeName,
    currentStep,
    totalSteps,
    progress,
    timer,
    rawState
  } = cookingSession;

  // Local state for indicator management
  const [isVisible, setIsVisible] = useState(false);
  const [lastShownTime, setLastShownTime] = useState(null);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [appState, setAppState] = useState(AppState.currentState);

  // Update screen dimensions
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  // Monitor app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });
    return () => subscription.remove();
  }, []);

  // Determine if indicator should be visible
  const shouldShowIndicator = useMemo(() => {
    if (!isActive) return false;
    if (!persistOnBackground && appState !== 'active') return false;
    
    // Ensure minimum display time
    if (lastShownTime && Date.now() - lastShownTime < INDICATOR_CONFIG.MIN_DISPLAY_TIME) {
      return true;
    }
    
    return true;
  }, [isActive, appState, persistOnBackground, lastShownTime]);

  // Manage indicator visibility with proper timing
  useEffect(() => {
    if (shouldShowIndicator && !isVisible) {
      setIsVisible(true);
      setLastShownTime(Date.now());
    } else if (!shouldShowIndicator && isVisible && autoHide) {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, INDICATOR_CONFIG.HIDE_DELAY);
      
      return () => clearTimeout(hideTimer);
    }
  }, [shouldShowIndicator, isVisible, autoHide]);

  // Calculate responsive text truncation
  const getDisplayText = useCallback(() => {
    if (!recipeName) return { recipeName: '', stepInfo: '', timerText: null };
    
    const maxLength = screenData.width < 375 
      ? INDICATOR_CONFIG.TEXT_TRUNCATION.SMALL_SCREEN
      : INDICATOR_CONFIG.TEXT_TRUNCATION.NORMAL_SCREEN;
    
    const truncatedName = recipeName.length > maxLength 
      ? `${recipeName.substring(0, maxLength)}...` 
      : recipeName;
    
    return {
      recipeName: truncatedName,
      stepInfo: `Step ${currentStep} of ${totalSteps}`,
      timerText: timer?.isActive ? formatTimerDisplay(timer.remainingTime) : null
    };
  }, [recipeName, currentStep, totalSteps, timer, screenData.width]);

  // Memoize display data to prevent unnecessary re-renders
  const displayData = useMemo(() => {
    if (!isActive) return null;
    
    const textData = getDisplayText();
    
    return {
      ...textData,
      progress: Math.round(progress || 0),
      hasTimer: timer?.isActive || false,
      timerStatus: timer?.isActive ? (timer?.isPaused ? 'paused' : 'running') : 'inactive',
      urgentTimer: timer?.isActive && timer?.remainingTime <= 60, // Last minute warning
    };
  }, [isActive, getDisplayText, progress, timer]);

  // Navigation helpers
  const navigateToCooking = useCallback((navigation) => {
    if (!navigation || !isActive) return false;
    
    try {
      navigation.navigate('Recipes', {
        screen: 'CookingFlow',
        params: { 
          recipe: { title: recipeName },
          resumeSession: true 
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to navigate to cooking screen:', error);
      return false;
    }
  }, [isActive, recipeName]);

  // Indicator interaction handlers
  const handlePress = useCallback((navigation) => {
    if (displayData) {
      return navigateToCooking(navigation);
    }
    return false;
  }, [displayData, navigateToCooking]);

  const handleLongPress = useCallback(() => {
    // Future: Could open quick actions menu
    console.log('Long press on cooking indicator');
  }, []);

  // Force show/hide methods
  const forceShow = useCallback(() => {
    if (isActive) {
      setIsVisible(true);
      setLastShownTime(Date.now());
    }
  }, [isActive]);

  const forceHide = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Performance optimization: throttle timer updates
  const [throttledTimer, setThrottledTimer] = useState(timer);
  
  useEffect(() => {
    if (!timer?.isActive) {
      setThrottledTimer(timer);
      return;
    }
    
    const updateInterval = setInterval(() => {
      setThrottledTimer(prev => ({
        ...prev,
        remainingTime: timer.remainingTime
      }));
    }, customUpdateInterval);
    
    return () => clearInterval(updateInterval);
  }, [timer?.isActive, timer?.remainingTime, customUpdateInterval]);

  // Accessibility helpers
  const getAccessibilityLabel = useCallback(() => {
    if (!displayData) return '';
    
    const { recipeName, stepInfo, timerText } = displayData;
    let label = `Cooking ${recipeName}, ${stepInfo}`;
    
    if (timerText) {
      label += `, timer ${timerText}`;
      if (displayData.urgentTimer) {
        label += ', timer finishing soon';
      }
    }
    
    return label;
  }, [displayData]);

  const getAccessibilityHint = useCallback(() => {
    return 'Tap to return to cooking screen';
  }, []);

  // Return indicator state and methods
  return {
    // Visibility state
    isVisible: isVisible && isActive,
    shouldShow: shouldShowIndicator,
    
    // Display data
    displayData,
    accessibilityLabel: getAccessibilityLabel(),
    accessibilityHint: getAccessibilityHint(),
    
    // Screen info
    screenWidth: screenData.width,
    screenHeight: screenData.height,
    isSmallScreen: screenData.width < 375,
    
    // Interaction handlers
    onPress: handlePress,
    onLongPress: handleLongPress,
    
    // Control methods
    forceShow,
    forceHide,
    navigateToCooking,
    
    // Animation config
    enableAnimations,
    
    // Raw cooking session data (for advanced usage)
    rawCookingSession: cookingSession,
    
    // Status indicators
    hasActiveCookingSession: isActive,
    appIsActive: appState === 'active',
  };
}

export default useCookingIndicator;