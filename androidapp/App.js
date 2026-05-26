import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signIn } from './src/firebase';
import AddScreen from './src/screens/AddScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProgressScreen from './src/screens/ProgressScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ route, color, size }) {
  const icons = {
    Add: 'add-circle-outline',
    History: 'time-outline',
    Progress: 'stats-chart-outline',
  };
  return <Ionicons name={icons[route.name]} size={size} color={color} />;
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    signIn().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <ActivityIndicator size="large" color="#7C6FFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: (props) => <TabIcon route={route} {...props} />,
          tabBarActiveTintColor: '#7C6FFF',
          tabBarInactiveTintColor: '#444',
          tabBarStyle: {
            backgroundColor: '#0a0a0a',
            borderTopColor: '#1a1a1a',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
          headerBackground: () => (
            <LinearGradient
              colors={['#0a0a0a', '#0d0d0d']}
              style={{ flex: 1 }}
            />
          ),
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
          headerStyle: { backgroundColor: '#0a0a0a' },
        })}
      >
        <Tab.Screen name="Add" component={AddScreen} options={{ title: 'Добавить' }} />
        <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'История' }} />
        <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'Прогресс' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
