import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, SafeAreaView, Alert } from 'react-native';
import { collection, query, onSnapshot, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Colors, Shadows, Radii, Typography } from '../theme';
import { Package, MapPin, ChevronRight, Truck, Clock, LogOut, TrendingUp, Headset } from 'lucide-react-native';
import { signOut } from 'firebase/auth';
import { sendLocalNotification } from '../utils/notificationHelper';

export default function OrderListScreen({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'available'>('my');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = mobileAuth().currentUser;
    if (!user) return;

    // Listen for orders assigned to this rider
    const qMy = query(
      collection(db, 'orders'),
      where('riderId', '==', user.uid)
    );

    const unsubscribeMy = onSnapshot(qMy, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    // Listen for available orders (Fetch all and filter locally for maximum stability)
    const qAvailable = query(collection(db, 'orders'));

    const unsubscribeAvailable = onSnapshot(qAvailable, (snapshot) => {
      const available = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        // Filter locally: Unassigned + Correct Status
        .filter(order => 
          !order.riderId && 
          ['pending', 'processing', 'Processing'].includes(order.status)
        )
        // Sort by date locally
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      setAvailableOrders(available);
      setIsLoading(false);
    }, (error) => {
      console.log('Firestore Error:', error);
      setIsLoading(false);
    });

    return () => {
      unsubscribeMy();
      unsubscribeAvailable();
    };
  }, []);

  const handleSignOut = () => {
    mobileAuth().signOut().catch(err => console.error(err));
  };

  const handleTestNotification = async () => {
    try {
      await sendLocalNotification(
        "📦 New Order Available!",
        "A new order from Banjara Hills is ready to be claimed.",
        { orderId: 'test-123' }
      );
      Alert.alert("Success", "Local notification triggered! Check your system tray.");
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      Alert.alert(
        "Notification Failed",
        "The notification system is not ready. Have you run 'npx expo run:android' yet?\n\nError: " + error.message
      );
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const statusColors: Record<string, string> = {
      'Pending': Colors.warning,
      'Processing': Colors.primary,
      'Out for Delivery': Colors.info,
      'Delivered': Colors.success,
    };

    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { order: item })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdBlock}>
            <Package size={16} color={Colors.primary} />
            <Text style={styles.orderId}>ORDER #{item.id.slice(-6).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] || Colors.primary) + '15' }]}>
            <Text style={[styles.statusText, { color: statusColors[item.status] || Colors.primary }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.userName || 'Koti Customer'}</Text>
          <View style={styles.addressRow}>
            <MapPin size={14} color={Colors.textTertiary} />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.address?.line1 || 'No address provided'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaInfo}>
            <Clock size={12} color={Colors.textTertiary} />
            <Text style={styles.metaText}>Placed {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>Payout</Text>
            <Text style={styles.priceValue}>₹{Math.round(item.total * 0.05 + 40)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.syncStatus}>
             <View style={styles.pulseDot} />
             <Text style={styles.syncText}>LIVE LOGISTICS SYNC</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Welcome back, {auth.currentUser?.displayName || 'Partner'}
          </Text>
          <Text style={styles.headerTitle}>Active Tasks</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.statsIcon, { marginRight: 8 }]} 
            onPress={() => navigation.navigate('Support')}
          >
            <Headset size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statsIcon, { marginRight: 8 }]} 
            onPress={() => navigation.navigate('Stats')}
          >
            <TrendingUp size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.statsIcon} onPress={handleSignOut}>
            <LogOut size={22} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>My Tasks ({orders.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>Available ({availableOrders.length})</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'my' ? orders : availableOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={Colors.textTertiary} opacity={0.3} />
            <Text style={styles.emptyText}>No tasks assigned yet.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => {}} tintColor={Colors.primary} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  syncStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  syncText: { fontSize: 8, fontWeight: '900', color: Colors.success, tracking: 1 },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  statsIcon: {
    padding: 10,
    backgroundColor: Colors.surfaceGray,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 14,
    marginRight: 24,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: Radii.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  customerInfo: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.success,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
});
