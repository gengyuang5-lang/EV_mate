/**
 * 应用导航配置
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import AlertScreen from '../screens/AlertScreen';
import HelpScreen from '../screens/HelpScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EscapeRouteScreen from '../screens/EscapeRouteScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EscapeRoute" 
      component={EscapeRouteScreen}
      options={{ title: '逃生路线' }}
    />
  </Stack.Navigator>
);

const AlertStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AlertMain" 
      component={AlertScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Alerts') {
            iconName = 'warning';
          } else if (route.name === 'Help') {
            iconName = 'help';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          } else if (route.name === 'EscapeRoute') {
            iconName = 'directions-run';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: t('home') }}
      />
      <Tab.Screen 
        name="Alerts" 
        component={AlertStack}
        options={{ title: t('alerts') }}
      />
      <Tab.Screen 
        name="Help" 
        component={HelpScreen}
        options={{ title: t('help') }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: t('settings') }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;

