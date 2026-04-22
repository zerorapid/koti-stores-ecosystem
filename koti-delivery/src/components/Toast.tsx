import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Bell } from 'lucide-react-native';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, limit } from 'firebase/firestore';

const ToastContext = createContext({
  showToast: (message: string) => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  // Cloud Notification Listener
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.forEach(async (change) => {
        const data = change.data();
        showToast(data.message || 'New order assigned!');
        
        // Mark as read immediately to avoid double-firing
        await updateDoc(doc(db, 'notifications', change.id), { read: true });
      });
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const showToast = (msg: string) => {
    setMessage(msg);
    setVisible(true);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
          <View style={styles.iconBox}>
            <Bell size={18} color="#fff" />
          </View>
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#111',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconBox: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FF6B00',
    justifyContent: 'center', alignItems: 'center'
  },
  text: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
