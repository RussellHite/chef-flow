/**
 * ConfidenceIndicator Component
 * 
 * Simple colored badge to show parsing confidence levels
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';

export const ConfidenceIndicator = ({ confidence, size = 'small' }) => {
  // Don't show indicator for missing or very low confidence
  if (!confidence || confidence < 10) {
    return null;
  }

  // Determine color based on confidence level
  const getIndicatorColor = (score) => {
    if (score >= 80) return colors.success; // Green for high confidence
    if (score >= 50) return colors.warning; // Yellow for medium confidence
    return colors.error; // Red for low confidence
  };

  const getIndicatorSize = (size) => {
    switch (size) {
      case 'small':
        return 6;
      case 'medium':
        return 8;
      case 'large':
        return 10;
      default:
        return 6;
    }
  };

  const indicatorColor = getIndicatorColor(confidence);
  const indicatorSize = getIndicatorSize(size);

  return (
    <View 
      style={[
        styles.indicator, 
        { 
          backgroundColor: indicatorColor,
          width: indicatorSize,
          height: indicatorSize,
          borderRadius: indicatorSize / 2
        }
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  indicator: {
    marginLeft: 4,
    marginRight: 2,
    alignSelf: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});