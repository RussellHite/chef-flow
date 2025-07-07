/**
 * DropdownMenu Component
 * 
 * Reusable dropdown menu with consistent styling
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export const DropdownMenu = ({
  children,
  style,
  buttonStyle,
  menuStyle,
  triggerIcon = "ellipsis-vertical",
  triggerSize = 16,
  triggerColor = colors.textSecondary
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        onPress={() => setShowMenu(!showMenu)} 
        style={[styles.triggerButton, buttonStyle]}
      >
        <Ionicons name={triggerIcon} size={triggerSize} color={triggerColor} />
      </TouchableOpacity>
      
      {showMenu && (
        <View style={[styles.menu, menuStyle]}>
          {React.Children.map(children, (child, index) => 
            React.cloneElement(child, {
              key: index,
              onPress: (...args) => {
                if (child.props.onPress) {
                  child.props.onPress(...args);
                }
                setShowMenu(false);
              }
            })
          )}
        </View>
      )}
    </View>
  );
};

export const MenuItem = ({ 
  icon, 
  text, 
  onPress, 
  style,
  textStyle,
  iconColor = colors.primary,
  iconSize = 16
}) => (
  <TouchableOpacity onPress={onPress} style={[styles.menuItem, style]}>
    {icon && <Ionicons name={icon} size={iconSize} color={iconColor} />}
    <Text style={[styles.menuText, textStyle]}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  triggerButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: '100%',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    minWidth: 120,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  menuText: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
});