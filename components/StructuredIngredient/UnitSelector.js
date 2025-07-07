/**
 * UnitSelector Component
 * 
 * Alternative unit selection using TouchableOpacity and Modal for better cross-platform support
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { MEASUREMENT_UNITS } from '../../utils/ingredientFormatting';

export const UnitSelector = ({ 
  value, 
  onValueChange,
  style
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectedUnit = MEASUREMENT_UNITS.find(u => u.value === value) || MEASUREMENT_UNITS[0];
  
  const handleSelect = (unitValue) => {
    // Ensure we only pass string values, not event objects
    if (typeof unitValue === 'string' && unitValue.trim()) {
      onValueChange(unitValue);
    } else {
      console.warn('Invalid unit value passed to UnitSelector:', unitValue);
    }
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        style={[styles.selector, style]}
      >
        <Text style={styles.selectorText}>{selectedUnit.label}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Unit</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {MEASUREMENT_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.option,
                    unit.value === value && styles.selectedOption
                  ]}
                  onPress={() => handleSelect(unit.value)}
                >
                  <Text style={[
                    styles.optionText,
                    unit.value === value && styles.selectedOptionText
                  ]}>
                    {unit.label}
                  </Text>
                  {unit.value === value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
  },
  selectorText: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
  },
  optionsList: {
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOption: {
    backgroundColor: `${colors.primary}10`,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
    fontSize: 16,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});