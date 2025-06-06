import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

export default function CookingFlowScreen({ route, navigation }) {
  const { recipe } = route.params;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [readyByTime, setReadyByTime] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [timerValue, setTimerValue] = useState(0);

  const currentStep = recipe.steps[currentStepIndex];
  const totalSteps = recipe.steps.length;

  useEffect(() => {
    navigation.setOptions({
      title: 'Cooking',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.surface} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    calculateTimes();
    setSentenceTimers({}); // Reset timers when step changes
  }, [recipe, currentStepIndex]);

  const calculateTimes = () => {
    // Calculate total remaining time from current step onwards
    const remainingMinutes = recipe.steps.slice(currentStepIndex).reduce((total, step) => {
      if (step.timing) {
        const timeMatch = step.timing.match(/(\d+)/);
        return total + (timeMatch ? parseInt(timeMatch[1]) : 0);
      }
      return total;
    }, 0);

    // Calculate ready by time
    const now = new Date();
    const readyTime = new Date(now.getTime() + remainingMinutes * 60000);
    
    const readyTimeString = readyTime.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    setReadyByTime(readyTimeString);
    
    // Format time remaining
    if (remainingMinutes > 60) {
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      setTimeRemaining(`${hours}h ${minutes}m remaining`);
    } else {
      setTimeRemaining(`${remainingMinutes}m remaining`);
    }
  };

  const detectTiming = (sentence) => {
    if (!sentence) return null;
    
    // Timing patterns to match
    const timingPatterns = [
      // "cook for 20 minutes", "bake for 1 hour", "simmer for 5-10 minutes"
      /(\w+\s+for\s+)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i,
      // "cook 20 minutes", "bake 30 mins"
      /(\w+\s+)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i,
      // "for 15 minutes", "for 1 hour"
      /(for\s+)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i,
      // "15 minutes", "1 hour" (standalone)
      /^(\s*)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i
    ];
    
    for (const pattern of timingPatterns) {
      const match = sentence.match(pattern);
      if (match) {
        const timeValue = match[2];
        const timeUnit = match[3];
        const beforeTime = match[1];
        
        // Convert to minutes for consistency
        let timeInMinutes;
        if (timeValue.includes('-')) {
          // Handle ranges like "5-10"
          const [min, max] = timeValue.split('-').map(Number);
          timeInMinutes = Math.round((min + max) / 2);
        } else {
          timeInMinutes = parseInt(timeValue);
        }
        
        // Convert hours to minutes
        if (timeUnit.toLowerCase().startsWith('hour') || timeUnit.toLowerCase().startsWith('hr')) {
          timeInMinutes *= 60;
        }
        
        return {
          originalTime: timeValue,
          timeInMinutes,
          timeUnit,
          beforeTime,
          fullMatch: match[0],
          sentence
        };
      }
    }
    
    return null;
  };

  const [sentenceTimers, setSentenceTimers] = useState({});

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Recipe completed - navigate to home screen
      navigation.navigate('Home');
    }
  };

  const adjustSentenceTimer = (sentenceIndex, delta) => {
    setSentenceTimers(prev => {
      const sentences = splitIntoSentences(currentStep?.content || '');
      const sentence = sentences[sentenceIndex];
      const timingInfo = detectTiming(sentence);
      
      if (!timingInfo) return prev;
      
      const currentTime = prev[sentenceIndex] || timingInfo.timeInMinutes;
      const newTime = Math.max(1, currentTime + delta);
      
      return {
        ...prev,
        [sentenceIndex]: newTime
      };
    });
  };

  const handleStartTimer = (sentenceIndex) => {
    const currentTime = sentenceTimers[sentenceIndex];
    // TODO: Implement timer functionality
    console.log(`Starting timer for ${currentTime} minutes`);
  };

  const splitIntoSentences = (text) => {
    if (!text) return [];
    
    // Split by periods, exclamation marks, or question marks, but keep the punctuation
    const sentences = text.split(/([.!?]+)/)
      .reduce((acc, part, index, array) => {
        if (index % 2 === 0) {
          // This is the sentence content
          const punctuation = array[index + 1] || '';
          const sentence = (part + punctuation).trim();
          if (sentence.length > 0) {
            acc.push(sentence);
          }
        }
        return acc;
      }, []);
    
    // If no sentences were found (no punctuation), return the original text
    return sentences.length > 0 ? sentences : [text];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
      </View>

      {/* Ready By Info */}
      <View style={styles.readyBySection}>
        <Text style={styles.readyByText}>
          Ready by {readyByTime} ({timeRemaining})
        </Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <Text style={styles.stepIndicatorText}>
          STEP {currentStepIndex + 1} OF {totalSteps}
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView 
          style={styles.stepScrollView}
          contentContainerStyle={styles.stepScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sentencesContainer}>
            {splitIntoSentences(currentStep?.content || 'No step content').map((sentence, sentenceIndex) => {
              const timingInfo = detectTiming(sentence);
              const currentTime = sentenceTimers[sentenceIndex] || timingInfo?.timeInMinutes;
              
              return (
                <View key={sentenceIndex} style={styles.sentenceWithTiming}>
                  <Text style={styles.stepText}>
                    {sentence}
                  </Text>
                  
                  {timingInfo && (
                    <View style={styles.timerBanner}>
                      <View style={styles.timingControlsContainer}>
                        <TouchableOpacity 
                          style={styles.timingButton}
                          onPress={() => adjustSentenceTimer(sentenceIndex, -1)}
                        >
                          <Ionicons name="remove" size={16} color={colors.text} />
                        </TouchableOpacity>
                        
                        <Text style={styles.timingValue}>
                          {currentTime} min
                        </Text>
                        
                        <TouchableOpacity 
                          style={styles.timingButton}
                          onPress={() => adjustSentenceTimer(sentenceIndex, 1)}
                        >
                          <Ionicons name="add" size={16} color={colors.text} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.startTimerButtonSmall}
                          onPress={() => handleStartTimer(sentenceIndex)}
                        >
                          <Text style={styles.startTimerTextSmall}>Start Timer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>


      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          onPress={handlePreviousStep}
          style={[styles.navButton, styles.secondaryButton]}
          disabled={currentStepIndex === 0}
        >
          <Text style={[styles.navButtonText, styles.secondaryButtonText]}>
            Previous Step
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleNextStep}
          style={[styles.navButton, styles.primaryButton]}
        >
          <Text style={[styles.navButtonText, styles.primaryButtonText]}>
            {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next Step'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  recipeTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'left',
  },
  readyBySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  readyByText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stepIndicator: {
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepIndicatorText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepScrollView: {
    flex: 1,
  },
  stepScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  sentencesContainer: {
    gap: 16,
  },
  sentenceWithTiming: {
    marginBottom: 6,
  },
  stepText: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'left',
    lineHeight: 32,
    fontWeight: '400',
  },
  timerBanner: {
    backgroundColor: '#E5F7F0',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  timingControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timingButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timingValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  startTimerButtonSmall: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  startTimerTextSmall: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  navButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.text,
  },
  primaryButtonText: {
    color: colors.surface,
  },
  headerButton: {
    padding: 8,
  },
});