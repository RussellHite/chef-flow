/**
 * CookingIndicator Component Tests
 * 
 * Unit tests for the sticky cooking progress indicator
 * Tests visibility, display data, animations, and interactions
 * 
 * GitHub Issue #7: Sticky Cooking Progress Indicator
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import CookingIndicator from '../CookingIndicator';
import { useCookingSession } from '../../hooks/useCookingSession';

// Mock the hooks and dependencies
jest.mock('../../hooks/useCookingSession');
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 34 }),
}));
jest.mock('../../utils/cookingSessionUtils', () => ({
  formatTimerDisplay: (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },
}));

// Mock colors and typography
jest.mock('../../styles/colors', () => ({
  colors: {
    surface: '#FFFFFF',
    primary: '#007AFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E5E5E5',
  },
}));

jest.mock('../../styles/typography', () => ({
  typography: {
    body: { fontSize: 16 },
    caption: { fontSize: 14 },
  },
}));

describe('CookingIndicator', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Dimensions mock
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 375,
      height: 812,
    });
  });

  describe('Visibility Logic', () => {
    it('should not render when no active cooking session', () => {
      useCookingSession.mockReturnValue({
        isActive: false,
        recipeName: '',
        currentStep: 0,
        totalSteps: 0,
        progress: 0,
        timer: { isActive: false },
      });

      const { queryByTestId } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      expect(queryByTestId('cooking-indicator')).toBeNull();
    });

    it('should render when active cooking session exists', async () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'Test Recipe',
        currentStep: 2,
        totalSteps: 5,
        progress: 40,
        timer: { isActive: false },
      });

      const { getByText } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Test Recipe')).toBeTruthy();
        expect(getByText('Step 2 of 5')).toBeTruthy();
      });
    });
  });

  describe('Display Data', () => {
    it('should show recipe name and step progress', async () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'Delicious Pasta',
        currentStep: 3,
        totalSteps: 6,
        progress: 50,
        timer: { isActive: false },
      });

      const { getByText } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Delicious Pasta')).toBeTruthy();
        expect(getByText('Step 3 of 6')).toBeTruthy();
      });
    });

    it('should truncate long recipe names', async () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'This is a very long recipe name that should be truncated for display',
        currentStep: 1,
        totalSteps: 3,
        progress: 33,
        timer: { isActive: false },
      });

      const { getByText } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      await waitFor(() => {
        const truncatedText = getByText(/This is a very long recipe/);
        expect(truncatedText.props.children).toContain('...');
      });
    });

    it('should show timer when active', async () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'Timer Recipe',
        currentStep: 1,
        totalSteps: 3,
        progress: 33,
        timer: {
          isActive: true,
          remainingTime: 125, // 2:05
        },
      });

      const { getByText } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Timer Recipe')).toBeTruthy();
        expect(getByText('2:05')).toBeTruthy();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adjust text length for small screens', async () => {
      // Mock small screen
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 350,
        height: 667,
      });

      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'This is a moderately long recipe name',
        currentStep: 1,
        totalSteps: 3,
        progress: 33,
        timer: { isActive: false },
      });

      const { getByText } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      await waitFor(() => {
        // Should truncate more aggressively on small screens
        const text = getByText(/This is a moderat/);
        expect(text.props.children).toContain('...');
      });
    });

    it('should handle screen dimension changes', () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'Test Recipe',
        currentStep: 1,
        totalSteps: 3,
        progress: 33,
        timer: { isActive: false },
      });

      const { rerender } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      // Change screen dimensions
      jest.spyOn(Dimensions, 'get').mockReturnValue({
        width: 320,
        height: 568,
      });

      // Re-render to trigger dimension change
      rerender(<CookingIndicator navigation={mockNavigation} />);

      // Component should handle the change gracefully
      expect(true).toBe(true); // No crash = success
    });
  });

  describe('Progress Bar', () => {
    it('should display correct progress percentage', async () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'Progress Test',
        currentStep: 2,
        totalSteps: 4,
        progress: 75,
        timer: { isActive: false },
      });

      const { getByTestId } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      await waitFor(() => {
        const progressBar = getByTestId('progress-bar-fill');
        expect(progressBar.props.style).toContainEqual({ width: '75%' });
      });
    });

    it('should handle zero progress', async () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'Zero Progress',
        currentStep: 0,
        totalSteps: 5,
        progress: 0,
        timer: { isActive: false },
      });

      const { getByTestId } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      await waitFor(() => {
        const progressBar = getByTestId('progress-bar-fill');
        expect(progressBar.props.style).toContainEqual({ width: '0%' });
      });
    });
  });

  describe('Navigation Integration', () => {
    it('should navigate to cooking screen when pressed', async () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'Nav Test Recipe',
        currentStep: 1,
        totalSteps: 3,
        progress: 33,
        timer: { isActive: false },
      });

      const { getByRole } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      await waitFor(() => {
        const indicator = getByRole('button');
        fireEvent.press(indicator);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Recipes', {
        screen: 'CookingFlow',
        params: {
          recipe: { title: 'Nav Test Recipe' },
          resumeSession: true,
        },
      });
    });

    it('should call custom onPress when provided', async () => {
      const mockOnPress = jest.fn();
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'Custom Press Test',
        currentStep: 1,
        totalSteps: 3,
        progress: 33,
        timer: { isActive: false },
      });

      const { getByRole } = render(
        <CookingIndicator navigation={mockNavigation} onPress={mockOnPress} />
      );

      await waitFor(() => {
        const indicator = getByRole('button');
        fireEvent.press(indicator);
      });

      expect(mockOnPress).toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility properties', async () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'Accessible Recipe',
        currentStep: 2,
        totalSteps: 4,
        progress: 50,
        timer: {
          isActive: true,
          remainingTime: 90, // 1:30
        },
      });

      const { getByRole } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      await waitFor(() => {
        const indicator = getByRole('button');
        expect(indicator.props.accessibilityLabel).toContain('Cooking Accessible Recipe');
        expect(indicator.props.accessibilityLabel).toContain('Step 2 of 4');
        expect(indicator.props.accessibilityLabel).toContain('timer 1:30');
        expect(indicator.props.accessibilityHint).toBe('Tap to return to cooking screen');
      });
    });

    it('should handle accessibility without timer', async () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'No Timer Recipe',
        currentStep: 1,
        totalSteps: 3,
        progress: 33,
        timer: { isActive: false },
      });

      const { getByRole } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      await waitFor(() => {
        const indicator = getByRole('button');
        expect(indicator.props.accessibilityLabel).toContain('Cooking No Timer Recipe');
        expect(indicator.props.accessibilityLabel).toContain('Step 1 of 3');
        expect(indicator.props.accessibilityLabel).not.toContain('timer');
      });
    });
  });

  describe('Animation Behavior', () => {
    it('should start with invisible state', () => {
      useCookingSession.mockReturnValue({
        isActive: false,
        recipeName: '',
        currentStep: 0,
        totalSteps: 0,
        progress: 0,
        timer: { isActive: false },
      });

      const { queryByTestId } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      expect(queryByTestId('cooking-indicator')).toBeNull();
    });

    it('should become visible when session starts', async () => {
      // Start with no session
      const { rerender } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      // Start a session
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'Animation Test',
        currentStep: 1,
        totalSteps: 3,
        progress: 33,
        timer: { isActive: false },
      });

      rerender(<CookingIndicator navigation={mockNavigation} />);

      await waitFor(() => {
        expect(getByText('Animation Test')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing navigation gracefully', async () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: 'No Nav Test',
        currentStep: 1,
        totalSteps: 3,
        progress: 33,
        timer: { isActive: false },
      });

      const { getByRole } = render(
        <CookingIndicator navigation={null} />
      );

      await waitFor(() => {
        const indicator = getByRole('button');
        // Should not crash when navigation is null
        fireEvent.press(indicator);
      });

      expect(true).toBe(true); // No crash = success
    });

    it('should handle malformed cooking session data', async () => {
      useCookingSession.mockReturnValue({
        isActive: true,
        recipeName: null,
        currentStep: null,
        totalSteps: null,
        progress: null,
        timer: null,
      });

      // Should not crash with malformed data
      const { container } = render(
        <CookingIndicator navigation={mockNavigation} />
      );

      expect(container).toBeTruthy();
    });
  });
});

// Helper function for test data
const createMockCookingSession = (overrides = {}) => ({
  isActive: true,
  recipeName: 'Test Recipe',
  currentStep: 1,
  totalSteps: 3,
  progress: 33,
  timer: { isActive: false },
  ...overrides,
});

export { createMockCookingSession };