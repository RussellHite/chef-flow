/**
 * CookingIndicator Component
 * 
 * Sticky cooking progress indicator that appears above the navigation bar
 * during active cooking sessions. Shows recipe name, step progress, and timer.
 * 
 * GitHub Issue #7: Sticky Cooking Progress Indicator
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationState } from '@react-navigation/native';
import { useCookingSession } from '../hooks/useCookingSession';
import { formatTimerDisplay } from '../utils/cookingSessionUtils';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';

const INDICATOR_HEIGHT = 48;
const ANIMATION_DURATION = 300;

export default function CookingIndicator({ navigation, onPress }) {
  const insets = useSafeAreaInsets();
  
  // Get current navigation state to determine if on cooking screens
  const navigationState = useNavigationState(state => state);
  
  // Get cooking session data with defensive destructuring
  const cookingSession = useCookingSession();
  const { 
    isActive = false, 
    recipeName = '', 
    currentStep = 0, 
    totalSteps = 0, 
    progress = 0, 
    timer = {} 
  } = cookingSession || {};
  
  // Debug logging for timer (commented out to reduce noise)
  // if (timer.isActive) {
  //   console.log('CookingIndicator - Active timer:', timer);
  // }

  // Check if user is currently on a cooking screen
  const isOnCookingScreen = () => {
    if (!navigationState) return false;
    
    // Get the current route name
    const getCurrentRouteName = (state) => {
      if (!state || !state.routes) return null;
      
      const route = state.routes[state.index];
      if (route.state) {
        // If the route has nested state (like stack navigator), recurse
        return getCurrentRouteName(route.state);
      }
      return route.name;
    };
    
    const currentRouteName = getCurrentRouteName(navigationState);
    
    // Hide indicator on cooking-related screens
    const cookingScreens = ['CookingFlow', 'CookRecipe'];
    return cookingScreens.includes(currentRouteName);
  };

  // Animation states
  const [slideAnim] = useState(new Animated.Value(0));
  const [isVisible, setIsVisible] = useState(false);
  
  // Screen dimensions for responsive design
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Update screen dimensions on orientation change
  useEffect(() => {
    const onChange = (result) => {
      setScreenData(result.window);
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  // Show/hide indicator based on cooking session status and current screen
  useEffect(() => {
    const shouldShowIndicator = isActive && !isOnCookingScreen();
    
    if (shouldShowIndicator && !isVisible) {
      // Show indicator
      setIsVisible(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    } else if ((!isActive || isOnCookingScreen()) && isVisible) {
      // Hide indicator
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [isActive, isVisible, slideAnim, navigationState]);

  // Don't render if no active session or on cooking screens
  if ((!isActive && !isVisible) || isOnCookingScreen()) {
    return null;
  }

  // Calculate responsive text truncation
  const getDisplayText = () => {
    const maxRecipeNameLength = screenData.width < 375 ? 20 : 25; // Shorter on small screens
    const truncatedName = recipeName.length > maxRecipeNameLength 
      ? `${recipeName.substring(0, maxRecipeNameLength)}...` 
      : recipeName;
    
    return {
      recipeName: truncatedName,
      stepInfo: `Step ${currentStep} of ${totalSteps}`,
      timerText: timer.isActive ? formatTimerDisplay(timer.remainingTime) : null
    };
  };

  const { recipeName: displayName, stepInfo, timerText } = getDisplayText();

  // Handle tap to navigate to cooking screen
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation && isActive) {
      // Navigate to cooking flow screen with resume flag
      // The CookingFlowScreen should detect the active session and resume
      navigation.navigate('Recipes', {
        screen: 'CookingFlow',
        params: { 
          resumeSession: true,
          recipeTitle: recipeName // Just pass the title for reference
        }
      });
    }
  };

  // Calculate indicator position (above tab bar)
  const indicatorBottom = Platform.select({
    ios: insets.bottom + 49, // iOS tab bar height
    android: insets.bottom + 56, // Android tab bar height
  });

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [INDICATOR_HEIGHT + 10, 0], // Slide up from below
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: indicatorBottom,
          transform: [{ translateY }],
          opacity,
          width: screenData.width,
        }
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        style={[styles.indicator, { width: screenData.width - 32 }]}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Cooking ${displayName}, ${stepInfo}${timerText ? `, timer ${timerText}` : ''}`}
        accessibilityHint="Tap to return to cooking screen"
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                { width: `${progress}%` }
              ]}
            />
          </View>
        </View>

        {/* Content Row */}
        <View style={styles.contentRow}>
          {/* Recipe and Step Info */}
          <View style={styles.textContainer}>
            <Text style={styles.recipeName} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={styles.stepRow}>
              <Text style={styles.stepText}>{stepInfo}</Text>
              {timerText && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <View style={styles.timerContainer}>
                    <Ionicons 
                      name="timer" 
                      size={14} 
                      color={colors.primary} 
                      style={styles.timerIcon}
                    />
                    <Text style={styles.timerText}>{timerText}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Action Icon */}
          <View style={styles.iconContainer}>
            <Ionicons 
              name="chevron-up" 
              size={20} 
              color={colors.textSecondary} 
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000, // Above content, below modals
    paddingHorizontal: 16,
  },
  
  indicator: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: INDICATOR_HEIGHT,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  progressContainer: {
    marginBottom: 6,
  },
  
  progressBarBackground: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32, // Ensure minimum touch target
  },
  
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  
  recipeName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 18,
    marginBottom: 2,
  },
  
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  
  stepText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  
  separator: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: 6,
    fontSize: 13,
  },
  
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  timerIcon: {
    marginRight: 3,
  },
  
  timerText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  
  iconContainer: {
    padding: 4, // Extra touch area
    minWidth: 28,
    alignItems: 'center',
  },
});

// Export additional utilities for integration
export { INDICATOR_HEIGHT, ANIMATION_DURATION };