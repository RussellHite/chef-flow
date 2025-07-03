import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const commonStyles = StyleSheet.create({
  // Base containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  safeArea: {
    flex: 1,
    paddingTop: 50,
  },
  
  // Cook RHYTHM Layout System
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 128, // Space for bottom navigation and active cooking bar
  },
  
  sectionPadding: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Headers
  headerContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Status indicators
  successIndicator: {
    backgroundColor: colors.success,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  warningIndicator: {
    backgroundColor: colors.warning,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  // Shadows (enhanced)
  shadow: {
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  shadowMedium: {
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  
  // Spacing utilities
  marginSmall: { margin: 8 },
  marginMedium: { margin: 16 },
  marginLarge: { margin: 24 },
  
  paddingSmall: { padding: 8 },
  paddingMedium: { padding: 16 },
  paddingLarge: { padding: 24 },
  
  // Legacy styles (for gradual migration)
  legacy: {
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    shadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
});