import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { commonStyles } from '../styles/common';

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

  const formatIngredients = (stepIngredientIds) => {
    if (!stepIngredientIds || stepIngredientIds.length === 0 || !ingredients) return null;
    
    return stepIngredientIds.map((ingredientId, index) => {
      const ingredient = ingredients.find(ing => ing.id === ingredientId);
      if (!ingredient) return null;
      
      const displayName = ingredient.structured?.ingredient?.name || 
                         ingredient.displayText || 
                         ingredient.originalText || 
                         ingredientId;
      
      return (
        <Text key={index} style={styles.ingredient}>
          • {displayName}
        </Text>
      );
    }).filter(Boolean);
  };

  const getStepTypeIcon = () => {
    const content = (step.content || '').toLowerCase();
    if (content.includes('prep') || content.includes('chop') || content.includes('slice')) {
      return 'restaurant';
    }
    if (content.includes('heat') || content.includes('cook') || content.includes('bake')) {
      return 'flame';
    }
    if (content.includes('mix') || content.includes('stir') || content.includes('combine')) {
      return 'refresh';
    }
    return 'ellipse';
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

  const updateTimingInSentence = (sentenceIndex, newTimeInMinutes) => {
    const sentences = splitIntoSentences(step.content);
    const sentence = sentences[sentenceIndex];
    const timingInfo = detectTiming(sentence);
    
    if (!timingInfo) return;
    
    // Convert minutes back to appropriate unit
    let displayTime, displayUnit;
    if (newTimeInMinutes >= 60 && newTimeInMinutes % 60 === 0) {
      displayTime = newTimeInMinutes / 60;
      displayUnit = displayTime === 1 ? 'hour' : 'hours';
    } else {
      displayTime = newTimeInMinutes;
      displayUnit = displayTime === 1 ? 'minute' : 'minutes';
    }
    
    // Replace the timing in the sentence
    const newSentence = sentence.replace(timingInfo.fullMatch, 
      `${timingInfo.beforeTime}${displayTime} ${displayUnit}`);
    
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
    const newTime = Math.max(1, currentTime + delta);
    
    updateTimingInSentence(sentenceIndex, newTime);
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{index + 1}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.stepInfo}>
            <Ionicons 
              name={getStepTypeIcon()} 
              size={16} 
              color={colors.primary} 
              style={styles.stepIcon}
            />
            {step.timing && (
              <Text style={styles.timing}>{step.timing}</Text>
            )}
          </View>
          
          <View style={styles.actions}>
            {!isEditing && (
              <>
                <TouchableOpacity 
                  onPress={() => setIsEditing(true)}
                  style={styles.actionButton}
                >
                  <Ionicons name="pencil" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => onAddAfter(index)}
                  style={styles.actionButton}
                >
                  <Ionicons name="add" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => onDelete(step.id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash" size={16} color={colors.error} />
                </TouchableOpacity>
              </>
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
                            updateTimingInSentence(sentenceIndex, numValue);
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
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    marginRight: 8,
  },
  timing: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
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
    flexDirection: 'row',
    gap: 4,
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