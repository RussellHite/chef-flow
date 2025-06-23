/**
 * Cooking Session Utilities
 * 
 * Helper functions for cooking session management, validation, and persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  ACTIVE_SESSION: 'chef-flow-cooking-session',
  SESSION_HISTORY: 'chef-flow-cooking-history',
  SESSION_PREFERENCES: 'chef-flow-cooking-preferences'
};

// Session configuration
export const SESSION_CONFIG = {
  MAX_SESSION_AGE: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  AUTO_SAVE_INTERVAL: 5000, // Auto-save every 5 seconds
  MAX_HISTORY_ENTRIES: 50,   // Keep last 50 completed sessions
  TIMER_UPDATE_INTERVAL: 1000 // Update timer every second
};

/**
 * Validate cooking session data
 * @param {Object} sessionData - Session data to validate
 * @returns {boolean} - Whether session data is valid
 */
export function validateSessionData(sessionData) {
  if (!sessionData || typeof sessionData !== 'object') {
    return false;
  }
  
  // Required fields
  const requiredFields = ['sessionId', 'activeRecipe', 'recipeName', 'totalSteps'];
  for (const field of requiredFields) {
    if (!sessionData[field]) {
      return false;
    }
  }
  
  // Validate data types
  if (typeof sessionData.currentStep !== 'number' || sessionData.currentStep < 0) {
    return false;
  }
  
  if (typeof sessionData.totalSteps !== 'number' || sessionData.totalSteps <= 0) {
    return false;
  }
  
  if (sessionData.currentStep >= sessionData.totalSteps) {
    return false;
  }
  
  // Validate timestamps
  if (sessionData.startedAt && typeof sessionData.startedAt !== 'number') {
    return false;
  }
  
  if (sessionData.lastActiveAt && typeof sessionData.lastActiveAt !== 'number') {
    return false;
  }
  
  return true;
}

/**
 * Check if a session is expired
 * @param {Object} sessionData - Session data to check
 * @returns {boolean} - Whether session is expired
 */
export function isSessionExpired(sessionData) {
  if (!sessionData || !sessionData.lastActiveAt) {
    return true;
  }
  
  const sessionAge = Date.now() - sessionData.lastActiveAt;
  return sessionAge > SESSION_CONFIG.MAX_SESSION_AGE;
}

/**
 * Calculate session duration
 * @param {Object} sessionData - Session data
 * @returns {number} - Duration in milliseconds
 */
export function calculateSessionDuration(sessionData) {
  if (!sessionData || !sessionData.startedAt) {
    return 0;
  }
  
  const endTime = sessionData.completedAt || sessionData.lastActiveAt || Date.now();
  return endTime - sessionData.startedAt;
}

/**
 * Format duration for display
 * @param {number} duration - Duration in milliseconds
 * @returns {string} - Formatted duration string
 */
export function formatDuration(duration) {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Calculate timer remaining time
 * @param {Object} timerState - Timer state object
 * @returns {number} - Remaining time in seconds
 */
export function calculateTimerRemaining(timerState) {
  if (!timerState || !timerState.isActive || !timerState.expiresAt) {
    return timerState?.remainingTime || 0;
  }
  
  const remaining = Math.max(0, Math.floor((timerState.expiresAt - Date.now()) / 1000));
  return remaining;
}

/**
 * Format timer time for display
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string (MM:SS or H:MM:SS)
 */
export function formatTimerDisplay(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Save session to history
 * @param {Object} sessionData - Completed session data
 */
export async function saveSessionToHistory(sessionData) {
  try {
    const historyKey = STORAGE_KEYS.SESSION_HISTORY;
    const existingHistory = await AsyncStorage.getItem(historyKey);
    let history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Add new session to beginning of history
    const sessionSummary = {
      sessionId: sessionData.sessionId,
      recipeId: sessionData.activeRecipe,
      recipeName: sessionData.recipeName,
      totalSteps: sessionData.totalSteps,
      completedSteps: sessionData.completedSteps?.length || 0,
      startedAt: sessionData.startedAt,
      completedAt: sessionData.completedAt || Date.now(),
      duration: calculateSessionDuration(sessionData),
      wasCompleted: sessionData.status === 'completed'
    };
    
    history.unshift(sessionSummary);
    
    // Limit history size
    if (history.length > SESSION_CONFIG.MAX_HISTORY_ENTRIES) {
      history = history.slice(0, SESSION_CONFIG.MAX_HISTORY_ENTRIES);
    }
    
    await AsyncStorage.setItem(historyKey, JSON.stringify(history));
    console.log('Saved cooking session to history:', sessionSummary.recipeName);
    
  } catch (error) {
    console.warn('Failed to save session to history:', error);
  }
}

/**
 * Get cooking session history
 * @returns {Promise<Array>} - Array of session summaries
 */
export async function getCookingHistory() {
  try {
    const historyKey = STORAGE_KEYS.SESSION_HISTORY;
    const history = await AsyncStorage.getItem(historyKey);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.warn('Failed to get cooking history:', error);
    return [];
  }
}

/**
 * Clear cooking session history
 */
export async function clearCookingHistory() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_HISTORY);
    console.log('Cleared cooking session history');
  } catch (error) {
    console.warn('Failed to clear cooking history:', error);
  }
}

