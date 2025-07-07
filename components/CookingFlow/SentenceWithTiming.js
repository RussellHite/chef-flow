/**
 * SentenceWithTiming Component
 * 
 * Individual sentence display with timing controls and timer management
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TimerService from '../../services/TimerService';
import { detectTiming } from '../../utils/timingUtils';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const SentenceWithTiming = ({
  sentence,
  sentenceIndex,
  currentStepIndex,
  sentenceTimers,
  onAdjustTimer,
  onStartTimer,
  onResetTimer,
  onStopTimer
}) => {
  const timingInfo = detectTiming(sentence);
  
  // Use manually adjusted time if available, otherwise use detected time
  const currentTime = sentenceTimers[sentenceIndex] !== undefined 
    ? sentenceTimers[sentenceIndex] 
    : timingInfo?.timeInMinutes;
    
  const timerId = `step-${currentStepIndex}-sentence-${sentenceIndex}`;
  const activeTimer = TimerService.getTimer(timerId);

  return (
    <View style={styles.sentenceWithTiming}>
      <Text style={styles.stepText}>
        {sentence}
      </Text>
      
      {timingInfo && (
        <View style={[
          styles.timerBanner, 
          activeTimer?.isOverflow && styles.timerBannerOverflow
        ]}>
          <View style={styles.timingControlsContainer}>
            {!activeTimer && (
              <>
                <TouchableOpacity 
                  style={styles.timingButton}
                  onPress={() => onAdjustTimer(sentenceIndex, -1)}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                
                <Text style={styles.timingValue}>
                  {currentTime} min
                </Text>
                
                <TouchableOpacity 
                  style={styles.timingButton}
                  onPress={() => onAdjustTimer(sentenceIndex, 1)}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </>
            )}
            
            {activeTimer && (
              <Text style={styles.timingValue}>
                {TimerService.formatTime(activeTimer.remainingTime)}
              </Text>
            )}
            
            <TouchableOpacity 
              style={[
                styles.startTimerButtonSmall,
                activeTimer?.isRunning && styles.pauseTimerButton
              ]}
              onPress={() => onStartTimer(sentenceIndex)}
            >
              <Text style={styles.startTimerTextSmall}>
                {activeTimer 
                  ? (activeTimer.isRunning ? 'Pause' : 'Resume')
                  : 'Start Timer'
                }
              </Text>
            </TouchableOpacity>
            
            {activeTimer && (
              <>
                <TouchableOpacity 
                  style={styles.resetTimerButton}
                  onPress={() => onResetTimer(sentenceIndex)}
                >
                  <Ionicons name="refresh" size={16} color={colors.text} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.stopTimerButton}
                  onPress={() => onStopTimer(sentenceIndex)}
                >
                  <Ionicons name="stop" size={16} color={colors.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  timerBannerOverflow: {
    backgroundColor: '#FFE5E5',
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
  pauseTimerButton: {
    backgroundColor: colors.warning,
  },
  resetTimerButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopTimerButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
});