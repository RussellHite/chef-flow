/**
 * CookingSessionTest Component
 * 
 * Comprehensive test suite for Global Cooking Session Management
 * Tests all functionality outlined in GitHub Issue #6
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Alert,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { useCooking, COOKING_ACTIONS } from '../contexts/CookingContext';
import { useCookingSession } from '../hooks/useCookingSession';
import { 
  STORAGE_KEYS,
  validateSessionData,
  isSessionExpired,
  formatTimerDisplay 
} from '../utils/cookingSessionUtils';

export default function CookingSessionTest({ navigation }) {
  const [testResults, setTestResults] = useState({});
  const [storageData, setStorageData] = useState(null);
  const [testRecipe, setTestRecipe] = useState({
    id: 'test-recipe-001',
    title: 'Test Recipe for Session Management',
    steps: [
      { id: 'step1', content: 'Test Step 1: Prepare ingredients' },
      { id: 'step2', content: 'Test Step 2: Cook for 5 minutes' },
      { id: 'step3', content: 'Test Step 3: Add seasoning' },
      { id: 'step4', content: 'Test Step 4: Simmer for 10 minutes' },
      { id: 'step5', content: 'Test Step 5: Serve and enjoy' }
    ]
  });

  // Get both raw context and convenient hook
  const rawContext = useCooking();
  const cookingSession = useCookingSession();
  
  const runTest = async (testName, testFunc) => {
    try {
      const result = await testFunc();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, message: 'Passed', result }
      }));
      return true;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, message: error.message, error }
      }));
      return false;
    }
  };

  // Test 1: Context API and State Management
  const testContextAPI = async () => {
    console.log('Testing Context API...');
    
    // Test 1.1: Context Creation
    await runTest('1.1_ContextCreation', () => {
      if (!rawContext) throw new Error('Context not available');
      if (!rawContext.cookingState) throw new Error('cookingState not found');
      if (!rawContext.dispatch) throw new Error('dispatch not found');
      return 'Context properly created';
    });

    // Test 1.2: Initial State Structure
    await runTest('1.2_StateStructure', () => {
      const requiredFields = [
        'sessionId', 'isActiveCookingSession', 'activeRecipe',
        'recipeName', 'totalSteps', 'currentStep', 'timer'
      ];
      
      for (const field of requiredFields) {
        if (!(field in rawContext.cookingState)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      return 'All required state fields present';
    });

    // Test 1.3: Dispatch Actions
    await runTest('1.3_DispatchActions', () => {
      // Verify all actions exist
      const requiredActions = [
        'START_COOKING', 'END_COOKING', 'UPDATE_STEP', 
        'START_TIMER', 'UPDATE_TIMER', 'STOP_TIMER'
      ];
      
      for (const action of requiredActions) {
        if (!COOKING_ACTIONS[action]) {
          throw new Error(`Missing action: ${action}`);
        }
      }
      return 'All dispatch actions available';
    });
  };

  // Test 2: Persistence Layer
  const testPersistence = async () => {
    console.log('Testing Persistence...');
    
    // Test 2.1: Storage During Session
    await runTest('2.1_StorageDuringSession', async () => {
      if (!cookingSession.isActive) {
        return 'Skipped - No active session (start session first)';
      }
      
      const stored = await AsyncStorage.getItem('chef-flow-cooking-session');
      if (!stored) throw new Error('Session not stored');
      
      const parsed = JSON.parse(stored);
      if (!validateSessionData(parsed)) {
        throw new Error('Stored session data is invalid');
      }
      
      setStorageData(parsed);
      return 'Session properly stored';
    });

    // Test 2.2: Session Validation
    await runTest('2.2_SessionValidation', () => {
      if (!storageData) {
        return 'Skipped - No storage data (requires active session)';
      }
      
      const isValid = validateSessionData(storageData);
      if (!isValid) throw new Error('Session validation failed');
      
      const expired = isSessionExpired(storageData);
      return `Session valid: ${isValid}, Expired: ${expired}`;
    });
  };

  // Test 3: Navigation Integration
  const testNavigation = async () => {
    console.log('Testing Navigation...');
    
    // Test 3.1: Programmatic Navigation
    await runTest('3.1_ProgrammaticNavigation', () => {
      if (!cookingSession.goToStep) {
        throw new Error('goToStep method not available');
      }
      
      // Test navigation bounds
      const canNavigate = cookingSession.canGoNext || cookingSession.canGoPrevious;
      const sessionStatus = cookingSession.isActive ? 'active' : 'inactive';
      return `Navigation methods available. Session: ${sessionStatus}, Can navigate: ${canNavigate}`;
    });

    // Test 3.2: Step Progress
    await runTest('3.2_StepProgress', () => {
      const progress = cookingSession.progress;
      if (typeof progress !== 'number') {
        throw new Error('Progress not calculated');
      }
      
      const sessionInfo = cookingSession.isActive ? 
        `Step ${cookingSession.currentStep}/${cookingSession.totalSteps}` : 
        'No active session';
      return `Progress: ${progress}% (${sessionInfo})`;
    });
  };

  // Test 4: Timer System
  const testTimerSystem = async () => {
    console.log('Testing Timer System...');
    
    // Test 4.1: Timer State
    await runTest('4.1_TimerState', () => {
      const timer = rawContext.cookingState.timer;
      if (!timer) throw new Error('Timer state not found');
      
      const requiredTimerFields = [
        'isActive', 'isPaused', 'remainingTime', 'duration'
      ];
      
      for (const field of requiredTimerFields) {
        if (!(field in timer)) {
          throw new Error(`Missing timer field: ${field}`);
        }
      }
      
      return `Timer active: ${timer.isActive}, Time: ${formatTimerDisplay(timer.remainingTime)}`;
    });

    // Test 4.2: Timer Operations
    await runTest('4.2_TimerOperations', () => {
      const hasTimerOps = !!(
        cookingSession.startStepTimer &&
        cookingSession.stopStepTimer &&
        cookingSession.toggleTimer
      );
      
      if (!hasTimerOps) throw new Error('Timer operations not available');
      return 'All timer operations available';
    });
  };

  // Test 5: Performance and Compatibility
  const testPerformance = async () => {
    console.log('Testing Performance...');
    
    // Test 5.1: Single Session Constraint
    await runTest('5.1_SingleSessionConstraint', () => {
      // Try to start another session while one is active
      if (cookingSession.isActive) {
        const secondStart = cookingSession.startCookingSession({
          id: 'test-2',
          title: 'Second Recipe',
          steps: []
        });
        
        if (secondStart) throw new Error('Multiple sessions allowed!');
        return 'Single session constraint working';
      }
      return 'No active session - constraint not testable (start session to test)';
    });

    // Test 5.2: Memory Usage
    await runTest('5.2_MemoryUsage', () => {
      const stateSize = JSON.stringify(rawContext.cookingState).length;
      const reasonable = stateSize < 10000; // 10KB limit
      
      if (!reasonable) throw new Error('State size too large');
      return `State size: ${stateSize} bytes (limit: 10KB)`;
    });
  };

  // Run all tests
  const runAllTests = async () => {
    setTestResults({});
    
    try {
      await testContextAPI();
      await testPersistence();
      await testNavigation();
      await testTimerSystem();
      await testPerformance();
      
      Alert.alert('Tests Complete', 'Check the results below. Some tests may be skipped if no active cooking session.');
    } catch (error) {
      console.error('Test execution error:', error);
      Alert.alert('Test Error', 'An error occurred while running tests. Check console for details.');
    }
  };

  // Helper functions for manual testing
  const startTestSession = () => {
    const success = cookingSession.startCookingSession(testRecipe);
    if (success) {
      Alert.alert('Success', 'Test cooking session started');
    } else {
      Alert.alert('Failed', 'Could not start cooking session');
    }
  };

  const testStepNavigation = () => {
    if (!cookingSession.isActive) {
      Alert.alert('Error', 'Start a cooking session first');
      return;
    }
    
    // Test next step
    cookingSession.nextStep();
    Alert.alert('Navigation Test', `Moved to step ${cookingSession.currentStep}`);
  };

  const testTimer = () => {
    if (!cookingSession.isActive) {
      Alert.alert('Error', 'Start a cooking session first');
      return;
    }
    
    const success = cookingSession.startStepTimer(30); // 30 second timer
    if (success) {
      Alert.alert('Timer Started', '30 second timer is running');
    }
  };

  const testSessionEnd = async () => {
    if (!cookingSession.isActive) {
      Alert.alert('Error', 'No active session to end');
      return;
    }
    
    const success = await cookingSession.endCookingSession(true);
    if (success) {
      Alert.alert('Session Ended', 'Cooking session completed and saved');
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem('chef-flow-cooking-session');
      await AsyncStorage.removeItem('chef-flow-cooking-history');
      rawContext.dispatch({ type: COOKING_ACTIONS.END_COOKING });
      Alert.alert('Cleared', 'All cooking data cleared');
      setTestResults({});
    } catch (error) {
      Alert.alert('Error', 'Failed to clear data');
    }
  };

  // Render test result
  const renderTestResult = (testName, result) => {
    const success = result?.success;
    const icon = success ? 'checkmark-circle' : 'close-circle';
    const color = success ? colors.success || '#4CAF50' : colors.error || '#FF6B6B';
    
    return (
      <View key={testName} style={styles.testResult}>
        <View style={styles.testHeader}>
          <Ionicons name={icon} size={20} color={color} />
          <Text style={[styles.testName, { color }]}>
            {testName.replace(/_/g, ' ')}
          </Text>
        </View>
        <Text style={styles.testMessage}>
          {result?.message || 'Not tested'}
        </Text>
        {result?.result && (
          <Text style={styles.testDetail}>{result.result}</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cooking Session Test Suite</Text>
      <Text style={styles.subtitle}>GitHub Issue #6 Test Plan</Text>
      
      {/* Current Session Status */}
      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>Current Session Status</Text>
        <Text style={styles.statusText}>
          Active: {cookingSession.isActive ? 'Yes' : 'No'}
        </Text>
        {cookingSession.isActive && (
          <>
            <Text style={styles.statusText}>
              Recipe: {cookingSession.recipeName}
            </Text>
            <Text style={styles.statusText}>
              Step: {cookingSession.currentStep} of {cookingSession.totalSteps}
            </Text>
            <Text style={styles.statusText}>
              Progress: {cookingSession.progress}%
            </Text>
            {cookingSession.timer.isActive && (
              <Text style={styles.statusText}>
                Timer: {formatTimerDisplay(cookingSession.timer.remainingTime)}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Manual Test Controls */}
      <View style={styles.controlsSection}>
        <Text style={styles.sectionTitle}>Manual Test Controls</Text>
        
        <View style={styles.buttonGrid}>
          <TouchableOpacity 
            style={[styles.testButton, cookingSession.isActive && styles.disabledButton]}
            onPress={startTestSession}
            disabled={cookingSession.isActive}
          >
            <Text style={styles.buttonText}>Start Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, !cookingSession.isActive && styles.disabledButton]}
            onPress={testStepNavigation}
            disabled={!cookingSession.isActive}
          >
            <Text style={styles.buttonText}>Test Navigation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, !cookingSession.isActive && styles.disabledButton]}
            onPress={testTimer}
            disabled={!cookingSession.isActive}
          >
            <Text style={styles.buttonText}>Start Timer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, !cookingSession.isActive && styles.disabledButton]}
            onPress={testSessionEnd}
            disabled={!cookingSession.isActive}
          >
            <Text style={styles.buttonText}>End Session</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Automated Tests */}
      <View style={styles.automatedSection}>
        <Text style={styles.sectionTitle}>Automated Tests</Text>
        
        <TouchableOpacity 
          style={styles.runAllButton}
          onPress={runAllTests}
        >
          <Ionicons name="play-circle" size={24} color={colors.surface} />
          <Text style={styles.runAllButtonText}>Run All Tests</Text>
        </TouchableOpacity>
        
        {/* Test Results */}
        <View style={styles.testResults}>
          {Object.entries(testResults).map(([testName, result]) => 
            renderTestResult(testName, result)
          )}
        </View>
      </View>

      {/* Storage Data Viewer */}
      {storageData && (
        <View style={styles.storageSection}>
          <Text style={styles.sectionTitle}>Storage Data</Text>
          <ScrollView horizontal style={styles.jsonViewer}>
            <Text style={styles.jsonText}>
              {JSON.stringify(storageData, null, 2)}
            </Text>
          </ScrollView>
        </View>
      )}

      {/* Utility Actions */}
      <View style={styles.utilitySection}>
        <TouchableOpacity 
          style={[styles.utilityButton, styles.dangerButton]}
          onPress={clearAllData}
        >
          <Ionicons name="trash" size={20} color={colors.surface} />
          <Text style={styles.utilityButtonText}>Clear All Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.utilityButton}
          onPress={() => navigation.navigate('CookingDemo')}
        >
          <Ionicons name="flask" size={20} color={colors.surface} />
          <Text style={styles.utilityButtonText}>Open Demo UI</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 8,
  },
  
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 16,
  },
  
  statusCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  
  statusText: {
    ...typography.body,
    color: colors.text,
    marginBottom: 4,
  },
  
  controlsSection: {
    marginBottom: 24,
  },
  
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  testButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 140,
    alignItems: 'center',
  },
  
  disabledButton: {
    opacity: 0.5,
  },
  
  buttonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  
  automatedSection: {
    marginBottom: 24,
  },
  
  runAllButton: {
    backgroundColor: colors.success || '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  
  runAllButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  
  testResults: {
    gap: 12,
  },
  
  testResult: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  
  testName: {
    ...typography.body,
    fontWeight: '600',
  },
  
  testMessage: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  
  testDetail: {
    ...typography.caption,
    color: colors.text,
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  storageSection: {
    marginBottom: 24,
  },
  
  jsonViewer: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 12,
    maxHeight: 200,
  },
  
  jsonText: {
    ...typography.caption,
    color: colors.text,
    fontFamily: 'monospace',
  },
  
  utilitySection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  
  utilityButton: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 6,
  },
  
  dangerButton: {
    backgroundColor: colors.error || '#FF6B6B',
  },
  
  utilityButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});