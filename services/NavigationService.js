import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function navigateToCookingFlow(recipe, stepIndex = 0) {
  if (navigationRef.isReady()) {
    // Navigate to the cooking flow screen
    navigationRef.navigate('Recipes', {
      screen: 'CookingFlow',
      params: { recipe, initialStepIndex: stepIndex }
    });
  }
}

export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}