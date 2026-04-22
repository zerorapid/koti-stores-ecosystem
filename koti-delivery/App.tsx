import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './src/firebase';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import OrderListScreen from './src/screens/OrderListScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import StatsScreen from './src/screens/StatsScreen';
import SupportScreen from './src/screens/SupportScreen';
import { ToastProvider } from './src/components/Toast';

import * as Location from 'expo-location';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { registerForPushNotificationsAsync } from './src/utils/notificationHelper';

// Safe notification setup (Temporarily disabled to prevent crash on old builds)
/*
try {
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.log('Notifications not available in this build');
}
*/

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = React.useRef<any>();
  const responseListener = React.useRef<any>();

  useEffect(() => {
    const unsubscribe = mobileAuth().onAuthStateChanged((u) => {
      setUser(u as any);
      if (initializing) setInitializing(false);
    });

    // Live Tracking Loop
    let locationInterval: NodeJS.Timeout;
    const startTracking = async () => {
      // Small delay to let the system breathe
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          return;
        }

        locationInterval = setInterval(async () => {
          const currentUser = mobileAuth().currentUser;
          // STRICT GUARD: Use fresh native user for the interval
          if (currentUser && !currentUser.isAnonymous) {
            try {
              const loc = await Location.getCurrentPositionAsync({ 
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 5000 
              });
              
              const driverRef = doc(db, 'riders', currentUser.uid);
              await setDoc(driverRef, {
                lastLocation: {
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude,
                  updatedAt: Date.now()
                }
              }, { merge: true });
            } catch (err) {
              console.log('Tracking tick failed:', err);
            }
          }
        }, 60000); 
      } catch (e) {
        console.log('Tracking init failed:', e);
      }
    };

    // Push Notifications Setup (Temporarily disabled)
    /*
    registerForPushNotificationsAsync().then(token => {
      if (token) setExpoPushToken(token);
    });

    try {
      const Notifications = require('expo-notifications');
      notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
        console.log('Notification Received:', notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
        console.log('Notification Clicked:', response);
      });
    } catch (e) {
      console.log('Listeners skipped: Notifications module not ready');
    }
    */

    startTracking();

    return () => {
      unsubscribe();
      if (locationInterval) clearInterval(locationInterval);
      
      /*
      try {
        const Notifications = require('expo-notifications');
        if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
        if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
      } catch (e) {
        // Safe to ignore
      }
      */
    };
  }, []);

  // Update token in Firestore when user is logged in
  useEffect(() => {
    if (user && expoPushToken) {
      const driverRef = doc(db, 'riders', user.uid);
      updateDoc(driverRef, {
        pushToken: expoPushToken,
        updatedAt: Date.now()
      }).catch(err => console.log('Failed to save push token:', err));
    }
  }, [user, expoPushToken]);

  if (initializing) return null; // Or a splash screen

  return (
    <ToastProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {user ? (
            <>
              <Stack.Screen name="OrderList" component={OrderListScreen} />
              <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
              <Stack.Screen name="Stats" component={StatsScreen} />
              <Stack.Screen name="Support" component={SupportScreen} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
  );
}
