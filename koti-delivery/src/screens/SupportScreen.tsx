import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { collection, addDoc, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Colors, Radii, Shadows } from '../theme';
import { Send, ChevronLeft, Headset, MessageSquare } from 'lucide-react-native';

export default function SupportScreen({ navigation }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'rider_support'),
      where('riderId', '==', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const user = auth.currentUser;
    if (!user) return;

    const text = inputText;
    setInputText('');

    await addDoc(collection(db, 'rider_support'), {
      riderId: user.uid,
      riderName: user.displayName || 'Rider',
      text: text,
      sender: 'rider',
      createdAt: Date.now()
    });
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View style={[
      styles.messageWrapper,
      item.sender === 'rider' ? styles.riderWrapper : styles.adminWrapper
    ]}>
      <View style={[
        styles.messageBubble,
        item.sender === 'rider' ? styles.riderBubble : styles.adminBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'rider' ? styles.riderText : styles.adminText
        ]}>{item.text}</Text>
        <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
             <Headset size={20} color={Colors.primary} />
             <Text style={styles.headerTitle}>Admin Support</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color={Colors.textTertiary} opacity={0.2} />
              <Text style={styles.emptyTitle}>How can we help?</Text>
              <Text style={styles.emptySub}>Message the Master Admin for any issues with deliveries or payments.</Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  backBtn: { padding: 8, borderRadius: Radii.lg, backgroundColor: '#F3F4F6' },
  listContent: { padding: 16, paddingBottom: 24 },
  messageWrapper: { marginBottom: 12, flexDirection: 'row' },
  riderWrapper: { justifyContent: 'flex-end' },
  adminWrapper: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, ...Shadows.sm },
  riderBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  adminBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  messageText: { fontSize: 15, fontWeight: '600' },
  riderText: { color: '#fff' },
  adminText: { color: Colors.text },
  timeText: { fontSize: 9, fontWeight: '700', color: 'rgba(0,0,0,0.3)', marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: Radii.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: Colors.text,
  },
  sendBtn: {
    width: 46,
    height: 46,
    backgroundColor: Colors.primary,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginTop: 16 },
  emptySub: { fontSize: 13, color: Colors.textTertiary, textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