/**
 * Get session preferences
 * @returns {Promise<Object>} - User preferences for cooking sessions
 */
export async function getSessionPreferences() {
  try {
    const prefs = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_PREFERENCES);
    return prefs ? JSON.parse(prefs) : {
      autoSaveEnabled: true,
      showSessionRecovery: true,
      timerSoundEnabled: true,
      sessionTimeoutHours: 24
    };
  } catch (error) {
    console.warn('Failed to get session preferences:', error);
    return {};
  }
}

/**
 * Save session preferences
 * @param {Object} preferences - User preferences to save
 */
export async function saveSessionPreferences(preferences) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION_PREFERENCES, JSON.stringify(preferences));
    console.log('Saved session preferences');
  } catch (error) {
    console.warn('Failed to save session preferences:', error);
  }
}

/**
 * Generate session statistics
 * @param {Array} history - Cooking session history
 * @returns {Object} - Session statistics
 */
export function generateSessionStats(history) {
  if (!history || history.length === 0) {
    return {
      totalSessions: 0,
      completedSessions: 0,
      totalCookingTime: 0,
      averageSessionTime: 0,
      completionRate: 0,
      favoriteRecipes: []
    };
  }
  
  const totalSessions = history.length;
  const completedSessions = history.filter(s => s.wasCompleted).length;
  const totalCookingTime = history.reduce((total, s) => total + (s.duration || 0), 0);
  const averageSessionTime = totalCookingTime / totalSessions;
  const completionRate = (completedSessions / totalSessions) * 100;
  
  // Find favorite recipes (most cooked)
  const recipeCounts = {};
  history.forEach(session => {
    const key = session.recipeId;
    recipeCounts[key] = (recipeCounts[key] || 0) + 1;
  });
  
  const favoriteRecipes = Object.entries(recipeCounts)
    .map(([recipeId, count]) => {
      const session = history.find(s => s.recipeId === recipeId);
      return {
        recipeId,
        recipeName: session?.recipeName || 'Unknown Recipe',
        cookCount: count
      };
    })
    .sort((a, b) => b.cookCount - a.cookCount)
    .slice(0, 5);
  
  return {
    totalSessions,
    completedSessions,
    totalCookingTime,
    averageSessionTime,
    completionRate,
    favoriteRecipes
  };
}

/**
 * Create session summary for display
 * @param {Object} sessionData - Current session data
 * @returns {Object} - Display-friendly session summary
 */
export function createSessionSummary(sessionData) {
  if (!sessionData) {
    return null;
  }
  
  const duration = calculateSessionDuration(sessionData);
  const progress = sessionData.totalSteps > 0 ? 
    (sessionData.completedSteps?.length || 0) / sessionData.totalSteps : 0;
  
  return {
    recipeName: sessionData.recipeName,
    currentStep: sessionData.currentStep + 1, // Convert to 1-based for display
    totalSteps: sessionData.totalSteps,
    progress: Math.round(progress * 100),
    duration: formatDuration(duration),
    hasActiveTimer: sessionData.timer?.isActive || false,
    timerDisplay: sessionData.timer?.isActive ? 
      formatTimerDisplay(calculateTimerRemaining(sessionData.timer)) : null
  };
}