/**
 * TimerControls Component
 * 
 * Timer adjustment and control UI for cooking step sentences
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const TimerControls = ({
  sentenceIndex,
  currentTime,
  activeTimer,
  onAdjustTimer,
  onStartTimer,
  onResetTimer,
  onStopTimer
}) => {
  const isTimerActive = activeTimer?.isActive && activeTimer?.stepId === `${sentenceIndex}`;
  const timerDisplay = isTimerActive ? activeTimer.formattedTime : `${currentTime}:00`;

  return (
    <View style={styles.timerControls}>
      {/* Timer adjustment buttons */}
      <View style={styles.adjustmentControls}>
        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => onAdjustTimer(sentenceIndex, -1)}
        >
          <Ionicons name="remove" size={16} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.timerValue}>{currentTime} min</Text>
        
        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => onAdjustTimer(sentenceIndex, 1)}
        >
          <Ionicons name="add" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Timer display and controls */}
      <View style={styles.timerDisplay}>
        <Text style={styles.timerText}>{timerDisplay}</Text>
        
        <View style={styles.timerActions}>
          {!isTimerActive ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => onStartTimer(sentenceIndex)}
            >
              <Ionicons name="play" size={16} color={colors.surface} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.resetButton]}
                onPress={() => onResetTimer(sentenceIndex)}
              >
                <Ionicons name="refresh" size={16} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.stopButton]}
                onPress={() => onStopTimer(sentenceIndex)}
              >
                <Ionicons name="stop" size={16} color={colors.surface} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerControls: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adjustmentControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  timerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 60,
    textAlign: 'center',
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerText: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 24,
  },
  timerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: colors.success,
  },
  resetButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stopButton: {
    backgroundColor: colors.error,
  },
});