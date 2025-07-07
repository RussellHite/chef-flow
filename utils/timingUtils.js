/**
 * Timing Utilities
 * 
 * Centralized timing-related functions to eliminate duplication
 * between CookingFlowScreen and StepEditor components
 */

// Timing pattern constants for detecting time references in text
export const TIMING_PATTERNS = [
  // "cook for 20 minutes", "bake for 1 hour", "simmer for 5-10 minutes"
  /(\w+\s+for\s+)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i,
  // "cook 20 minutes", "bake 30 mins"
  /(\w+\s+)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i,
  // "for 15 minutes", "for 1 hour"
  /(for\s+)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i,
  // "15 minutes", "1 hour" (standalone)
  /^(\s*)(\d+(?:-\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i
];

// Time unit conversion factors to minutes
export const TIME_UNITS = {
  second: 1/60,
  seconds: 1/60,
  sec: 1/60,
  secs: 1/60,
  minute: 1,
  minutes: 1,
  min: 1,
  mins: 1,
  hour: 60,
  hours: 60,
  hr: 60,
  hrs: 60
};

/**
 * Split text into sentences while preserving punctuation
 * Extracted from CookingFlowScreen.js and StepEditor.js
 */
export const splitIntoSentences = (text) => {
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

/**
 * Detect timing information in a sentence
 * Merged from both CookingFlowScreen.js and StepEditor.js
 */
export const detectTiming = (sentence) => {
  if (!sentence) return null;
  
  for (const pattern of TIMING_PATTERNS) {
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
      
      // Convert to minutes based on unit
      const unitKey = timeUnit.toLowerCase();
      const conversionFactor = TIME_UNITS[unitKey] || 1;
      timeInMinutes *= conversionFactor;
      
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

/**
 * Convert time value and unit to minutes
 */
export const convertTimeToMinutes = (value, unit) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const unitKey = unit?.toLowerCase() || 'minutes';
  const conversionFactor = TIME_UNITS[unitKey] || 1;
  return numValue * conversionFactor;
};

/**
 * Convert minutes to appropriate display format
 */
export const convertMinutesToDisplayFormat = (minutes) => {
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60;
    return {
      value: hours,
      unit: hours === 1 ? 'hour' : 'hours',
      display: `${hours} ${hours === 1 ? 'hour' : 'hours'}`
    };
  } else {
    return {
      value: minutes,
      unit: minutes === 1 ? 'minute' : 'minutes',
      display: `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
    };
  }
};

/**
 * Validate time value
 */
export const validateTimeValue = (value) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(numValue) && numValue > 0;
};

/**
 * Clamp time value within bounds
 */
export const clampTimeValue = (value, min = 1, max = 480) => { // max 8 hours
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return Math.max(min, Math.min(max, numValue));
};

/**
 * Update timing in a sentence text
 * Extracted from StepEditor.js
 */
export const updateTimingInSentence = (sentence, newTimeInMinutes) => {
  const timingInfo = detectTiming(sentence);
  
  if (!timingInfo) return sentence;
  
  // Convert minutes back to appropriate unit
  const displayFormat = convertMinutesToDisplayFormat(newTimeInMinutes);
  
  // Replace the timing in the sentence
  return sentence.replace(timingInfo.fullMatch, 
    `${timingInfo.beforeTime}${displayFormat.display}`);
};

/**
 * Calculate total remaining time from steps
 */
export const calculateRemainingTime = (steps, currentStepIndex = 0) => {
  if (!steps || steps.length === 0) return 0;
  
  let totalMinutes = 0;
  
  // Sum up timing from current step onwards
  for (let i = currentStepIndex; i < steps.length; i++) {
    const step = steps[i];
    
    // Check for explicit timing property first (legacy format)
    if (step.timing) {
      const timeMatch = step.timing.match(/(\d+)/);
      if (timeMatch) {
        totalMinutes += parseInt(timeMatch[1]);
      }
    }
    
    // Also check step content for embedded timing
    if (step.content) {
      const sentences = splitIntoSentences(step.content);
      sentences.forEach(sentence => {
        const timing = detectTiming(sentence);
        if (timing) {
          totalMinutes += timing.timeInMinutes;
        }
      });
    }
  }
  
  return totalMinutes;
};

/**
 * Calculate when cooking will be complete
 */
export const calculateReadyByTime = (remainingMinutes) => {
  if (!remainingMinutes || remainingMinutes <= 0) return null;
  
  const now = new Date();
  const readyTime = new Date(now.getTime() + (remainingMinutes * 60 * 1000));
  
  return {
    time: readyTime,
    formatted: readyTime.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  };
};

/**
 * Format duration for display (reusing existing textUtils pattern)
 */
export const formatTimingDuration = (minutes) => {
  if (!minutes || minutes === 0) return '';
  
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  
  if (remainingMins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${remainingMins}m`;
};

/**
 * Extract all timing information from step content
 */
export const extractStepTimings = (stepContent) => {
  if (!stepContent) return [];
  
  const sentences = splitIntoSentences(stepContent);
  const timings = [];
  
  sentences.forEach((sentence, index) => {
    const timing = detectTiming(sentence);
    if (timing) {
      timings.push({
        ...timing,
        sentenceIndex: index,
        sentence
      });
    }
  });
  
  return timings;
};

/**
 * Create timer configuration from timing info
 */
export const createTimerConfig = (timingInfo, stepId, stepIndex) => {
  if (!timingInfo) return null;
  
  return {
    id: `timer-${stepId}-${timingInfo.sentenceIndex || 0}`,
    stepId,
    stepIndex,
    sentenceIndex: timingInfo.sentenceIndex || 0,
    durationMinutes: timingInfo.timeInMinutes,
    durationMs: timingInfo.timeInMinutes * 60 * 1000,
    description: timingInfo.sentence,
    type: 'step-timing'
  };
};