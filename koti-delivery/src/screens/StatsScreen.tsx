import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, 
  ScrollView, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Colors, Radii, Shadows, Typography, Spacing } from '../theme';
import { 
  ArrowLeft, TrendingUp, PackageCheck, 
  Clock, Wallet, Calendar 
} from 'lucide-react-native';

export default function StatsScreen({ navigation }: any) {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedDeliveries: 0,
    activeDeliveries: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, 'orders'),
        where('driverId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      let earnings = 0;
      let completed = 0;
      let active = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'Delivered') {
          completed++;
          // Same formula as OrderListScreen: 5% of total + 40
          earnings += Math.round((data.total || 0) * 0.05 + 40);
        } else if (data.status !== 'Cancelled') {
          active++;
        }
      });

      setStats({
        totalEarnings: earnings,
        completedDeliveries: completed,
        activeDeliveries: active,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Icon size={24} color={color} />
      </View>
      <View>
        <Text style={styles.statLabel}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Performance</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Payout Card */}
          <View style={styles.payoutCard}>
            <View>
              <Text style={styles.payoutLabel}>Total Payout Balance</Text>
              <Text style={styles.payoutValue}>₹{stats.totalEarnings.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.withdrawBtn}>
              <Wallet size={18} color="#fff" />
              <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Overview</Text>
          
          <View style={styles.grid}>
            <StatCard 
              title="Deliveries" 
              value={stats.completedDeliveries} 
              icon={PackageCheck} 
              color={Colors.success} 
            />
            <StatCard 
              title="Active" 
              value={stats.activeDeliveries} 
              icon={TrendingUp} 
              color={Colors.primary} 
            />
          </View>

          <View style={styles.infoCard}>
            <Calendar size={20} color={Colors.textTertiary} />
            <Text style={styles.infoText}>
              Statistics are updated every 24 hours. Last sync: Just now.
            </Text>
          </View>

          {/* Dummy List of Recent Payouts */}
          <Text style={styles.sectionTitle}>Recent Settlements</Text>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.settlementRow}>
              <View style={styles.settlementInfo}>
                <Text style={styles.settlementDate}>April {20 - i}, 2026</Text>
                <Text style={styles.settlementStatus}>Direct Deposit</Text>
              </View>
              <Text style={styles.settlementAmount}>+₹1,450</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  backBtn: {
    padding: 8,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  payoutCard: {
    backgroundColor: Colors.black,
    borderRadius: Radii.xl,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    ...Shadows.lg,
  },
  payoutLabel: {
    color: '#ffffffaa',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  payoutValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  withdrawBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.lg,
  },
  withdrawText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...Shadows.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: Radii.lg,
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: Radii.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settlementInfo: {
    gap: 2,
  },
  settlementDate: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  settlementStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.success,
  },
});
