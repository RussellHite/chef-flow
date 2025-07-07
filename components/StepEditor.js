import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
// import DebugText from './DebugText'; // Removed - causing React child errors
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';
import { 
  splitIntoSentences, 
  detectTiming, 
  updateTimingInSentence,
  clampTimeValue,
  convertMinutesToDisplayFormat
} from '../utils/timingUtils';

export default function StepEditor({ 
  step, 
  index, 
  onUpdate, 
  onDelete, 
  onAddAfter, 
  onReorder,
  isFirst,
  isLast,
  ingredients 
}) {
  const [isEditing, setIsEditing] = useState(!step.content);
  const [content, setContent] = useState(step.content);
  const [timing, setTiming] = useState(step.timing || '');
  const [timingControls, setTimingControls] = useState({});

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Step content cannot be empty');
      return;
    }

    onUpdate(step.id, {
      ...step,
      content: content.trim(),
      timing: timing.trim() || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(step.content);
    setTiming(step.timing || '');
    setIsEditing(false);
  };

  const formatIngredients = (stepIngredients) => {
    if (!stepIngredients || stepIngredients.length === 0 || !ingredients) return null;
    
    return stepIngredients.map((ingredientRef, index) => {
      let displayText = '';
      
      try {
        // Handle new ingredient tracking format
        if (ingredientRef && typeof ingredientRef === 'object' && ingredientRef.text) {
          // New format with tracking info
          if (ingredientRef.isFirstMention) {
            // Show full text with amount on first mention
            displayText = ingredientRef.text || ingredientRef.fullText || 'Unknown ingredient';
          } else {
            // Show only ingredient name on subsequent mentions
            displayText = ingredientRef.text || 'Unknown ingredient';
          }
        } else if (typeof ingredientRef === 'string' && ingredientRef.startsWith('ing-')) {
          // Legacy format - ingredient ID
          const ingredient = ingredients.find(ing => ing.id === ingredientRef);
          if (!ingredient) return null;
          
          displayText = ingredient.structured?.ingredient?.name || 
                       ingredient.displayText || 
                       ingredient.originalText || 
                       ingredientRef;
        } else if (typeof ingredientRef === 'string') {
          // Text-based ingredient
          displayText = ingredientRef;
        } else {
          // Unknown format - skip
          return null;
        }
        
        if (!displayText) return null;
        
        // Ensure displayText is always a string to prevent React child errors
        const safeDisplayText = typeof displayText === 'string' ? displayText : String(displayText || 'Unknown ingredient');
        
        // Additional safety check for event objects
        if (safeDisplayText && typeof safeDisplayText === 'object' && safeDisplayText.nativeEvent) {
          console.error('❌ Event object detected in ingredient display text!');
          console.error('IngredientRef:', ingredientRef);
          return null;
        }
        
        return (
          <Text key={index} style={styles.ingredient}>
            • {String(safeDisplayText)}
          </Text>
        );
      } catch (error) {
        console.warn('Error formatting ingredient:', error);
        return null;
      }
    }).filter(Boolean);
  };




  const updateTimingInSentenceLocal = (sentenceIndex, newTimeInMinutes) => {
    const sentences = splitIntoSentences(step.content);
    const sentence = sentences[sentenceIndex];
    
    // Use the utility function to update timing
    const newSentence = updateTimingInSentence(sentence, newTimeInMinutes);
    
    if (newSentence === sentence) return; // No timing found
    
    // Update the sentences array
    const newSentences = [...sentences];
    newSentences[sentenceIndex] = newSentence;
    
    // Update the content
    const newContent = newSentences.join(' ');
    setContent(newContent);
    
    // Update timing controls state
    setTimingControls(prev => ({
      ...prev,
      [sentenceIndex]: newTimeInMinutes
    }));
  };

  const adjustTiming = (sentenceIndex, delta) => {
    const sentences = splitIntoSentences(step.content);
    const sentence = sentences[sentenceIndex];
    const timingInfo = detectTiming(sentence);
    
    if (!timingInfo) return;
    
    const currentTime = timingControls[sentenceIndex] || timingInfo.timeInMinutes;
    const newTime = clampTimeValue(currentTime + delta, 1, 480); // 1 min to 8 hours
    
    updateTimingInSentenceLocal(sentenceIndex, newTime);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={styles.topSection}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          
          <View style={styles.actions}>
            {!isEditing && (
              <TouchableOpacity 
                onPress={() => setIsEditing(true)}
                style={styles.actionButton}
              >
                <Ionicons name="pencil" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {!isEditing && (
          <View style={styles.reorderControls}>
            {!isFirst && (
              <TouchableOpacity 
                onPress={() => onReorder(index, index - 1)}
                style={styles.reorderButton}
              >
                <Ionicons name="chevron-up" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            
            {!isLast && (
              <TouchableOpacity 
                onPress={() => onReorder(index, index + 1)}
                style={styles.reorderButton}
              >
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.stepInfo}>
            {step.timing && (
              <Text style={styles.timing}>{step.timing}</Text>
            )}
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Enter step instructions..."
              placeholderTextColor={colors.textSecondary}
              multiline
              autoFocus
            />
            
            <TextInput
              style={styles.timingInput}
              value={timing}
              onChangeText={setTiming}
              placeholder="Timing (e.g., 5 minutes)"
              placeholderTextColor={colors.textSecondary}
            />
            
            <View style={styles.editActions}>
              <TouchableOpacity 
                onPress={handleCancel}
                style={[styles.editButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => onDelete(step.id)}
                style={styles.deleteIconButton}
              >
                <Ionicons name="trash" size={16} color={colors.error} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSave}
                style={[styles.editButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.displayContent}>
            <View style={styles.sentencesContainer}>
              {splitIntoSentences(step.content).map((sentence, sentenceIndex) => {
                const timingInfo = detectTiming(sentence);
                const currentTime = timingControls[sentenceIndex] || timingInfo?.timeInMinutes;
                
                return (
                  <View key={sentenceIndex} style={styles.sentenceWithTiming}>
                    <Text style={styles.stepText}>
                      {sentence}
                    </Text>
                    
                    {timingInfo && (
                      <View style={styles.timingControlsContainer}>
                        <TouchableOpacity 
                          style={styles.timingButton}
                          onPress={() => adjustTiming(sentenceIndex, -1)}
                        >
                          <Ionicons name="remove" size={16} color={colors.text} />
                        </TouchableOpacity>
                        
                        <TextInput
                          style={styles.timingControlInput}
                          value={currentTime?.toString() || ''}
                          onChangeText={(value) => {
                            const numValue = parseInt(value) || 1;
                            updateTimingInSentenceLocal(sentenceIndex, numValue);
                          }}
                          keyboardType="numeric"
                          placeholder="0"
                        />
                        
                        <TouchableOpacity 
                          style={styles.timingButton}
                          onPress={() => adjustTiming(sentenceIndex, 1)}
                        >
                          <Ionicons name="add" size={16} color={colors.text} />
                        </TouchableOpacity>
                        
                        <Text style={styles.timerLabel}>timer</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            
            {step.ingredients && step.ingredients.length > 0 && (
              <View style={styles.ingredientsContainer}>
                {formatIngredients(step.ingredients)}
              </View>
            )}
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...commonStyles.shadow,
    alignItems: 'flex-start',
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: 12,
    justifyContent: 'flex-start',
  },
  topSection: {
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumberText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timing: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
  },
  deleteButton: {
    marginBottom: 'auto',
  },
  deleteIconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayContent: {
    marginBottom: 8,
  },
  sentencesContainer: {
    gap: 6,
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  ingredientsContainer: {
    marginTop: 8,
    paddingLeft: 8,
  },
  ingredient: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  editForm: {
    marginBottom: 8,
  },
  contentInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    backgroundColor: colors.background,
    minHeight: 60,
    marginBottom: 8,
  },
  timingInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  saveButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  reorderControls: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
    marginTop: 12,
  },
  reorderButton: {
    padding: 4,
  },
  sentenceWithTiming: {
    marginBottom: 6,
  },
  timingControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 16,
    gap: 8,
  },
  timingButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timingControlInput: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'center',
    minWidth: 50,
    color: colors.text,
  },
  timerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 4,
  },
});