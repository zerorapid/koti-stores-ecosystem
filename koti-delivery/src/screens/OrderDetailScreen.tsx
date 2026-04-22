import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, SafeAreaView, Linking, Alert,
  Platform
} from 'react-native';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth, mobileAuth } from '../firebase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Colors, Radii, Shadows, Typography } from '../theme';
import { 
  ArrowLeft, MapPin, Phone, MessageSquare, 
  Navigation, CheckCircle, Package, Truck, Camera, 
  X, Image as ImageIcon
} from 'lucide-react-native';

export default function OrderDetailScreen({ route, navigation }: any) {
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'orders', initialOrder.id), (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() });
      }
    });
    return () => unsub();
  }, [initialOrder.id]);

  const currentStatus = order.status;
  const currentDriverId = order.driverId;

  const handleNavigate = () => {
    const address = order.address?.line1 || '';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open maps.");
    });
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera access to take a delivery photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.2, // Low quality for small Base64 size
    });

    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    // 1. Resize image to ensure small Base64 size (Firestore limit 1MB)
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    
    return `data:image/jpeg;base64,${manipulatedImage.base64}`;
  };

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirm = async () => {
    if (!proofImage) {
      Alert.alert('Proof Required', 'Please take a photo of the delivery first.');
      return;
    }

    setIsUpdating(true);
    try {
      const base64Photo = await uploadImage(proofImage);
      
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'Delivered',
        deliveredAt: Date.now(),
        deliveryProof: base64Photo, // Saved as text in Firestore
      });

      Alert.alert('Success', 'Delivery confirmed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Delivery Confirm Error:', error);
      Alert.alert('Error', `Failed to update delivery status: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClaim = async () => {
    const user = mobileAuth().currentUser;
    if (!user) return;

    setIsUpdating(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        driverId: user.uid,
        updatedAt: Date.now()
      });
      Alert.alert("Success", "You have claimed this order!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not claim order.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Customer Information</Text>
          <Text style={styles.customerName}>{order.userName || 'Koti Customer'}</Text>
          
          <View style={styles.addressBox}>
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.addressText}>{order.address?.line1 || 'No address'}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]}>
              <Phone size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]}>
              <MessageSquare size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Card */}
        <TouchableOpacity style={styles.navCard} onPress={handleNavigate}>
          <View style={styles.navInfo}>
            <Navigation size={24} color="#fff" />
            <View>
              <Text style={styles.navTitle}>Start Navigation</Text>
              <Text style={styles.navSubtitle}>Open in Google Maps / Waze</Text>
            </View>
          </View>
          <CheckCircle size={20} color="#ffffff88" />
        </TouchableOpacity>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Package Details</Text>
          <View style={styles.itemRow}>
            <Package size={16} color={Colors.textTertiary} />
            <Text style={styles.itemCount}>{order.items?.length || 0} Items in Bag</Text>
          </View>
          
          {order.items?.map((item: any, index: number) => (
            <View key={index} style={styles.productItem}>
              <Text style={styles.productQty}>{item.quantity}x</Text>
              <Text style={styles.productName}>{item.name}</Text>
            </View>
          ))}
        </View>

        {/* Payment Card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Payment Information</Text>
          <View style={styles.paymentBox}>
            <Text style={styles.paymentMethod}>
              {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '📱 Paid via UPI'}
            </Text>
            <Text style={styles.paymentTotal}>₹{order.total}</Text>
          </View>
        </View>

        {/* Status Actions */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionLabel}>Update Progress</Text>
          
          {/* Always show Claim if unassigned or assigned to current user but not started */}
          {(!currentDriverId || currentDriverId === 'Unassigned') ? (
            <TouchableOpacity 
              style={[styles.statusMainBtn, { backgroundColor: Colors.black }]}
              onPress={handleClaim}
              disabled={isUpdating}
            >
              <Package size={20} color="#fff" />
              <Text style={styles.statusBtnText}>Claim this Order</Text>
            </TouchableOpacity>
          ) : (
            <>
              {(currentStatus === 'pending' || currentStatus === 'Processing') && (
                <TouchableOpacity 
                  style={[styles.statusMainBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => updateStatus('Out for Delivery')}
                  disabled={isUpdating}
                >
                  <Truck size={20} color="#fff" />
                  <Text style={styles.statusBtnText}>Mark as Picked Up</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {currentStatus === 'Out for Delivery' && (
            <View>
              {proofImage ? (
                <View style={styles.proofPreview}>
                  <View style={styles.previewImageContainer}>
                    <View style={styles.imagePlaceholder}>
                      <ImageIcon size={40} color={Colors.textTertiary} />
                      <Text style={styles.photoText}>Photo Captured</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.retakeBtn}
                    onPress={() => setProofImage(null)}
                  >
                    <X size={16} color="#fff" />
                    <Text style={styles.retakeText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.statusMainBtn, { backgroundColor: Colors.warning, marginBottom: 12 }]}
                  onPress={takePhoto}
                  disabled={isUpdating}
                >
                  <Camera size={20} color="#fff" />
                  <Text style={styles.statusBtnText}>Take Delivery Photo</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.statusMainBtn, { backgroundColor: Colors.success }]}
                onPress={handleConfirm}
                disabled={isUpdating}
              >
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.statusBtnText}>Confirm Delivery</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentStatus === 'Delivered' && (
            <View style={styles.completedBadge}>
              <CheckCircle size={24} color={Colors.success} />
              <Text style={styles.completedText}>Delivery Completed</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: Radii.xl,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  customerName: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 12,
  },
  addressBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: Radii.lg,
    marginBottom: 20,
  },
  paymentBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: Radii.lg,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  paymentTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: Radii.lg,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  navCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.xl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    ...Shadows.md,
  },
  navInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  navSubtitle: {
    color: '#ffffffaa',
    fontSize: 12,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  productItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  productQty: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  statusSection: {
    paddingBottom: 40,
  },
  statusMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
    borderRadius: Radii.xl,
    ...Shadows.md,
  },
  statusBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    backgroundColor: Colors.success + '11',
    borderRadius: Radii.xl,
    borderWidth: 2,
    borderColor: Colors.success + '33',
  },
  completedText: {
    color: Colors.success,
    fontSize: 18,
    fontWeight: '900',
  },
  proofPreview: {
    backgroundColor: '#fff',
    borderRadius: Radii.xl,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    position: 'relative',
  },
  previewImageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: Colors.surfaceGray,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
  },
  retakeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: Colors.overlay,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  retakeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
