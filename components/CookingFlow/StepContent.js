/**
 * StepContent Component
 * 
 * Displays cooking step content with sentence parsing and timing controls
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SentenceWithTiming } from './SentenceWithTiming';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { splitIntoSentences } from '../../utils/timingUtils';

export const StepContent = ({
  currentStep,
  currentStepIndex,
  sentenceTimers,
  onAdjustTimer,
  onStartTimer,
  onResetTimer,
  onStopTimer
}) => {
  const sentences = splitIntoSentences(currentStep?.content || 'No step content');

  return (
    <View style={styles.mainContent}>
      <ScrollView 
        style={styles.stepScrollView}
        contentContainerStyle={styles.stepScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sentencesContainer}>
          {sentences.map((sentence, sentenceIndex) => (
            <SentenceWithTiming
              key={sentenceIndex}
              sentence={sentence}
              sentenceIndex={sentenceIndex}
              currentStepIndex={currentStepIndex}
              sentenceTimers={sentenceTimers}
              onAdjustTimer={onAdjustTimer}
              onStartTimer={onStartTimer}
              onResetTimer={onResetTimer}
              onStopTimer={onStopTimer}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
});