import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import WelcomeScreen from '../screens/WelcomeScreen';
import RecipesScreen from '../screens/RecipesScreen';
import AdminScreen from '../screens/AdminScreen';
import IngredientListScreen from '../screens/IngredientListScreen';
import ParsingTrainingScreen from '../screens/ParsingTrainingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';
import EditRecipeScreen from '../screens/EditRecipeScreen';
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

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}