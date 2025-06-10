import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { navigationRef } from '../services/NavigationService';

import WelcomeScreen from '../screens/WelcomeScreen';
import RecipesScreen from '../screens/RecipesScreen';
import AdminScreen from '../screens/AdminScreen';
import IngredientListScreen from '../screens/IngredientListScreen';
import ParsingTrainingScreen from '../screens/ParsingTrainingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import EditRecipeScreen from '../screens/EditRecipeScreen';
import CookRecipeScreen from '../screens/CookRecipeScreen';
import CookingFlowScreen from '../screens/CookingFlowScreen';
import VectorDemo from '../components/VectorDemo';
import CookingSessionDemo from '../components/CookingSessionDemo';
import CookingSessionTest from '../components/CookingSessionTest';
import CookingContextTest from '../components/CookingContextTest';
import CookingIndicator from '../components/CookingIndicator';
import CookingIndicatorDemo from '../components/CookingIndicatorDemo';
import IngredientTrackingDemo from '../components/IngredientTrackingDemo';
import { colors } from '../styles/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function RecipesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="RecipesList" 
        component={RecipesScreen}
        options={{ title: 'Recipes' }}
      />
      <Stack.Screen 
        name="AddRecipe" 
        component={AddRecipeScreen}
        options={{ title: 'Add Recipe' }}
      />
      <Stack.Screen 
        name="EditRecipe" 
        component={EditRecipeScreen}
        options={{ title: 'Edit Recipe' }}
      />
      <Stack.Screen 
        name="CookRecipe" 
        component={CookRecipeScreen}
        options={{ title: 'Cook Recipe' }}
      />
      <Stack.Screen 
        name="CookingFlow" 
        component={CookingFlowScreen}
        options={{ title: 'Cooking' }}
      />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="AdminHome" 
        component={AdminScreen}
        options={{ title: 'Admin' }}
      />
      <Stack.Screen 
        name="IngredientList" 
        component={IngredientListScreen}
        options={{ title: 'Ingredient Database' }}
      />
      <Stack.Screen 
        name="ParsingTraining" 
        component={ParsingTrainingScreen}
        options={{ title: 'Parsing Training' }}
      />
      <Stack.Screen 
        name="VectorDemo" 
        component={VectorDemo}
        options={{ title: 'Vector Search Demo' }}
      />
      <Stack.Screen 
        name="CookingDemo" 
        component={CookingSessionDemo}
        options={{ title: 'Cooking Session Demo' }}
      />
      <Stack.Screen 
        name="CookingTest" 
        component={CookingSessionTest}
        options={{ title: 'Cooking Session Tests' }}
      />
      <Stack.Screen 
        name="ContextTest" 
        component={CookingContextTest}
        options={{ title: 'Context Debug Test' }}
      />
      <Stack.Screen 
        name="IndicatorDemo" 
        component={CookingIndicatorDemo}
        options={{ title: 'Cooking Indicator Demo' }}
      />
      <Stack.Screen 
        name="IngredientTrackingDemo" 
        component={IngredientTrackingDemo}
        options={{ title: 'Ingredient Learning Demo' }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Recipes') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false, // Hide header for tab navigator since stacks have their own
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={WelcomeScreen}
        options={{ 
          title: 'Chef Flow',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.surface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen 
        name="Recipes" 
        component={RecipesStack}
        options={{ title: 'Recipes' }}
      />
      <Tab.Screen 
        name="Admin" 
        component={AdminStack}
        options={{ title: 'Admin' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.surface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Tab.Navigator>
  );
}

// Wrapper component that has access to navigation context
function AppContent() {
  const navigation = useNavigation();
  
  return (
    <View style={{ flex: 1 }}>
      <TabNavigator />
      <CookingIndicator navigation={navigation} />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <AppContent />
    </NavigationContainer>
  );
}